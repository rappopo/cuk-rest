'use strict'

module.exports = function(cuk) {

  return (obj, ctx) => {
    ctx.type = 'application/json; charset=utf-8'
    ctx.body = JSON.stringify(obj)
  }
}