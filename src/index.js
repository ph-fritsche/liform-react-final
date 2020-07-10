import { Liform as RealLiform } from './form'

export default function Liform (props) {
    return RealLiform({...props, theme: props.theme || Liform.theme})
}

export { RealLiform as Liform }

export { Lifield, finalizeName, liformizeName, htmlizeName, renderField, renderFinalField } from './field'
export { compileSchema } from './schema'
export { mapProperties, sortProperties, sortPropertyKeys} from './properties'
export { buildSubmitHandler } from './submit'
export { buildFieldValidator, buildFlatValidatorHandler, buildFlatValidatorStack } from './validate'

export { default as DefaultTheme } from './themes/default'
