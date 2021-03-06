import { Liform as RealLiform } from './form'

export default function Liform (props) {
    return RealLiform({...props, theme: props.theme || Liform.theme})
}

export { RealLiform as Liform }

export { finalizeName, liformizeName, htmlizeName } from './util'
export { LiformContext, LiformContextProp, FormRenderProps } from './form'
export { Lifield, renderField, renderFinalField, FieldRenderProps } from './field'
export { compileSchema, SchemaProp } from './schema'
export { mapProperties, sortProperties, sortPropertyKeys} from './properties'
export { buildSubmitHandler, buildSubmitHandlerProps } from './submit'
export { buildFieldValidator, buildFlatValidatorHandler, buildFlatValidatorStack } from './validate'

export { default as DefaultTheme } from './DefaultTheme'
