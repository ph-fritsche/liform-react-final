import React from 'react'
import { Field } from '../Field/Field'
import { PureOption } from './PureOption'
import { LifieldRenderProps, LiformApi } from '../../types'
import { arrayOrUndef, objOrUndef } from '../shared'

export function Choice(
    {
        schema: schemaProp = true,
        input: {
            name,
            onChange: onChangeProp,
            ...input
        },
        placeholder,
        meta,
    }: LifieldRenderProps<
        string | string[],
        LiformApi,
        HTMLInputElement|HTMLSelectElement
    >,
): React.ReactElement {
    const schema = typeof schemaProp === 'object' ? schemaProp : {}

    const inputName = name + (schema.type === 'array' ? '[]' : '')

    const options: {
        value: string
        title?: string
    }[] = (schema.enum || (objOrUndef(schema.items)?.enum ?? [])).map((v, i) => ({
        value: String(v),
        title: (schema.enumTitles || objOrUndef(schema.items)?.enumTitles || [])[i],
    }))

    return schema.choiceExpanded
        ? (
            <fieldset className="liform-field liform-choice">
                <legend>{ schema && schema.title }</legend>
                <div className="liform-options">
                    { options.map((o, i) =>
                        <label key={i}>
                            <input
                                type={schema.type === 'array' ? 'checkbox' : 'radio'}
                                name={inputName}
                                value={o.value}
                                checked={
                                    schema.type === 'array'
                                        ? arrayOrUndef(input.value)?.includes(o.value)
                                        : input.value === o.value
                                }
                                onChange={e => onChangeProp(
                                    schema.type === 'array'
                                        ? (e.target.checked
                                            ? arrayOrUndef(input.value)?.concat([o.value])
                                            : arrayOrUndef(input.value)?.filter((v: string) => v !== o.value)
                                        )
                                        : (e.target.checked ? o.value : null),
                                ) }
                            />
                            { o.title || o.value }
                        </label>,
                    ) }
                </div>
                { meta.error?.map(e =>
                    <div key={e} className="liform-error">{e}</div>,
                )}
            </fieldset>
        )
        : (
            <Field className="liform-choice" schema={schema} meta={meta}>
                <select {...input}
                    multiple={schema.type === 'array'}
                    name={inputName}
                    onChange={e => onChangeProp(extractNativeSelectValue(e))}
                    onBlur={e => onChangeProp(extractNativeSelectValue(e))}
                >
                    { schema.type !== 'array' && placeholder && <option value="">{placeholder}</option> }
                    { (schema.enum || objOrUndef(schema.items)?.enum) && (
                        options.map(v => <PureOption key={v.value} value={v.value} title={v.title}/>)
                    )}
                </select>
            </Field>
        )
}

function extractNativeSelectValue(
    event: React.ChangeEvent<HTMLSelectElement> | React.FocusEvent<HTMLSelectElement>,
) {
    if (event.target.hasAttribute('multiple')) {
        const v = []
        for (let i = 0; i < event.target.selectedOptions.length; i++) {
            const item = event.target.selectedOptions.item(i)
            v.push((item as NonNullable<typeof item>).value)
        }
        return v
    }

    return event.target.value
}
