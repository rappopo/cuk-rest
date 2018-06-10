'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.lib
  const formatError = require('./format_error')(cuk)

  return () => {
    return async (ctx, next) => {
      try {
        await next()
        let status = ctx.status
        if (status === 404) {
          let err = helper('core:makeError')({
            msg: 'Resource not found',
            statusCode: status
          })
          ctx.body = _.omit(formatError(err, ctx), ['err'])
          ctx.app.emit('error', err, ctx)
        }
        ctx.response.status = status
      } catch (err) {
        let status = err.statusCode || err.status
        ctx.body = _.omit(err, ['err'])
        ctx.app.emit('error', err.err, ctx)
        ctx.response.status = status
      }
    }
  }
}
