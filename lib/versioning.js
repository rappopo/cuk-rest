'use script'

module.exports = function (cuk) {
  const { _, util } = cuk.pkg.core.lib
  const cfg = cuk.pkg.rest.cfg

  return (mountPath, cuksPkg) => {
    let prefix = cuksPkg.cfg.common.mount === '/' ? '' : cuksPkg.cfg.common.mount
    if (!cfg.common.versioning) return (prefix + mountPath)
    const cfgI18n = _.get(cuk.pkg, 'i18n.cfg.common.detector', {})
    if (cfgI18n.method && cfgI18n.method.indexOf('path') > -1) prefix = prefix.replace('/:' + cfgI18n.fieldName, '')

    let parts = mountPath.split('/')
    parts.shift()
    let sep = ''
    _.each(['_', '-', ' '], s => {
      if (parts[0].indexOf(s) > -1) {
        sep = s
        return undefined
      }
    })
    if (_.isEmpty(sep)) return prefix + mountPath
    const vers = parts[0].split(sep)
    const version = util.format(cfg.common.versioning, vers[1])
    parts[0] = version
    if (prefix !== '') parts.splice(1, 0, prefix.substr(1))
    return '/' + parts.join('/')
  }
}
