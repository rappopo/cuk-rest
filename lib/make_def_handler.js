'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.lib
  const formatError = require('./format_error')(cuk)

  return () => {
    return async (ctx, next) => {
      try {
        await next()
        let status = ctx.status
        console.log('rest', ctx.status)
        if (status === 404) {
          let err = helper('core:makeError')({
            msg: 'Resource not found',
            statusCode: status
          })
          helper('rest:write')(_.omit(formatError(err, ctx), ['err', 'status']), ctx)
          ctx.app.emit('error', err, ctx)
        }
        ctx.response.status = status
      } catch (err) {
        if (err.err) err = err.err
        helper('rest:write')(_.omit(formatError(err, ctx), ['err', 'status']), ctx)
        ctx.app.emit('error', err, ctx)
        ctx.response.status = err.status || err.statusCode || 500
      }
    }
  }
}
