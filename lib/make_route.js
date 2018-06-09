'use strict'


module.exports = function(cuk) {
  const { _, helper } = cuk.lib
  const formatSuccess = require('./format_success')(cuk)
  const formatError = require('./format_error')(cuk)
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

    _.forOwn(route.method, (v, k) => {
      let key = _.camelCase(routePath) + ':' + k,
        keys = key.split(':')
      if (_.keys(supported).indexOf(k) === -1) return
      if (_.get(cuksPkg, 'cuks.rest.' + key)) return

      mpath = v.path || route.path || routePath
      let fn = _.isFunction(v.handler) ? v.handler : supported[k][2](helper('model:get')(route.model))
      let item = {
        model: route.model,
        handler: fn,
        injectParams: v.injectParams || route.injectParams || {},
        injectBody: v.injectParams || route.injectParams || {},
        defaultValue: v.default || route.default || {},
        path: mpath,
        middleware: helper('http:composeMiddleware')(_.concat(route.middleware || [], v.middleware || [])),
        column: v.column || route.column || []
      }
      _.set(cuksPkg, 'cuks.rest.' + key, item)

      router[supported[keys[1]][0]](key, mpath + supported[keys[1]][1], /* mws, */ async (ctx, next) => {
        try {
          let result = await fn(ctx)
          if (!_.isEmpty(v.defaultValue) && _.has(result, 'data') && _.isPlainObject(result.data) && _.isEmpty(result.data)) {
            result.data = v.defaultValue
          }
          formatSuccess(result, v, ctx)
        } catch(err) {
          throw formatError(err, ctx)
        }
      })
      pkg.trace('Serve » %s -> %s:%s%s%s', k, cuksPkg.id, pkg.cfg.common.mountResource, cuksPkg.cfg.common.mount === '/' ? '' : cuksPkg.cfg.common.mount, mpath)
    })
  }

}