'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, params, opts) => {
    const [pkgId, routeName, pkg] = helper('core:pkgSplitToken')(name, 'Invalid rest route name (%s)')
    const router = cuk.pkg.rest.lib.router
    return router.url(routeName, params, opts)
  }
}