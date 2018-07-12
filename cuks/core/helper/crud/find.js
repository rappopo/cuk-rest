'use strict'

module.exports = function(cuk) {
  const { _, helper, moment } = cuk.pkg.core.lib
  const pkg = cuk.pkg.rest

  return (model, options = {}) => {
    if (_.isString(model)) model = helper('model:get')(model)
    return ctx => {
      return new Promise((resolve, reject) => {
        let limit = ctx.query.limit || pkg.cfg.common.crud.limit || 25,
          skip = ctx.query.skip ? ctx.query.skip : (((ctx.query.page || 1) - 1) * limit),
          query = ctx.query.query,
          order = ctx.query.order,
          attributes = options.attributes
        if (!_.isEmpty(ctx.query.queryExtra))
          query = helper('core:merge')(query, ctx.query.queryExtra)
        query = helper('core:merge')(query, options.query || {})
        model[method]({
          query: where, limit: limit, offset: skip, order: order, attributes: attributes,
        })
        .then(result => {
          resolve(result)
        })
        .catch(reject)
      })
    }
  }
}