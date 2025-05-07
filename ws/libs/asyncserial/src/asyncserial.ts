import { Result, chunk } from '@tscool/tsutils'

export interface ParallelizeOptions {
    readonly chunkSize: number
}

export type ParChunkCompletionCallback<TSuccess, TError> = (chunk: Result<TSuccess, TError>[]) => Promise<boolean>

export async function defaultCompletionCallback<TSuccess, TError>(_chunk: Result<TSuccess, TError>[]) {
    return true
}

/**
 * Allows parallelization, but serialized into smaller chunks. For example, if you have 100 tasks to
 * perform, you can run perhaps 5 batches of 20 parallel tasks in sequence.
 * @param tasks Callback functions to run.
 * @param chunkSize Maximum number of tasks/functions to run simultaneously.
 * @param completionCallback This is called after completing each batch. If there are error
 * results in the batch, the completionCallback can throw an error to end the whole operation,
 * omitting any remaining batches. If it returns true, the function continues to process batches.
 * If it returns false, the function stops processing and omits remaining batches.
 */
export async function *asyncSerialProcess<TSuccess, TError=Error>(
    tasks: Iterable<() => Promise<TSuccess>>,
    chunkSize = 1,
    completionCallback = defaultCompletionCallback
) {
    for(const batch of chunk(tasks, chunkSize)) {
        const promises = batch
            .map(f => f())
        const intermediate = await Promise.allSettled(promises)
        const batchres = intermediate.map(r => r.status === 'fulfilled'
            ? new Result<TSuccess, TError>(r.value)
            : new Result<TSuccess, TError>(undefined, r.reason as TError)
        )
        yield batchres
        if (!await completionCallback(batchres)) {
            break
        }
    }
}
