'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.lib

  return (model, options = {}) => {
    if (_.isString(model)) model = helper('model:get')(model)
    return ctx => {
      return new Promise((resolve, reject) => {
        let query = { id: ctx.params.id }
        query = helper('core:merge')(query, options.query)
        model.findOne({ query: query })
        .then(result => {
          resolve(result)
        })
        .catch(reject)
      })
    }
  }
}