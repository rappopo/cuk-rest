'use strict'

const Router = require('koa-router')

module.exports = function(cuk){
  let pkgId = 'rest',
    pkg = cuk.pkg[pkgId]
  const { _, helper, path, fs, globby } = cuk.lib
  const app = cuk.pkg.http.lib.app
  const makeRoute = require('./lib/make_route')(cuk)
  const makeDefHandler = require('./lib/make_def_handler')(cuk)

  pkg.trace('Initializing...')
  pkg.lib.Router = Router

  return new Promise((resolve, reject) => {
    app.use(makeDefHandler())
    app.use(helper('http:composeMiddleware')('http:responseTime', `${pkgId}:*`))

    helper('core:bootDeep')({
      pkgId: pkgId,
      name: '',
      rootAction: opts => {
        let prefix = opts.pkg.cfg.common.mount === '/' ? '' : opts.pkg.cfg.common.mount
        let router = new Router({ prefix: pkg.cfg.common.mountResource + prefix })
        app.use(helper('http:composeMiddleware')(_.get(pkg.cfg, 'cuks.http.middleware', []), `${pkgId}:${opts.pkg.id}`))

        router.param('ext', (ext, ctx, next) => {
          let accepts = ['json']
          if (accepts.indexOf(ext) === -1) {
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
  })
}