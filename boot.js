'use strict'

const Router = require('koa-router')

module.exports = function (cuk) {
  const pkgId = 'rest'
  const pkg = cuk.pkg[pkgId]
  const { _, helper } = cuk.pkg.core.lib
  const app = cuk.pkg.http.lib.app
  const makeRoute = require('./lib/make_route')(cuk)
  const router = new Router({ prefix: pkg.cfg.mount })
  pkg.lib.router = router

  return new Promise((resolve, reject) => {
    app.use(helper('http:composeMiddleware')('http:responseTime', `${pkgId}:*`))
    helper('core:trace')('|  |- Loading routes...')
    helper('core:bootDeep')({
      pkgId: pkgId,
      name: '',
      parentAction: opts => {
        router.pkgId = pkgId
        const mws = _.get(pkg.cfg, 'cuks.http.middleware', [])
        if (!_.isEmpty(mws)) app.use(helper('http:composeMiddleware')(mws, `${pkgId}:${opts.pkg.id}`))

        router.param('ext', (ext, ctx, next) => {
          let accepts = pkg.cfg.supportedFormats
          if (accepts.indexOf(ext) === -1) {
            ctx.params.ext = 'json'
            ctx.status = 404
            return
          }
          return next()
        })

        const cors = []

        _.each(opts.files, f => {
          makeRoute(f, opts.pkg, pkg, router, opts.dir, cors)
        })

        if (cors.length > 0) {
          _.each(cors, c => {
            let methods = []
            _.each(router.stack, l => {
              if (l.path.indexOf(c) > -1) methods = _.concat(methods, l.methods)
            })
            methods = _.uniq(methods)
            const corsOpt = helper('core:config')('http', 'middlewareOpts.cors', {})
            router.options(c,
              async (ctx, next) => {
                ctx.statue = 200
                ctx.body = ''
                ctx.set('Allow', methods.join(','))
                ctx.set('Access-Control-Allow-Methods', methods.join(','))
                ctx.set('Access-Control-Allow-Origin', corsOpt.origin || '*')
                ctx.set('Access-Control-Allow-Headers', ctx.request.header['access-control-request-headers'])
              }
            )
          })
        }
        app
          .use(router.routes())
          // .use(router.allowedMethods())
      }
    })
    resolve(true)
  })
}
