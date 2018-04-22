const { Query } = require('./Query')
const { Subscription } = require('./Subscription')
const { User } = require('./User')
const { auth } = require('./Mutation/auth')
const { post } = require('./Mutation/post')
const { role } = require('./Mutation/role')
const { user } = require('./Mutation/user')
const { AuthPayload } = require('./AuthPayload')

module.exports = {
  Query,
  Mutation: {
    ...auth,
    ...post,
    ...role,
    ...user,
  },
  Subscription,
  AuthPayload,
  User,
}
