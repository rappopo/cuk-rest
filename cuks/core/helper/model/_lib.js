'use strict'

module.exports = function (cuk) {
  const { _, helper } = cuk.pkg.core.lib

  return (model, ctx, params) => {
    let options = helper('core:makeOptions')('rest', 'model', params || ctx.state.restOpts)
    const idColumn = model.dab.collection[model.schema.name].srcAttribId
    return {
      options: options,
      schema: model.schema,
      attrs: _.keys(model.schema.attributes),
      idColumn: idColumn,
      domain: _.get(ctx, 'state.site.code', '*'),
      uid: _.get(ctx, 'auth.user.' + idColumn),
      gid: _.get(ctx, 'auth.group.' + idColumn)
    }
  }
}
