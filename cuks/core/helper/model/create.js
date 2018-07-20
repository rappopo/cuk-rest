'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (model, params = {}) => {
    if (_.isString(model)) model = helper('model:get')(model)
    return ctx => {
      let { options, schema, attrs, idField, domain, uid, gid } = require('./_lib')(cuk)(model, ctx, params)
      let body = ctx.request.body || {}
      if (options.autoFill) {
        if (attrs.indexOf('domain') > -1 && domain && !_.has(body, 'domain'))
          body.domain = domain
        if (attrs.indexOf('uid') > -1 && uid && _.has(body, 'uid'))
          body.uid = uid
        if (attrs.indexOf('gid') > -1 && gid && !_.has(body, 'gid'))
          body.gid = gid
      }
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