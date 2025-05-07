export class Result<TSuccess, TError>
{
    constructor(
        readonly value?: TSuccess,
        readonly error?: TError,
    ){}

    get ok() {
        return !this.error
    }

    get failed() {
        return !!this.error
    }

    unwrap(transformError?: (e: TError) => TError): TSuccess {
        if (this.failed) {
            const error = transformError
                ? transformError(this.error as TError)
                : this.error
            throw error
        }
        return this.value as TSuccess
    }

    static builder<TSuccess, TError = Error>() {
        return {
            ok(value: TSuccess) {
                return new Result<TSuccess, TError>(value)
            },
            failed(error: TError) {
                return new Result<TSuccess, TError>(undefined, error)
            },
        }
    }
}

export function trySync<TSuccess, TError=Error>(f: () => TSuccess): Result<TSuccess, TError> {
    const builder = Result.builder<TSuccess, TError>()
    try {
        return builder.ok(f())
    } catch(e) {
        return builder.failed(e as TError)
    }
}

export async function tryAsync<TSuccess, TError=Error>(f: () => TSuccess): Promise<Result<TSuccess, TError>> {
    const builder = Result.builder<TSuccess, TError>()
    try {
        const result = await f()
        return builder.ok(result)
    } catch(e) {
        return builder.failed(e as TError)
    }
}

export function succeeded<TSuccess, TError=Error>(value: TSuccess) {
    return new Result<TSuccess, TError>(value)
}

export function failed<TSuccess, TError>(error: TError) {
    return new Result<TSuccess, TError>(undefined, error)
}
