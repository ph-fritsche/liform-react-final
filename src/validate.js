import Ajv from "ajv";
import { setIn, getIn } from "final-form";

export const buildFlatAjvValidate = (ajv, schema, rootName) => {
    if (!(ajv instanceof Ajv)) {
        ajv = new Ajv({
            allErrors: true,
        })
    }

    if (!(schema instanceof Object)) {
        schema = true
    }

    return flatAjvValidate.bind(null, ajv, schema, rootName)
}

export const flatAjvValidate = (ajv, schema, rootName, values) => {
    if (ajv.validate(schema, values)) {
        return undefined
    }

    let flatErrors = {}

    ajv.errors.map(({dataPath, keyword, message, params}) => {
        let fieldName = [...String(rootName || '').split('.'), ...String(dataPath).split('.')].filter(v => v != '').join('.')

        if (keyword === 'required') {
            fieldName = (fieldName ? fieldName + '.' : '') + params.missingProperty
        }

        flatErrors[fieldName] = flatErrors[fieldName] || []
        flatErrors[fieldName].push({keyword, message})
    })

    return flatErrors
}

export const buildFlatValidatorStack = (...validators) => {
    return (values) => {
        const flatErrors = {}

        for (const validator of validators) {
            const newErrors = validator(values)
            for (const fieldName in newErrors) {
                flatErrors[fieldName] = (flatErrors[fieldName] || []).concat(
                    Array.isArray(newErrors[fieldName]) ? newErrors[fieldName] : [newErrors[fieldName]]
                )
            }
        }

        return flatErrors
    }
}

export const buildFlatValidatorExpander = (rootName, flatErrorValidator) => {
    return (values) => {
        let errorObject = {}
        const flatErrors = flatErrorValidator(values)

        // Reverse order for walking over children first
        for (const fieldName of Object.keys(flatErrors).sort().reverse()) {
            let nodePath
            if (rootName && fieldName === rootName) {
                nodePath = ''
            } else if (rootName && fieldName.startsWith(rootName + '.')) {
                nodePath = fieldName.slice(String(rootName).length + 1)
            } else {
                nodePath = fieldName
            }

            let nodeErrors = getIn(errorObject, nodePath)

            // If there are errors set for a property, skip over the object
            if ((nodeErrors instanceof Object) && !Array.isArray(nodeErrors)) {
                continue;
            }

            nodeErrors = Array.isArray(nodeErrors) ? nodeErrors : []

            errorObject = setIn(errorObject, nodePath, nodeErrors.concat(
                Array.isArray(flatErrors[fieldName]) ? flatErrors[fieldName] : [flatErrors[fieldName]]
            ))
        }

        return errorObject
    }
}
