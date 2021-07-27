import { ComponentProps } from 'react'
import { Liform as RealLiform } from './form'
import { LiformTheme } from './types'

const Liform: {
    (props: ComponentProps<typeof RealLiform> & {
        theme?: LiformTheme
    }): ReturnType<typeof RealLiform>
    theme?: LiformTheme
} = (props) => RealLiform({
    ...props,
    theme: props.theme || Liform.theme,
})

export default Liform

export * from './types'

export { RealLiform as Liform }

export { finalizeName, liformizeName, htmlizeName } from './util'
export { Lifield, renderField, renderFinalField } from './field'
export { compileSchema } from './schema'
export { mapProperties, sortProperties, sortPropertyKeys } from './properties'
export { buildSubmitHandler } from './submit'
export { buildFieldValidator, buildFlatValidatorHandler, buildFlatValidatorStack } from './validate'

export { default as DefaultTheme } from './DefaultTheme'
