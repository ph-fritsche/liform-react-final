import { createContext, useContext } from 'react';
import { LiformApi, LiformTheme } from '../types';

export const LiformContext = createContext<LiformApi|undefined>(undefined)

export function useLiform<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Value extends unknown = any,
    Theme extends LiformTheme = LiformTheme,
>(): LiformApi<Value, Theme> {
    const context = useContext(LiformContext)

    if (!context) {
        throw new Error(`useLiform must be used inside <Liform>`)
    }

    return context as LiformApi<Value, Theme>
}
