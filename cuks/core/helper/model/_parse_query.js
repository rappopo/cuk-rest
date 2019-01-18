'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  const fromJson = q => {
    return JSON.parse(_.trim(q))
  }

  const fromSingle = (q, op, multi) => {
    let expr = q.split(':'),
      field = _.trim(expr[0]),
      query = {}
    expr.shift()
    let args = multi ? helper('core:makeChoices')(expr[0]) : expr[0]
    query[field] = {}
    query[field][op] = args
    return query
  }

  const fromMisc = q => {
    const parts = q.split(',')
    let query = {}
    _.each(parts, p => {
      p = _.trim(p).split(':')
      p[0] = _.trim(p[0])
      p[1] = _.trim(p[1])
      if (p[1].indexOf('*') > -1) {
        query[p[0]] = { $regex: p[1].replace(/\*/g, '%') }
      } else {
        query[p[0]] = p[1]
      }
    })
    return query
  }

  return (q = '') => {
    q = _.trim(q)
    if (_.isEmpty(q)) return {}
    if (q.substr(0, 5) === 'json:') return fromJson(q.substr(5))
    if (q.substr(0, 3) === 'in:') return fromSingle(q.substr(3), '$in', true)
    if (q.substr(0, 4) === 'nin:') return fromSingle(q.substr(4), '$nin', true)
    if (q.substr(0, 4) === 'all:') return fromSingle(q.substr(4), '$all', true)
    if (q.substr(0, 4) === 'any:') return fromSingle(q.substr(4), '$any', true)
    if (q.substr(0, 8) === 'between:') return fromSingle(q.substr(8), '$between', true)
    if (q.substr(0, 3) === 'ne:') return fromSingle(q.substr(3), '$ne')
    if (q.substr(0, 9) === 'contains:') return fromSingle(q.substr(9), '$contains')
    if (q.substr(0, 3) === 'lt:') return fromSingle(q.substr(3), '$lt')
    if (q.substr(0, 4) === 'lte:') return fromSingle(q.substr(4), '$lte')
    if (q.substr(0, 3) === 'gt:') return fromSingle(q.substr(3), '$gt')
    if (q.substr(0, 4) === 'gte:') return fromSingle(q.substr(4), '$gte')
    if (q.substr(0, 5) === 'size:') return fromSingle(q.substr(5), '$size')
    if (q.substr(0, 5) === 'like:') return fromSingle(q.substr(5), '$regex')
    return fromMisc(q)
  }
}