'use strict'

module.exports = function(cuk) {
  const { _ } = cuk.lib
  const pkg = cuk.pkg.rest

  return (err, ctx) => {
    let result = {
      success: false,
      message: pkg.cfg.common.hideError && err.statusCode !== 404 ? 'Internal Server Error' : err.message,
      statusCode: err.statusCode || 500,
      err: err
    }
    if (!pkg.cfg.common.hideError && !_.isEmpty(err.detail))
      result.details = err.detail
    return result
  }

}