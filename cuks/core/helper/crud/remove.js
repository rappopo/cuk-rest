'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (model, options = {}) => {
    if (_.isString(model)) model = helper('model:get')(model)
    return ctx => {
      return new Promise((resolve, reject) => {
        let col = ctx.query.col || 'id',
          query = _.set({}, col, ctx.params.id)

        query = helper('core:merge')(query, options.query || {})

        model.findOne({ query: query })
        .then(result => {
          return model.delete(result.id)
        })
        .then(result => {
          resolve({
            success: true
          })
        })
        .catch(reject)
      })
    }
  }
}