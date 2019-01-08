'use script'

module.exports = function (cuk) {
  const { _, util } = cuk.pkg.core.lib
  const cfg = cuk.pkg.rest.cfg

  return (mountPath, cuksPkg) => {
    let prefix = cuksPkg.cfg.mount === '/' ? '' : cuksPkg.cfg.mount
    if (!cfg.versioning) return (prefix + mountPath)
    const cfgI18n = _.get(cuk.pkg, 'i18n.cfg.detector', {})
    if (cfgI18n.method && cfgI18n.method.indexOf('path') > -1) prefix = prefix.replace('/:' + cfgI18n.fieldName, '')

    let parts = mountPath.split('/')
    parts.shift()
    const indicator = parts[0].substr(0, 1)
    const number = Number(parts[0].substr(1))
    if (!(indicator === 'v' && number)) return (prefix + mountPath)
    const version = util.format(cfg.versioning, number)
    parts[0] = version
    if (prefix !== '') parts.splice(1, 0, prefix.substr(1))
    return '/' + parts.join('/')
  }
}
