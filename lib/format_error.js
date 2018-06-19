'use strict'

module.exports = function(cuk) {
  const { _ } = cuk.lib
  const cfg = cuk.pkg.rest.cfg.common

  return (err, ctx) => {
    let res = {
      success: false,
      msg: cfg.hideError && err.statusCode !== 404 ? 'Internal Server Error' : err.message,
      statusCode: err.statusCode || 500,
      err: err
    }
    res.status = res.statusCode
    if (cfg.key.msg && !_.has(res, cfg.key.msg)) {
      res[cfg.key.msg] = res.msg
      delete res.msg
    }
    _.each(['success', 'statusCode'], k => {
      if (!_.has(res, k)) return
      if (cfg.key[k])
        if (!_.has(res, cfg.key[k])) {
          res[cfg.key[k]] = res[k]
          delete res[k]
        }
      else
        delete res[k]
    })
    if (cfg.key.details && !cfg.hideError && !_.isEmpty(err.detail))
      res[cfg.key.details] = err.detail
    return res
  }

}