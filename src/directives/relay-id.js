const {
  defaultFieldResolver,
  GraphQLList,
  GraphQLNonNull,
  GraphQLScalarType,
} = require('graphql');
const { SchemaDirectiveVisitor } = require('graphql-tools');
const {
  fromGlobalId,
  toGlobalId,
} = require('graphql-relay');

class RelayIdDirective extends SchemaDirectiveVisitor {

  visitInputFieldDefinition(field, details) {
    if (!this.args.type) {
      throw new Error('Argument "type" is required for the Input field on '
        + details.objectType);
    }
    field.type = this.wrapType(field.type,
      this.args.type);
  }

  visitFieldDefinition(field, details) {
    field.type = this.wrapType(field.type,
      this.args.type || details.objectType);
  }

  wrapType(type, typeName) {
    if (type instanceof GraphQLNonNull) {
      return new GraphQLNonNull(
        this.wrapType(type.ofType, typeName));
    } else if (type instanceof GraphQLList) {
      return new GraphQLList(
        this.wrapType(type.ofType, typeName));
    } else if (type instanceof GraphQLScalarType) {
      return new GraphQLRelayID(type, typeName);
    }

    throw new Error(`Not a scalar type: ${type}`);
  }
}

class GraphQLRelayID extends GraphQLScalarType {
  constructor(base, typeName) {
    super({
      name: `GraphQLRelayID`,

      serialize(value) {
        value = base.serialize(value);
        return toGlobalId(typeName, value);
      },

      parseValue(value) {
        const { type, id } = fromGlobalId(value);
        if (type !== typeName) {
          throw new Error(`RelayID: Invalid type ${type}, expected: ${typeName}`);
        }
        return base.parseValue(id);
      },

      parseLiteral(ast) {
        const { type, id } = fromGlobalId(ast);
        if (type !== typeName) {
          throw new Error(`RelayID: Invalid type ${type}, expected: ${typeName}`);
        }
        return base.parseLiteral(id);
      }
    });
  }
}

module.exports = { RelayIdDirective };