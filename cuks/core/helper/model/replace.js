'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib
  const modify = require('./modify')(cuk)

  return (model, params = {}) => {
    params.modelOpts = params.modelOpts || {}
    if (!_.get(cuk.pkg.rest, 'cfg.common.replaceAsModify'))
      params.modelOpts.fullReplace = true
    return modify(model, params)
  }
}