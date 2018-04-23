const { getUserPermissionsAsync } = require('../utils/permissions');

const TIKIER_GROUP_NAME = 'TIKI';

const User = {
  isTikier({ id }, args, ctx, info) {
    const groupWhere = { name: TIKIER_GROUP_NAME };
    return ctx.db.exists.User({
      id,
      groups_some: {
        OR: [
          groupWhere,
          { parent: groupWhere },
        ]
      }
    });
  },

  permissions({ id }, args, ctx, info) {
    return getUserPermissionsAsync(ctx, id);
  },
};

module.exports = { User };
