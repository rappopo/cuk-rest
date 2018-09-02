'use strict'

const Router = require('koa-router')

module.exports = function (cuk){
  let pkgId = 'rest',
    pkg = cuk.pkg[pkgId]
  const { _, helper, path, fs, globby } = cuk.pkg.core.lib
  const app = cuk.pkg.http.lib.app
  const makeRoute = require('./lib/make_route')(cuk)
  const router = new Router({ prefix: pkg.cfg.common.mount })
  pkg.lib.router = router

  return new Promise((resolve, reject) => {
    app.use(helper('http:composeMiddleware')('http:responseTime', `${pkgId}:*`))
    helper('core:trace')('|  |- Loading routes...')
    helper('core:bootDeep')({
      pkgId: pkgId,
      name: '',
      parentAction: opts => {
        router.pkgId = pkgId
        app.use(helper('http:composeMiddleware')(
          _.get(pkg.cfg, 'cuks.http.middleware', []), `${pkgId}:${opts.pkg.id}`)
        )

        router.param('ext', (ext, ctx, next) => {
          let accepts = pkg.cfg.common.supportedFormats
          if (accepts.indexOf(ext) === -1) {
            ctx.params.ext = 'json'
            return ctx.status = 404
          }
          return next()
        })

        _.each(opts.files, f => {
          makeRoute(f, opts.pkg, pkg, router, opts.dir)
        })
        app
          .use(router.routes())
          .use(router.allowedMethods())
      }
    })
    resolve(true)
  })
}