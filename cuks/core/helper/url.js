'use strict'

module.exports = function(cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, params, opts) => {
    if (name.substr(0, 1) === '/' || name.substr(0, 7) === 'http://' || name.substr(0, 8) === 'https://')
      return name
    const [pkgId, routeName, pkg] = helper('core:pkgTokenSplit')(name, 'Invalid rest route name (%s)')
    const router = cuk.pkg.rest.lib.router
    return router.url(routeName, params, opts)
  }
}