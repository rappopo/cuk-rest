'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const handlerError = require('./_handle_error')(cuk)

  return (model, params = {}) => {
    params.modelOpts = params.modelOpts || {}
    if (_.isString(model)) model = helper('model:get')(model)
    return (ctx, restOpts = {}) => {
      let { options, site } = require('./_lib')(cuk)(model, ctx, params)
      let body = ctx.request.body || {}
      body = helper('core:merge')(body, options.body)
      return new Promise((resolve, reject) => {
        const opts = helper('core:merge')(options.modelOpts, restOpts, { site: site })
        model.create(body, opts)
          .then(resolve)
          .catch(err => {
            handlerError(err, resolve, reject)
          })
      })
    }
  }
}
