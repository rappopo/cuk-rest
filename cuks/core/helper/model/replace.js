'use strict'

module.exports = function (cuk) {
  const { _ } = cuk.pkg.core.lib
  const modify = require('./modify')(cuk)

  return (model, params = {}) => {
    params.modelOpts = params.modelOpts || {}
    if (!_.get(cuk.pkg.rest, 'cfg.replaceAsModify')) params.modelOpts.fullReplace = true
    return modify(model, params)
  }
}
