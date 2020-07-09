import DefaultTheme from "./themes/default";

import { Liform as RealLiform } from './form'

function Liform (props) {
    return RealLiform({...props, theme: props.theme || Liform.defaultTheme})
}
Liform.defaultTheme = DefaultTheme

export default Liform;

export {
    RealLiform as Liform,
};
