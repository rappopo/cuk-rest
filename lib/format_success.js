'use strict'

module.exports = function(cuk) {
  const { _ } = cuk.lib

  return (result, def, ctx) => {
    let data = _.cloneDeep(result.data)
    let isArr = _.isArray(data)
    if (!isArr)
      data = [data]
    _.each(data, (d, i) => {
      data[i] = _.isEmpty(def.column) ? d : _.pick(d, def.column)
    })
    result.data = isArr ? data : data[0]
    ctx.body = result
  }
}