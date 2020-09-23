import { default as userEvent } from '@testing-library/user-event'
import { testLifield } from './_field'

describe('File input', () => {
    it('Change file per file dialog', () => {
        const { field, getLiformValue } = testLifield({
            schema: {
                widget: 'file',
                title: 'foo',
            },
        })

        const file = new File(['foo'], 'foo.txt', { type: 'text/plain' })

        expect(field).toHaveAttribute('type', 'file')

        userEvent.upload(field, file)

        expect(getLiformValue()).toBe(file)
    })
})
