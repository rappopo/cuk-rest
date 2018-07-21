'use strict'


module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const formatSuccess = require('./format_success')(cuk)
  const versioning = require('./versioning')(cuk)
  const supported = {
    find: ['get', '.:ext', helper('rest:modelFind')],
    findOne: ['get', '/:id.:ext', helper('rest:modelFindOne')],
    create: ['post', '.:ext', helper('rest:modelCreate')],
    replace: ['put', '/:id.:ext', helper('rest:modelReplace')],
    modify: ['patch', '/:id.:ext', helper('rest:modelModify')],
    remove: ['delete', '/:id.:ext', helper('rest:modelRemove')],
    findOneSelf: ['get', '.:ext', helper('rest:modelFindOne')],
    replaceSelf: ['put', '.:ext', helper('rest:modelReplace')],
    modifySelf: ['patch', '.:ext', helper('rest:modelModify')],
  }

  /*
  if (_.get(cuk.pkg.rest, 'cfg.common.replaceAsModify')) {
    supported.replace = ['put', '/:id.:ext', helper('rest:modelModify')]
    supported.replaceSelf = ['put', '.:ext', helper('rest:modelModify')]
  }
  */

  return (file, cuksPkg, pkg, router, appDir) => {
    const disabled = _.get(cuk.pkg.rest, 'cfg.common.disabled', [])
    let routePath = file.replace(appDir, '').replace('.js', ''),
      route = require(file)(cuk),
      mpath
    let _name = `${cuksPkg.id}:${routePath}`
    if (disabled.indexOf(_name) > -1) {
      helper('core:trace')('|  |  |- Disabled => %s', null, null, _name)
      return
    }

    if (route.model) {
      if (route.model.indexOf(':') === -1)
        route.model = cuksPkg.id + ':' + route.model
    }
//    if (route.middleware) router.use(helper('http:composeMiddleware')(route.middleware))
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

      if (_.isFunction(v)) v = { handler: v }

      mpath = versioning(v.path || route.path || routePath, cuksPkg)
      let fn
      if (_.isFunction(v.handler)) {
        fn = v.handler
      } else if (route.model) {
        fn = supported[k][2](route.model)
      }
      if (!fn) return

      const transformer = v.transformer || route.transformer || (data => { return data }),
        hideColumn = v.hideColumn || route.hideColumn || [],
        column = _.without((v.column || route.column || []), ...hideColumn)

      /*
      let item = {
        model: route.model,
        handler: fn,
        param: v.param || {},
        path: mpath,
        middleware: _.concat(route.middleware || [], v.middleware || []),
        column: column,
        transformer: v.transformer || route.transformer || (data => { return data })
      }
      _.set(cuksPkg, 'cuks.rest.' + key, item)
      */

      if (_.isPlainObject(v.param)) {
        _.forOwn(v.param, (pfn, pkey) => {
          router.param(pkey, pfn)
        })
      }

      let middleware = []
      if (['create', 'modify', 'replace', 'modifySelf', 'replaceSelf'].indexOf(k) > -1)
        middleware.push('http:bodyParser')
      if (route.middleware)
        middleware.push(route.middleware)
      if (v.middleware)
        middleware.push(v.middleware)
      router[supported[keys[1]][0]](key, mpath + supported[keys[1]][1],
        helper('http:composeMiddleware')(middleware, key, true),
        (ctx, next) => {
          let finalResult, isArray = false
          Promise.resolve(fn(ctx))
          .then(result => {
            finalResult = result
            isArray = _.isArray(result.data)
            return Promise.map(isArray ? result.data : [result.data], (d, i) => {
              return Promise.resolve(transformer(d))
            })
          })
          .then(result => {
            if (column.length > 0) {
              _.each(result, (r, i) => {
                result[i] = _.pick(r, column)
              })
            }
            finalResult.data = isArray ? result : result[0]
            helper('rest:write')(formatSuccess(finalResult, v, ctx), ctx)
          })
          .catch(err => {
            const result = helper('rest:formatError')(err)
            helper('rest:write')(result, ctx)
            if (_.get(cuk.pkg.http, 'cfg.common.printError'))
              throw err
          })
        }
      )
      helper('core:trace')('|  |  |- Enabled => %s -> [%s] %s%s', _name, k, pkg.cfg.common.mount, mpath)
    })
  }

}