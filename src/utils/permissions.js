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

const getUserPermissionsAsync = async (ctx, id) => {
  // FIXME: Cache by UserID
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
}

module.exports = { 
  getUserPermissionsAsync,
};
