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

  return (file, cuksPkg, pkg, router, appDir) => {
    const disabled = _.get(cuk.pkg.rest, 'cfg.common.disabled', [])
    let routePath = file.replace(appDir, '').replace('.js', ''),
      route = require(file)(cuk),
      mpath
    let _name = `${cuksPkg.id}:${routePath}`
    if (disabled.indexOf(_name) > -1) {
      helper('core:bootTrace')('%B Disabled %K %s', null, null, _name)
      return
    }

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
          helper('rest:write')(formatSuccess(result, v, ctx), ctx)
        } catch(err) {
          throw formatError(err, ctx)
        }
      })
      helper('core:bootTrace')('%B Enabled %K %s %L [%s] %s%s', null, null, _name, null, k, pkg.cfg.common.mountResource, mpath)
    })
  }

}