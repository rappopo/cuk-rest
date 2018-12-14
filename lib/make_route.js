'use strict'


module.exports = function (cuk) {
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

  if (_.get(cuk.pkg.rest, 'cfg.replaceAsModify')) {
    supported.replace = ['put', '/:id.:ext', helper('rest:modelModify')]
    supported.replaceSelf = ['put', '.:ext', helper('rest:modelModify')]
  }

  return (file, cuksPkg, pkg, router, appDir) => {
    const disabled = _.get(cuk.pkg.rest, 'cfg.disabled', [])
    let routePath = file.replace(appDir, '').replace('.js', '')
    let route = require(file)(cuk)
    let mpath

    if (route.model) {
      if (route.model.indexOf(':') === -1) route.model = cuksPkg.id + ':' + route.model
      let methods = []
      if (_.isString(route.method)) methods = helper('core:makeChoices')(route.method)
      else if (_.isArray(route.method)) methods = route.method
      if (methods.length > 0) {
        let o = {}
        _.each(methods, m => {
          o[m] = {}
        })
        route.method = o
      }
    }
    if (_.isPlainObject(route.param)) {
      _.forOwn(route.param, (fn, key) => {
        router.param(key, fn)
      })
    }

    _.forOwn(route.method, (v, k) => {
      let name = cuksPkg.id + ':' + k + ':' + _.camelCase(routePath)
      if (disabled.indexOf(name) > -1) {
        helper('core:trace')('|  |  |- Disabled => %s', name)
        return
      }
      if (_.keys(supported).indexOf(k) === -1) return
      if (_.isFunction(v)) v = { handler: v }

      mpath = versioning(v.path || route.path || routePath, cuksPkg)
      let fn
      if (_.isFunction(v.handler)) {
        fn = v.handler
      } else if (route.model) {
        fn = supported[k][2](route.model)
      }
      if (!fn) return

      _.set(cuksPkg, 'cuks.rest.' + _.camelCase(_.drop(name.split(':')).join(':')), fn)

      const transformer = v.transformer || route.transformer || (data => { return data })
      const hideColumn = v.hideColumn || route.hideColumn || []
      const column = _.without((v.column || route.column || []), ...hideColumn)

      if (_.isPlainObject(v.param)) {
        _.forOwn(v.param, (pfn, pkey) => {
          router.param(pkey, pfn)
        })
      }

      let middleware = []
      if (['create', 'modify', 'replace', 'modifySelf', 'replaceSelf'].indexOf(k) > -1) middleware.push('http:bodyParser')
      if (route.middleware) middleware.push(route.middleware)
      if (v.middleware) middleware.push(v.middleware)
      router[supported[k][0]](name, mpath + supported[k][1],
        helper('http:composeMiddleware')(middleware, '', true),
        async (ctx, next) => {
          let result
          try {
            let finalResult
            let isArray = false
            result = await Promise.resolve(fn(ctx))
            finalResult = result
            isArray = _.isArray(result.data)
            result = await Promise.map(isArray ? result.data : [result.data], (d, i) => {
              return Promise.resolve(transformer(d))
            })
            if (column.length > 0) {
              _.each(result, (r, i) => {
                result[i] = _.pick(r, column)
              })
            }
            finalResult.data = isArray ? result : result[0]
            helper('rest:write')(formatSuccess(finalResult, v, ctx), ctx)
          } catch (err) {
            result = helper('rest:formatError')(err)
            helper('rest:write')(result, ctx)
            if (_.get(cuk.pkg.http, 'cfg.printError')) throw err
          }
        }
      )
      let layer = router.route(name)
      if (layer) {
        layer._role = v.role || route.role || {
          customHandling: false,
          resourcePossession: 'any',
          resourceName: _.last(name.split(':'))
        }
      }
      helper('core:trace')('|  |  |- Enabled => %s -> [%s] %s%s', name, supported[k][0].toUpperCase(), pkg.cfg.mount, mpath)
    })
  }
}
