'use strict'

const q2m = require('query-to-mongo')

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const pkg = cuk.pkg.rest
  const parseQuery = require('./_parse_query')(cuk)
  const handlerError = require('./_handle_error')(cuk)

  return (model, params = {}) => {
    params.modelOpts = params.modelOpts || {}
    if (_.isString(model)) model = helper('model:get')(model)
    return ctx => {
      let { options, site } = require('./_lib')(cuk)(model, ctx, params)
      return new Promise((resolve, reject) => {
        let limit = Number(ctx.query.limit) || pkg.cfg.default.limit || 25
        let page = Number(ctx.query.page) || 1
        let sort = ctx.query.sort || ''
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
              let qs = _.get(cuk.pkg.auth, 'cfg.method.' + t + '.detect.querystring')
              if (_.isString(qs)) opts.ignore.push(qs)
            })
          }
          query = q2m(ctx.request.querystring, opts).criteria
        }

        query = helper('core:merge')(query, ctx.state._query)
        const opts = helper('core:merge')(options.modelOpts, {
          site: site,
          limit: limit,
          page: page,
          query: query,
          sort: sort
        })
        model.find(opts)
          .then(resolve)
          .catch(err => {
            handlerError(err, resolve, reject)
          })
      })
    }
  }
}
