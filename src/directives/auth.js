const { defaultFieldResolver } = require('graphql');
const { SchemaDirectiveVisitor } = require('graphql-tools');
const { createError } = require('apollo-errors');

const UserPerms = Symbol('Get User Permissions');

const NotAuthorizedAll = createError('NotAuthorized', {
  message: 'Not authorized, required ALL of the permissions',
});

const NotAuthorizedOne = createError('NotAuthorized', {
  message: 'Not authorized, required ONE of the permissions',
});

class AuthDirective extends SchemaDirectiveVisitor {

  visitFieldDefinition(field, details) {
    this.ensureFieldsWrapped(details.objectType);
    field._requiredPerms = this.args.requires;
    field._permsTypeName = this.args.opType;
    field._permissionAll = this.args.permissionAll;
  }

  visitObject(type) {
    this.ensureFieldsWrapped(type);
    type._requiredPerms = this.args.requires;
    type._permsTypeName = this.args.opName;
    type._permissionAll = this.args.permissionAll;
  }

  ensureFieldsWrapped(objectType) {
    // Mark the GraphQLObjectType object to avoid re-wrapping:
    if (objectType._authFieldsWrapped) return;
    objectType._authFieldsWrapped = true;

    const fields = objectType.getFields();
    Object.keys(fields).forEach(fieldName => {
      const field = fields[fieldName];
      const { resolve = defaultFieldResolver } = field;
      field.resolve = async function (...args) {
        // Get the required Permissions from the field first, falling back
        // to the objectType if no Permissions is required by the field:
        const {
          _requiredPerms: requiredPerms,
          _permsTypeName: opName = 'ALL',
          _permissionAll: permissionAll,
        } = (field._requiredPerms) ? field : objectType;
        if (!requiredPerms) {
          return resolve.apply(this, args);
        }

        const context = args[2];
        const getPerms = context[UserPerms];
        if (typeof(getPerms) === 'function') {
          const perms = await getPermsAsync();
          if (!permissionAll || !perms.includes(permissionAll)) {
            this[`_check${opName}`](perms, requiredPerms);
          }
        }

        return resolve.apply(this, args);
      };
    });
  }

  _checkALL(perms, requiredPerms) {
    if (Array.isArray(perms) && requiredPerms.every(p => perms.includes(p))) {
      return;
    }

    throw new NotAuthorizedAll({ requiredPerms });
  }

  _checkONE(perms, requiredPerms) {
    if (Array.isArray(perms) && requiredPerms.some(p => perms.includes(p))) {
      return;
    }

    throw new NotAuthorizedOne({ requiredPerms });
  }
}

module.exports = {
  UserPerms,
  NotAuthorizedAll,
  NotAuthorizedOne,
  AuthDirective,
};
