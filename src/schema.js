import PropTypes from 'prop-types'

function isObject(thing) {
    return typeof thing === 'object' && thing !== null && !Array.isArray(thing);
}

export const compileSchema = (schema, root) => {
    if (!root) {
        root = schema;
    }
    let newSchema;

    if (isObject(schema)) {
        newSchema = {};
        for (let i in schema) {
            if (Object.prototype.hasOwnProperty.call(schema, i)) {
                if (i === '$ref') {
                    newSchema = compileSchema(resolveRef(schema[i], root), root);
                } else {
                    newSchema[i] = compileSchema(schema[i], root);
                }
            }
        }
        return newSchema;
    }

    if (Array.isArray(schema)) {
        newSchema = [];
        for (let i = 0; i < schema.length; i += 1) {
            newSchema[i] = compileSchema(schema[i], root);
        }
        return newSchema;
    }

    return schema;
}

function resolveRef(uri, schema) {
    uri = uri.replace('#/', '');
    const tokens = uri.split('/');
    const tip = tokens.reduce((obj, token) => obj[token], schema);

    return tip;
}

export function SchemaProp (...args) {
    return SchemaPropValidator(...args)
}
const SchemaPropValidator = PropTypes.oneOfType([PropTypes.bool, PropTypes.shape({
    widget: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),

    title: PropTypes.string,
    description: PropTypes.string,
    placeholder: PropTypes.string,

    type: PropTypes.string,

    properties: PropTypes.objectOf(SchemaProp),
    propertyOrder: PropTypes.number,
    required: PropTypes.arrayOf(PropTypes.string),

    enum: PropTypes.arrayOf(PropTypes.string),
    enumTitles: PropTypes.arrayOf(PropTypes.string),

    items: PropTypes.oneOfType([SchemaProp, PropTypes.arrayOf(SchemaProp)]),
    additionalItems: SchemaProp,
    allowAdd: PropTypes.bool,
    allowDelete: PropTypes.bool,
    minItems: PropTypes.number,
    maxItems: PropTypes.number,
})])
