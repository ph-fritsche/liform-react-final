import { default as userEvent } from '@testing-library/user-event'
import { testLifield } from './_field'

it('Change file per file dialog', () => {
    const { field, getLiformValue } = testLifield({
        schema: {
            widget: 'file',
            title: 'foo',
        },
    })

    const file = new File(['foo'], 'foo.txt', { type: 'text/plain' })

    expect(field).toHaveAttribute('type', 'file')
    expect(field).not.toHaveAttribute('multiple')

    userEvent.upload(field, file)

    expect(getLiformValue()).toBe(file)
})

it('Change multiple file input per file dialog', () => {
    const { field, getLiformValue } = testLifield({
        schema: {
            widget: 'file',
            title: 'foo',
            attr: {
                multiple: 'multiple',
            },
        },
    })

    const files = [
        new File(['foo'], 'foo.txt', { type: 'text/plain' }),
        new File(['bar'], 'bar.txt', { type: 'text/plain' }),
    ]

    expect(field).toHaveAttribute('type', 'file')
    expect(field).toHaveAttribute('multiple')

    userEvent.upload(field, files)

    expect(Array.from(getLiformValue())).toEqual(files)
})
