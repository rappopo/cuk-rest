'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.lib

  return () => {
    return async (ctx, next) => {
      try {
        await next()
        if (ctx.status === 404) {
          const err = helper('core:makeError')({
            msg: 'Resource not found',
            status: 404
          })
          ctx.app.emit('error', err, ctx)
        }
      } catch (err) {
        ctx.status = err.status || 500
        ctx.body = err.message
        ctx.app.emit('error', err, ctx)
      }
    }
  }
}