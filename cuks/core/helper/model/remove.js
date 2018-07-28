'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (model, params = {}) => {
    params.modelOpts = params.modelOpts || {}
    if (_.isString(model)) model = helper('model:get')(model)
    const handlerError = require('./_handle_error')(cuk)
    return ctx => {
      let { options, schema, attrs, idColumn, domain, uid, gid } = require('./_lib')(cuk)(model, ctx, params)
      let query = _.set({}, idColumn, ctx.params.id || ctx.state._id)
      if (options.autoFill) {
        if (attrs.indexOf('domain') > -1 && domain) query.domain = domain
      }
      query = helper('core:merge')(query, options.query)

      return new Promise((resolve, reject) => {
        model.find({ query: query })
        .then(result => {
          if (result.data.length === 0) throw helper('core:makeError')({ status: 404, msg: 'Record not found' })
          return model.remove(result.data[0][idColumn], options.modelOpts)
        })
        .then(result => {
          resolve(result)
        })
        .catch(err => {
          handlerError(err, resolve, reject)
        })
      })
    }
  }
}