import { JsonValue, prune } from '@tscool/tsutils'
import { stringifyJson } from './object-formatter'
import { parseStack } from './stackparse'
import { CodedError, ErrorCode, StackFrame } from './types'



interface _CodedErrorOptions {
    readonly skipFrames?: number
}

class _CodedError
    extends Error
    implements CodedError
{
    constructor(
        readonly code: ErrorCode, readonly info: JsonValue, readonly inner?: CodedError,
        private options?: _CodedErrorOptions
    ) {
        super()
    }
    private _frames?: StackFrame[]

    get stackFrames(): StackFrame[]
    {
        if (!this._frames) {
            const skipFrames = this.options?.skipFrames ?? 1
            this._frames = parseStack(this.stack).slice(skipFrames)
        }
        return this._frames
    }
    toJSON() {
        return prune({
            code: this.code,
            info: this.info,
            stackFrames: this.stackFrames,
            inner: this.inner,
        }, _pruner)
    }
    toString() {
        const append = this.inner
            ? `\n\n${this.inner.toString()}`
            : ''
        return `CodedError<${this.code}>\n->info=${stringifyJson(this.info)}\n${
            this.stackFrames
                .map(frame => `  ${frame.toString()}`)
                .join('\n')
        }${append}`
    }
}

class _TypedCodedError<TCode extends ErrorCode>
    extends _CodedError
{
    constructor(
        readonly code: TCode, readonly info: JsonValue, readonly inner?: CodedError
    ) {
        super(code, info, inner)
    }
}

function _isEmptyObject(v: unknown) {
    if (v && typeof(v) === 'object') {
        return Object.keys(v).length <= 0
    }
    return false
}

function _pruner(v: unknown, k: string): boolean
{
    switch(k) {
        case 'info':
        case 'inner':
            return v === undefined || v === null || _isEmptyObject(v)
        default:
            return false
    }
}

function _pruneInner(v: unknown, k: string): boolean {
    return ['inner', 'info', 'code'].includes(k)
}

function coded<TCode extends ErrorCode>(err?: Error, code?: TCode, info: Record<string, unknown> = {}): CodedError|undefined {
    if (!err) return undefined
    if ( err instanceof _CodedError ) return err

    const ea = err as any
    return Object.assign(new _CodedError(code ?? ea.code ?? err.message, {...ea.info, ...info}, coded(ea?.inner), { skipFrames: 0 }), {
        ...prune(ea, _pruneInner),
        stack: err.stack,
    })
}

export const err = {
    create<TCode extends ErrorCode>(
        code: TCode, info: JsonValue = null, inner?: Error
    ): CodedError {
        return new _TypedCodedError(code, info, coded(inner))
    },
    coded,
}
