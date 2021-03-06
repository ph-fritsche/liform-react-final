import Ajv from 'ajv';
import { FORM_ERROR } from 'final-form';

export const buildFlatAjvValidate = (ajv, schema, ajvTranslate) => {
    if (!(ajv instanceof Ajv)) {
        ajv = new Ajv({
            allErrors: true,
        })
    }

    if (!(schema instanceof Object)) {
        schema = true
    }

    if (!(typeof(ajvTranslate) === 'function')) {
        ajvTranslate = translateAjv
    }

    return flatAjvValidate.bind(null, ajv, schema, ajvTranslate)
}

export const translateAjv = ({dataPath, keyword, params, message}) => {
    let fieldName = dataPath.substr(0, 1) === '.' ? dataPath.substr(1) : dataPath

    fieldName = fieldName.replace(/\[/g, '.').replace(/\]/g, '')

    if (keyword === 'required') {
        fieldName = (fieldName ? fieldName + '.' : '') + params.missingProperty
    }

    message = keyword.substr(0, 1).toUpperCase() + keyword.substr(1)

    return { fieldName, message }
}

export const flatAjvValidate = (ajv, schema, ajvTranslate, values) => {
    if (ajv.validate(schema, values._)) {
        return undefined
    }

    let flatErrors = {}

    ajv.errors.forEach(errorObject => {
        const translated = ajvTranslate(errorObject, values._)

        flatErrors[translated.fieldName] = flatErrors[translated.fieldName] || []
        flatErrors[translated.fieldName].push(translated.message)
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
                    Array.isArray(newErrors[fieldName]) ? newErrors[fieldName] : [newErrors[fieldName]],
                )
            }
        }

        return flatErrors
    }
}

export const buildFlatValidatorHandler = (flatErrorValidator, liform) => {
    return (values) => {
        const flatErrors = flatErrorValidator(values)
        liform.validationErrors = flatErrors
        return Object.keys(flatErrors).length > 0 ? { [FORM_ERROR]: 'The form has errors - see Liform.validationErrors' } : {}
    }
}

export const validateField = (liform, name) => {
    return typeof(liform.validationErrors) === 'object' ? liform.validationErrors[name] : undefined
}

export const buildFieldValidator = (liform, name) => {
    return validateField.bind(undefined, liform, name)
}
