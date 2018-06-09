'use strict'

module.exports = function(cuk) {
  const { _ } = cuk.lib

  return (err, ctx) => {
    let result = {
      success: false,
      statusCode: err.statusCode || err.status || 500
    }
    return helper('core:makeError')({
      msg: result.message,
      status: result.statusCode,
      details: result.details
    })
  }

}