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

  visitArgumentDefinition(arg, details) {
    if (!this.args.type) {
      throw new Error('Argument "type" is required for the argument "'
        + arg.name + '" on "' + details.field.name + '"');
    }
    arg.type = this.wrapType(arg.type,
      this.args.type);
  }

  visitInputFieldDefinition(field, details) {
    if (!this.args.type) {
      throw new Error('Argument "type" is required for the Input field on '
        + '"' + details.objectType + '"');
    }
    field.type = this.wrapType(field.type,
      this.args.type);
  }

  visitFieldDefinition(field, details) {
    field.type = this.wrapType(field.type,
      this.args.type || details.objectType);
  }

  wrapType(base, typeName) {
    if (base instanceof GraphQLNonNull) {
      return new GraphQLNonNull(
        this.wrapType(base.ofType, typeName));
    } else if (base instanceof GraphQLList) {
      return new GraphQLList(
        this.wrapType(base.ofType, typeName));
    } else if (base instanceof GraphQLScalarType) {
      return new GraphQLGlobalID(base, typeName);
    }

    throw new Error(`Not a scalar type: ${base}`);
  }
}

class GraphQLGlobalID extends GraphQLScalarType {
  constructor(base, typeName) {
    super({
      name: `GraphQLGlobalID`,

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
        const { type, id } = fromGlobalId(ast.value);
        if (type !== typeName) {
          throw new Error(`RelayID: Invalid type ${type}, expected: ${typeName}`);
        }
        return id;
      }
    });
  }
}

module.exports = { RelayIdDirective };