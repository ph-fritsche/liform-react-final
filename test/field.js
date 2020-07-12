import DefaultTheme from '../src/themes/default'
import { renderField } from '../src/field'

describe('Render a field', () => {
    const liformContext = {
        theme: DefaultTheme,
        render: {
            field: renderField,
        },
        rootName: '',
        'schema':{'title':'text','type':'string','attr':[],'widget':['_text','text','form']},
        'meta':null
    }

    it('Render a text field', () => {
        const reactNode = renderField({liform: liformContext, schema: liformContext.schema})

        expect(reactNode).toBeTruthy()
    })
})