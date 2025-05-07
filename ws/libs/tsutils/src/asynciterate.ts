/**
 * Wraps traversal of async generator to create
 * an array. Note that Array.from(...) does not support this use case.
 * There is an NPM module, but it is preferable to implement trivial functionality
 * over bringing in more dependencies.
 * @param gen Async generator
 * @returns 
 */
export async function gen2array<T>(gen: AsyncIterable<T>): Promise<T[]> {
    const out: T[] = []
    for await(const x of gen) {
        out.push(x)
    }
    return out
}
