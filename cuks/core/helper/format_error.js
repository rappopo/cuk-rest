'use strict'

module.exports = function(cuk) {
  const { _ } = cuk.pkg.core.lib

  return (err) => {
    const cfg = cuk.pkg.rest.cfg.common

    let res = {
      success: false,
      msg: cfg.error.hide && err.statusCode !== 404 ? 'Internal Server Error' : err.message,
      statusCode: err.statusCode || 500
    }
    if (cfg.key.msg && !_.has(res, cfg.key.msg)) {
      res[cfg.key.msg] = res.msg
      delete res.msg
    }
    _.each(['success', 'statusCode'], k => {
      if (_.has(res, k) && cfg.key[k] === k) return
      if (cfg.key[k]) {
        if (!_.has(res, cfg.key[k])) {
          res[cfg.key[k]] = res[k]
          delete res[k]
        }
      } else {
        delete res[k]
      }
    })
    if (cfg.key.details && !cfg.error.hide && !_.isEmpty(err.detail))
      res[cfg.key.details] = err.detail
    return res
  }

}