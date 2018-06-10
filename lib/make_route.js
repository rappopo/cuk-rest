'use strict'


module.exports = function(cuk) {
  const { _, helper } = cuk.lib
  const formatSuccess = require('./format_success')(cuk)
  const formatError = require('./format_error')(cuk)
  const versioning = require('./versioning')(cuk)
  const supported = {
    find: ['get', '.:ext', helper('rest:crudFind')],
    findOne: ['get', '/:id.:ext', helper('rest:crudFindOne')],
    create: ['post', '.:ext', helper('rest:crudCreate')],
    update: ['put', '/:id.:ext', helper('rest:crudUpdate')],
    remove: ['delete', '/:id.:ext', helper('rest:crudRemove')],
    findOneSelf: ['get', '.:ext', helper('rest:crudFindOne')],
    updateSelf: ['put', '.:ext', helper('rest:crudUpdate')]
  }

  return (file, cuksPkg, pkg, router, rootDir) => {

    let routePath = file.replace(rootDir, '').replace('.js', ''),
      route = require(file)(cuk),
      mpath, name

    if (route.model) {
      if (route.model.indexOf(':') === -1)
        route.model = cuksPkg.id + ':' + route.model
    }
    if (route.middleware)
      route.use(helper('http:composeMiddleware')(route.middleware))
    if (_.isPlainObject(route.param)) {
      _.forOwn(route.param, (fn, key) => {
        router.param(key, fn)
      })
    }

    _.forOwn(route.method, (v, k) => {
      let key = _.camelCase(routePath) + ':' + k,
        keys = key.split(':')
      if (_.keys(supported).indexOf(k) === -1) return
      if (_.get(cuksPkg, 'cuks.rest.' + key)) return

      mpath = versioning(v.path || route.path || routePath, cuksPkg)
      let fn = _.isFunction(v.handler) ? v.handler : supported[k][2](helper('model:get')(route.model))
      let item = {
        model: route.model,
        handler: fn,
        param: v.param || {},
        path: mpath,
        middleware: helper('http:composeMiddleware')(_.concat(route.middleware || [], v.middleware || [])),
        column: v.column || route.column || []
      }
      _.set(cuksPkg, 'cuks.rest.' + key, item)

      if (_.isPlainObject(v.param)) {
        _.forOwn(v.param, (pfn, pkey) => {
          router.param(pkey, pfn)
        })
      }


      router[supported[keys[1]][0]](key, mpath + supported[keys[1]][1],
        helper('http:composeMiddleware')(v.middleware),
        async (ctx, next) => {
        try {
          let result = await fn(ctx)
          formatSuccess(result, v, ctx)
        } catch(err) {
          throw formatError(err, ctx)
        }
      })
      pkg.trace('Serve » %s -> %s:%s%s', k, cuksPkg.id, pkg.cfg.common.mountResource, mpath)
    })
  }

}