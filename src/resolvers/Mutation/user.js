const { getUserId } = require('../../utils')

const connect = (ids) => ({
  connect: ids.map(id => ({ id })),
});

const user = {
  async updateUserRole(parent, args, ctx, info) {
    const { id, roles } = args;
    const userExists = await ctx.db.exists.User({
      id,
    })
    if (!userExists) {
      throw new Error(`User not found`)
    }

    return ctx.db.mutation.updateUser(
      {
        where: { id },
        data: {
          roles: connect(roles),
        },
      },
      info,
    )
  },
  async updateUserGroup(parent, args, ctx, info) {
    const { id, groups } = args;
    const userExists = await ctx.db.exists.User({
      id,
    })
    if (!userExists) {
      throw new Error(`User not found`)
    }

    return ctx.db.mutation.updateUser(
      {
        where: { id },
        data: {
          groups: connect(groups),
        },
      },
      info,
    )
  },
}

module.exports = { user }
