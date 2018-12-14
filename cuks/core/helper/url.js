'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, ctx = {}, opts = {}) => {
    if (name.substr(0, 1) === '/' || name.substr(0, 7) === 'http://' || name.substr(0, 8) === 'https://') return name
    let params = opts.params || {}
    if (ctx.i18n) {
      const cfg = _.get(cuk.pkg.i18n, 'cfg', {})
      let p = {}
      if (cfg.detector.method.indexOf('path') > -1) p[cfg.detector.fieldName] = ctx.session[cfg.detector.fieldName]
      if (!_.isEmpty(p)) params = helper('core:merge')(params, p)
    }
    const router = cuk.pkg.rest.lib.router
    return router.url(name, params, opts.opts)
  }
}
