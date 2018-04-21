const { getUserId } = require('../../utils')

const role = {
  async createRole(parent, { name, description }, ctx, info) {
    return ctx.db.mutation.createRole(
      {
        data: {
          name,
          description,
          permissions: [],
        },
      },
      info
    )
  },

  async updateRole(parent, args, ctx, info) {
    const { id, permissions, ...data } = args;
    const roleExists = await ctx.db.exists.Role({
      id,
    })
    if (!roleExists) {
      throw new Error(`Role not found`)
    }

    if (permissions) {
      data.permissions = {
        set: permissions,
      };
    }

    return ctx.db.mutation.updateRole(
      {
        where: { id },
        data,
      },
      info,
    )
  },

  async deleteRole(parent, { id }, ctx, info) {
    const roleExists = await ctx.db.exists.Role({
      id,
    })
    if (!roleExists) {
      throw new Error(`Role not found`)
    }
    return ctx.db.mutation.deleteRole({ where: { id } })
  },
}

module.exports = { role }
