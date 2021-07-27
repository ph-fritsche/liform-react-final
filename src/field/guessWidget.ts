import { LifieldRender, LifieldWidget, LiformSchema, LiformTheme } from '../types'

export function guessWidget<
    T extends LiformTheme
>(
    fieldSchema: LiformSchema = true,
    theme: T,
): LifieldWidget|LifieldRender {
    const guesses: (string | null)[] = []

    if (typeof fieldSchema === 'object' && fieldSchema.widget) {
        for (const propGuess of Array.isArray(fieldSchema.widget) ? fieldSchema.widget : [fieldSchema.widget]) {
            if (theme.field?.[propGuess]) {
                return theme.field[propGuess]
            }
            guesses.push(propGuess)
        }
    }

    let typeGuess: string | null = null
    if (typeof fieldSchema === 'object') {
        if (Object.prototype.hasOwnProperty.call(fieldSchema, 'enum')) {
            typeGuess = 'choice'
        } else if (Object.prototype.hasOwnProperty.call(fieldSchema, 'oneOf')) {
            typeGuess = 'oneOf'
        } else if (fieldSchema.format && theme.field?.[fieldSchema.format]) {
            typeGuess = fieldSchema.format
        } else {
            typeGuess = (Array.isArray(fieldSchema.type) ? fieldSchema.type.join(',') : fieldSchema.type) || null
        }
    }
    if (guesses.indexOf(typeGuess) < 0) {
        guesses.push(typeGuess)
    }

    if (!theme.field?.[String(typeGuess)]) {
        throw new Error('Liform: No widget defined for ' + guesses.map(v => v === null ? '(null)' : v) + '\n' + JSON.stringify(fieldSchema))
    }

    return theme.field[String(typeGuess)]
}
