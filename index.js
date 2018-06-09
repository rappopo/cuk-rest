'use strict'

module.exports = function(cuk) {
  const { path } = cuk.lib
  return Promise.resolve({
    id: 'rest',
    tag: 'boot',
    level: 10
  })
}