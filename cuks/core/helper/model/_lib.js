'use strict'

module.exports = function(cuk){
  const { _, helper } = cuk.pkg.core.lib

  return (model, ctx, params) => {
    let options = helper('core:makeOptions')('rest', 'common.model', params || ctx.state.restOpts)
    const idField = model.dab.collection[model.schema.name].srcAttribId
    return {
      options: options,
      schema: model.schema,
      attrs: _.keys(model.schema.attributes),
      idField: idField,
      domain: _.get(ctx, 'state.site.domain', '*'),
      uid: _.get(ctx, 'state.auth.user.' + idField),
      gid: _.get(ctx, 'state.auth.group.' + idField),
    }
  }
}