'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (model, params = {}) => {
    params.modelOpts = params.modelOpts || {}
    const handlerError = require('./_handle_error')(cuk)
    if (_.isString(model)) model = helper('model:get')(model)
    return ctx => {
      let { options, attrs, idColumn, domain } = require('./_lib')(cuk)(model, ctx, params)
      let query = _.set({}, idColumn, ctx.params.id || ctx.state._id)
      if (options.autoFill) {
        if (attrs.indexOf('domain') > -1 && domain) query.domain = domain
      }
      query = helper('core:merge')(query, options.query)
      return new Promise((resolve, reject) => {
        model.find({ query: query }, options.modelOpts)
          .then(result => {
            if (result.data.length === 0) throw helper('core:makeError')({ status: 404, msg: 'Record not found' })
            resolve({
              success: result.success,
              data: result.data[0] || {}
            })
          })
          .catch(err => {
            handlerError(err, resolve, reject)
          })
      })
    }
  }
}
