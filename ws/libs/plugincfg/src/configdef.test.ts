import assert from 'assert'
import { basename } from 'path'
import { createConfiguration, importConfiguration } from './configdef'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    const configSources = {
        env: { INT1: '15', FLOAT1: '2.0', BOOL_ONE: '0', STRING_VAL1: 'hello', UNION_VAL: 'woof'},
        jsonConfig: { strConfig2: 'y', boolTwo: false, stringVal1: 'byebye', randoVal: 10, unionVal: 'hello' },
    }

    it('must create a config and prioritize environment variable settings', () => {
        const conf = createConfiguration(configSources)
            .addString('stringVal1', 'never')
            .addInt('defaultedInt', 2)
            .addInt('int1', 10)
            .addFloat('float1', 3.0)
            .addBoolean('boolOne', true)
            .addBoolean('boolTwo', true)
            .addUnion('unionVal', 'hello', 'hello', 'woof')
            .build()
        type _T = typeof conf
        const expected: _T = {
            stringVal1: 'hello',
            defaultedInt: 2,
            int1: 15,
            float1: 2.0,
            boolOne: false,
            boolTwo: false,
            unionVal: 'woof',
        }
        assert.deepStrictEqual(conf, expected)
    })

    it('must create a configuration using a code module', async () => {
        const conf = (await importConfiguration(configSources, './configdef.fixture.ts'))
            .addString('stringVal1', 'never')
            .addInt('defaultedInt', 2)
            .addInt('int1', 10)
            .addFloat('float1', 3.0)
            .addBoolean('boolOne', true)
            .addBoolean('boolTwo', true)
            .addUnion('unionVal', 'hello', 'hello', 'woof')
            .addArray('ar', [1, 'ten'])
            .build()
        type _T = typeof conf
        const expected: _T = {
            stringVal1: 'hello',
            defaultedInt: 2,
            int1: 15,
            float1: 2.0,
            boolOne: false,
            boolTwo: false,
            unionVal: 'woof',
            ar: [1, 'ten'],
        }
        assert.deepStrictEqual(conf, expected)
    })
})
