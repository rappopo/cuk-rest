'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (name, src) => {
    if (_.isEmpty(src)) return src
    const idCol = helper('model:getIdColumn')(name)
    const idWanted = helper('core:config')('rest', 'key.id', '')
    if (idCol === idWanted) return src
    const isArr = _.isArray(src)
    const data = isArr ? _.cloneDeep(src) : [_.cloneDeep(src)]
    _.each(data, (d, i) => {
      data[i][idWanted] = d[idCol]
      delete data[i][idCol]
    })
    return isArr ? data : data[0]
  }
}
