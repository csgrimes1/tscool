import { Buffer } from 'buffer'
import { createHmac } from 'crypto'

export function hmac(key: string, data: string, alg = 'sha256', encoding: BufferEncoding = 'hex'): string {
    const mac = createHmac(alg, key)
    mac.write(data)
    mac.end()
    const buf: Buffer = mac.read()
    return buf.toString(encoding)
}
