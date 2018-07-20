'use strict'

const q2m = require('query-to-mongo')

module.exports = function(cuk) {
  const { _, helper, moment } = cuk.pkg.core.lib
  const pkg = cuk.pkg.rest
  const parseQuery = require('./_parse_query')(cuk)

  return (model, params = {}) => {
    if (_.isString(model)) model = helper('model:get')(model)
    return ctx => {
      let { options, schema, attrs, idField, domain, uid, gid } = require('./_lib')(cuk)(model, ctx, params)
      return new Promise((resolve, reject) => {
        let limit = Number(ctx.query.limit) || pkg.cfg.common.default.limit || 25,
          page = Number(ctx.query.page) || 1,
          sort = ctx.query.sort || ''
        if (!ctx.query.page && ctx.query.offset) {
          let offset = Number(ctx.query.offset) || 0
          page = Math.round(offset / limit) + 1
        }
        let query = {}
        if (ctx.query.q) {
          query = parseQuery(ctx.query.q)
        } else if (!_.isEmpty(ctx.request.querystring)) {
          let opts = {
            ignore: []
          }
          if (cuk.pkg.auth) {
            _.each(['basic', 'bearer', 'jwt'], t => {
              let qs = _.get(cuk.pkg.auth, 'cfg.common.method.' + t + '.detect.querystring')
              if (_.isString(qs)) opts.ignore.push(qs)
            })
          }
          query = q2m(ctx.request.querystring, opts).criteria
        }

        query = helper('core:merge')(query, ctx.state._query)
        model.find({
          limit: limit,
          page: page,
          query: query,
          sort: sort
        })
        .then(result => {
          resolve(result)
        })
        .catch(reject)
      })
    }
  }
}