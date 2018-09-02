'use strict'

module.exports = function (cuk){
  const { _ } = cuk.pkg.core.lib

  return (err, resolve, reject) => {
    let rec404 = _.get(cuk.pkg.rest, 'cfg.common.error.throwRecordNotFound')
    if (err.statusCode === 404 && !rec404)
    return resolve({
      success: false,
      msg: 'Record not found',
      data: {}
    })
    reject(err)
  }
}