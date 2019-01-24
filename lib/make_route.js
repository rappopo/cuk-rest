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
    modifySelf: ['patch', '.:ext', helper('rest:modelModify')]
  }

  if (_.get(cuk.pkg.rest, 'cfg.replaceAsModify')) {
    supported.replace = ['put', '/:id.:ext', helper('rest:modelModify')]
    supported.replaceSelf = ['put', '.:ext', helper('rest:modelModify')]
  }

  return (file, cuksPkg, pkg, router, appDir, cors) => {
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
      if (!fn) throw helper('core:makeError')('Invalid REST handler')

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
      let gMw = helper('core:config')('rest', 'globalMiddleware', [])
      if (_.isString(gMw)) {
        const tMw = []
        helper('http:splitForMiddleware')(gMw, tMw)
        gMw = tMw
      }
      if (!_.isEmpty(gMw)) middleware = _.concat(middleware, gMw)
      if (['create', 'modify', 'replace', 'modifySelf', 'replaceSelf'].indexOf(k) > -1) middleware.push('http:bodyParser')
      if (route.middleware) {
        if (_.isArray(route.middleware)) middleware = _.concat(middleware, route.middleware)
        else middleware.push(route.middleware)
      }
      if (v.middleware) {
        if (_.isArray(v.middleware)) middleware = _.concat(middleware, v.middleware)
        else middleware.push(v.middleware)
      }
      const hasCors = _.map(middleware, m => {
        return _.isPlainObject(m) && m.name === 'http:cors'
      }).includes(true)
      if (hasCors && cors.indexOf(mpath + supported[k][1]) === -1) {
        cors.push(mpath + supported[k][1])
      }
      router[supported[k][0]]('rest:' + name, mpath + supported[k][1],
        helper('http:composeMiddleware')(middleware, '', true),
        async (ctx, next) => {
          let result
          try {
            let finalResult
            let isArray = false
            let opts = {}
            if (route.model) {
              opts = helper('core:merge')(helper('core:config')('rest', 'model.options', {}), route.options || {})
            }
            result = await Promise.resolve(fn(ctx, opts))
            // if (!_.has(result, 'data')) result = { success: true, data: result }
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
            if (route.model) finalResult.data = helper('rest:convertIdColumn')(route.model, finalResult.data)
            helper('rest:write')(formatSuccess(finalResult, v, ctx), ctx)
          } catch (err) {
            result = helper('rest:formatError')(err)
            helper('rest:write')(result, ctx)
            if (_.get(cuk.pkg.http, 'cfg.printError')) throw err
          }
        }
      )
      let layer = router.route('rest:' + name)
      if (layer) {
        layer._options = v.options || route.options || {
          role: { resourcePossession: 'any' }
        }
      }
      helper('core:trace')('|  |  |- Enabled => %s -> [%s] %s%s', name, supported[k][0].toUpperCase(), pkg.cfg.mount, mpath)
    })
  }
}
