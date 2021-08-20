import Ajv from 'ajv';
import { FORM_ERROR } from 'final-form';
import { FinalFormValue, LiformApi, LiformErrors, LiformSchema } from './types';

export function buildFlatAjvValidate(
    ajv: Ajv.Ajv | undefined,
    schema: LiformSchema,
    ajvTranslate: typeof translateAjv,
): (values: Parameters<typeof flatAjvValidate>[3]) => ReturnType<typeof flatAjvValidate> {
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

export interface AjvTranslator {
    (error: Ajv.ErrorObject, values: unknown): undefined | {
        fieldName: string,
        message: string
    }
}

export const translateAjv: AjvTranslator = (
    {dataPath, keyword, params, message},
) => {
    let fieldName = dataPath.substr(0, 1) === '.' ? dataPath.substr(1) : dataPath

    fieldName = fieldName.replace(/\[/g, '.').replace(/\]/g, '')
        .replace(/^\./, '')

    if (keyword === 'required' && 'missingProperty' in params) {
        fieldName = (fieldName ? fieldName + '.' : '') + params.missingProperty
    }

    message = keyword.substr(0, 1).toUpperCase() + keyword.substr(1)

    return { fieldName, message }
}

export function flatAjvValidate(
    ajv: Ajv.Ajv,
    schema: LiformSchema,
    ajvTranslate: typeof translateAjv,
    values: unknown,
): LiformErrors | undefined {
    if (schema === null || typeof(schema) === 'number' || ajv.validate(schema, values)) {
        return undefined
    }

    const flatErrors: LiformErrors = {}

    ajv.errors?.forEach(errorObject => {
        const translated = ajvTranslate(errorObject, values)
        if (translated === undefined) {
            return
        }

        flatErrors[translated.fieldName] = flatErrors[translated.fieldName] || []
        flatErrors[translated.fieldName].push(translated.message)
    })

    return flatErrors
}

export interface FlatValidator {
    (values: unknown, liform: LiformApi): LiformErrors|undefined
}

export function buildFlatValidatorStack(
    ...validators: FlatValidator[]
): FlatValidator {
    return (values, liform) => {
        const flatErrors: LiformErrors = {}

        for (const validator of validators) {
            const newErrors = validator(values, liform)
            for (const fieldName in newErrors) {
                flatErrors[fieldName] = flatErrors[fieldName] ?? []
                flatErrors[fieldName] = flatErrors[fieldName].concat(newErrors[fieldName])
            }
        }

        return flatErrors
    }
}

export function buildFlatValidatorHandler(
    flatErrorValidator: FlatValidator,
    liform: LiformApi,
) {
    return (
        values: FinalFormValue<unknown>,
    ): {[FORM_ERROR]?: string} => {
        const flatErrors = flatErrorValidator(values?._, liform)

        liform.validationErrors = flatErrors

        return flatErrors && Object.keys(flatErrors).length > 0
            ? { [FORM_ERROR]: 'The form has errors - see Liform.validationErrors' }
            : {}
    }
}

export function validateField(
    liform: LiformApi,
    name: string,
): string[]|undefined {
    return liform.validationErrors?.[name]
}

export function buildFieldValidator(
    liform: LiformApi,
    name: string,
): () => string[]|undefined {
    return validateField.bind(undefined, liform, name)
}
