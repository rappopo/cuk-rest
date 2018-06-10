'use script'

module.exports = function(cuk) {
  const { _, util } = cuk.lib
  const cfg = cuk.pkg.rest.cfg

  return (mountPath, cuksPkg) => {
    let prefix = cuksPkg.cfg.common.mount === '/' ? '' : cuksPkg.cfg.common.mount
    if (!cfg.common.versioning) return (prefix + mountPath)
    let parts = mountPath.split('/')
    parts.shift()
    let sep = ''
    _.each(['_', '-', ' '], s => {
      if (parts[0].indexOf(s) > -1) {
        sep = s
        return
      }
    })
    if (_.isEmpty(sep)) return mountPath
    const vers = parts[0].split(sep)
    const version = util.format(cfg.common.versioning, vers[1])
    parts[0] = version
    if (prefix !== '') parts.splice(1, 0, prefix.substr(1))
    return '/' + parts.join('/')
  }
}