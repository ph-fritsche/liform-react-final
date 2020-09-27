import userEvent from '@testing-library/user-event'
import { testLifield } from './_field'

it('Change file per file dialog', () => {
    const { input, getLiformValue } = testLifield({
        schema: {
            widget: 'file',
        },
    })

    const file = new File(['foo'], 'foo.txt', { type: 'text/plain' })

    expect(input).toHaveAttribute('type', 'file')
    expect(input).not.toHaveAttribute('multiple')

    userEvent.upload(input, file)

    expect(getLiformValue()).toBe(file)
})

it('Change multiple file input per file dialog', () => {
    const { input, getLiformValue } = testLifield({
        schema: {
            widget: 'file',
            attr: {
                multiple: 'multiple',
            },
        },
    })

    const files = [
        new File(['foo'], 'foo.txt', { type: 'text/plain' }),
        new File(['bar'], 'bar.txt', { type: 'text/plain' }),
    ]

    expect(input).toHaveAttribute('type', 'file')
    expect(input).toHaveAttribute('multiple')

    userEvent.upload(input, files)

    expect(Array.from(getLiformValue())).toEqual(files)
})
