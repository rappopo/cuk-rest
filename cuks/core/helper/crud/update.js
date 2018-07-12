'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib
  return (model, options = {}) => {
    if (_.isString(model)) model = helper('model:get')(model)
    return ctx => {
      const attrs = helper('model:attribute')(model)
      let body = helper('core:objPickBy')(ctx.request.body, attrs)
      body = helper('core:merge')(body, options.body)
      return new Promise((resolve, reject) => {
        let col = ctx.query.col || 'id',
          query = _.set({}, col, ctx.params.id)
        query = helper('core:merge')(query, options.query || {})
        model.findOne({ query: query })
        .then(result => {
          return model.update(body)
        })
        .then(result => {
          resolve(result)
        })
        .catch(reject)
      })
    }
  }
}