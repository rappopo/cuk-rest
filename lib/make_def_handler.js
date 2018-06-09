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
            status: status
          })
          ctx.body = formatError(err)
          ctx.app.emit('error', err, ctx)
        }
        ctx.response.status = status
      } catch (err) {
        let status = err.statusCode || err.status
        err.detail = { xx: 1 }
        ctx.body = formatError(err)
        ctx.app.emit('error', err, ctx)
        ctx.response.status = status
      }
    }
  }
}
