'use strict'

const Router = require('koa-router')

module.exports = function(cuk){
  let pkgId = 'rest',
    pkg = cuk.pkg[pkgId]
  const { _, helper, path, fs, globby } = cuk.lib
  const app = cuk.pkg.http.lib.app
  const makeRoute = require('./lib/make_route')(cuk)
  const makeDefHandler = require('./lib/make_def_handler')(cuk)

  pkg.lib.Router = Router

  return new Promise((resolve, reject) => {
    app.use(makeDefHandler())
    app.use(helper('http:composeMiddleware')('http:responseTime', `${pkgId}:*`))

    helper('core:bootDeep')({
      pkgId: pkgId,
      name: '',
      parentAction: opts => {
        let router = new Router({ prefix: pkg.cfg.common.mountResource })
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

        helper('core:bootTrace')('%A Loading routes...', null)

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