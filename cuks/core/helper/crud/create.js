'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.lib

  return (model, options = {}) => {
    if (_.isString(model)) model = helper('model:get')(model)
    return (ctx) => {
      const attrs = helper('model:attribute')(model)
      let body = helper('core:objPickBy')(ctx.request.body, attrs)
      body = helper('core:merge')(body, options.body)
      return new Promise((resolve, reject) => {
        model.create(body)
        .then(result => {
          resolve(result)
        })
        .catch(reject)
      })
    }
  }
}