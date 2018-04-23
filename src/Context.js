
const { Prisma } = require('prisma-binding')
const { UserPerms } = require('./directives/auth');
const { getUserId } = require('./utils')
const { getUserPermissionsAsync } =  require('./utils/permissions');

class Context {
  constructor(params) {
    this.params = params;
    this.db = new Prisma({
      typeDefs: 'src/generated/prisma.graphql', // the Prisma DB schema
      endpoint: process.env.PRISMA_ENDPOINT,    // the endpoint of the Prisma DB service (value is set in .env)
      secret: process.env.PRISMA_SECRET,        // taken from database/prisma.yml (value is set in .env)
      debug: true,                              // log all GraphQL queries & mutations
    });

    this[UserPerms] = this[UserPerms].bind(this);
  }

  [UserPerms]() {
    const userId = getUserId(this.params);
    return getUserPermissionsAsync(this, userId);
  }
}

module.exports = { Context };
