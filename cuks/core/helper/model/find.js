'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const handlerError = require('./_handle_error')(cuk)

  return (model, params = {}) => {
    params.modelOpts = params.modelOpts || {}
    if (_.isString(model)) model = helper('model:get')(model)
    return (ctx, restOpts = {}) => {
      let { options, sid, uid } = require('./_lib')(cuk)(model, ctx, params)
      return new Promise((resolve, reject) => {
        const query = helper('rest:prepQuery')(ctx)
        const opts = helper('core:merge')(options.modelOpts, restOpts, query, { site: sid, owner: uid })
        model.find(opts)
          .then(resolve)
          .catch(err => {
            handlerError(err, resolve, reject)
          })
      })
    }
  }
}
