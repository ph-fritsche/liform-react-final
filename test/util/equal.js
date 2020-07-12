import { shallowEqual } from '../../src/util/equal'

describe('Shallow equal', () => {
    it('Compare arrays', () => {
        expect(shallowEqual(
            ['a', 'b', 'c'],
            ['a', 'b', 'c'],
        )).toEqual(true)

        expect(shallowEqual(
            ['a', 'c', 'b'],
            ['a', 'b', 'c'],
        )).toEqual(false)

        expect(shallowEqual(
            ['a', 'b'],
            ['a', 'b', 'c'],
        )).toEqual(false)

        expect(shallowEqual(
            ['a', 'b', 'c'],
            ['a', 'b'],
        )).toEqual(false)

        expect(shallowEqual(
            ['a', 'b', 'c'],
            'abc',
        )).toEqual(false)
    })

    it('Compare objects', () => {
        expect(shallowEqual(
            {a: 'a', b: 'b', c: 'c'},
            {a: 'a', b: 'b', c: 'c'},
        )).toEqual(true)

        expect(shallowEqual(
            {a: 'a', c: 'c', b: 'b'},
            {a: 'a', b: 'b', c: 'c'},
        )).toEqual(true)

        expect(shallowEqual(
            {a: 'a', b: 'b', c: 'c'},
            {a: 'a', b: 'd', c: 'c'},
        )).toEqual(false)

        expect(shallowEqual(
            {a: 'a', b: 'b'},
            {a: 'a', b: 'b', c: 'c'},
        )).toEqual(false)

        expect(shallowEqual(
            {a: 'a', b: 'b', c: 'c'},
            {a: 'a', b: 'b'},
        )).toEqual(false)

        expect(shallowEqual(
            {a: 'a', b: 'b', c: 'c'},
            ['a', 'b', 'c'],
        )).toEqual(false)

        expect(shallowEqual(
            {a: 'a', b: 'b', c: 'c'},
            'abc',
        )).toEqual(false)
    })

    it('Compare scalars', () => {
        expect(shallowEqual(
            'a',
            'a',
        )).toEqual(true)

        expect(shallowEqual(
            '2',
            2,
        )).toEqual(true)

        expect(shallowEqual(
            'a',
            'b',
        )).toEqual(false)

        expect(shallowEqual(
            '2',
            1,
        )).toEqual(false)
    })
})
