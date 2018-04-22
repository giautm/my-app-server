const union = require('lodash/union');

const rolePermissions = ({ roles }) =>
  roles.reduce((p, r) => union(p, r.permissions), []);
const userPermissions = (user) =>
  user.groups.reduce((perms, group) => {
    perms = union(perms, rolePermissions(group));
    if (group.parent) {
      perms = union(perms, rolePermissions(group.parent));
    }
    return perms;
  }, rolePermissions(user));

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
  async permissions({ id }, args, ctx, info) {
    const role = `roles{permissions}`;
    const user = await ctx.db.query.user({
      where: { id }
    }, `
      {
        ${role}
        groups {
          ${role}
          parent {
            ${role}
          }
        }
      }
    `);

    if (user) {
      return userPermissions(user);
    }

    return [];
  },

};

module.exports = { User };
