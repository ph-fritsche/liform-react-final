import { finalizeName, liformizeName, htmlizeName } from '../src/util'

it('Liform to Final form', () => {
    expect(finalizeName(undefined)).toBe('_')
    expect(finalizeName('')).toBe('_')
    expect(finalizeName('foo')).toBe('_.foo')
})

it('Final Form to Liform', () => {
    expect(liformizeName('_')).toBe('')
    expect(liformizeName('_.foo')).toBe('foo')
    expect(liformizeName('_[0]')).toBe('0')
})

it('Final Form to HTML', () => {
    expect(htmlizeName('_', '')).toBe('')
    expect(htmlizeName('_', 'baz')).toBe('baz')
    expect(htmlizeName('_.foo', '')).toBe('foo')
    expect(htmlizeName('_.foo', 'baz')).toBe('baz[foo]')
    expect(htmlizeName('_.foo[1].bar', '')).toBe('foo[1][bar]')
    expect(htmlizeName('_.foo[1].bar', 'baz')).toBe('baz[foo][1][bar]')
})
