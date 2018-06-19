'use strict'

module.exports = function(cuk) {
  const { _ } = cuk.lib
  const cfg = cuk.pkg.rest.cfg.common

  return (result, def, ctx) => {
    let res = _.cloneDeep(result)
    let isArr = _.isArray(res.data)
    if (!isArr)
      res.data = [res.data]
    _.each(res.data, (d, i) => {
      res.data[i] = _.isEmpty(def.column) ? d : _.pick(d, def.column)
    })
    res.data = isArr ? res.data : res.data[0]

    if (cfg.crud.plainResult) {
      res = res.data
    } else {
      if (cfg.key.data && !_.has(res, cfg.key.data)) {
        res[cfg.key.data] = res.data
        delete res.data
      }
      _.each(['success', 'total'], k => {
        if (!_.has(res, k)) return
        if (cfg.key[k])
          if (!_.has(res, cfg.key[k])) {
            res[cfg.key[k]] = res[k]
            delete res[k]
          }
        else
          delete res[k]
      })
      if (_.has(ctx.query.page) && _.has(ctx.query.limit)) {
        if (cfg.key.page) res[cfg.key.page] = ctx.query.page
        if (cfg.key.skip) res[cfg.key.skip] = (ctx.query.page - 1) * ctx.query.limit
      }
    }

    ctx.body = res
  }
}