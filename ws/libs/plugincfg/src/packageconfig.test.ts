import assert from 'assert'
import { basename } from 'path'
import { loadModuleConfig, findModuleFile } from './packageconfig'

describe(`${basename(module.filename, '.test.ts')} module`, () => {
    it('must find package.config', () => {
        const cfg = findModuleFile()
        assert(cfg)
    })

    it('must load a configuration from JSON', () => {
        const cfg: any = loadModuleConfig<Record<string, string>>((json: any) => json.scripts, 'package.json')
        assert('test' in cfg)
    })

    it('must respect an absolute path', () => {
        const filepath = findModuleFile('/etc/foo.cfg')
        assert.strictEqual(filepath, undefined, 'must be an empty result since file not found')
    })
})
