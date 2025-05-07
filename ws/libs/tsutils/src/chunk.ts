export function *chunk<T>(items: Iterable<T>, chunkSize: number) {
    let ar: T[] = []
    for(const item of items) {
        ar.push(item)
        if (ar.length >= chunkSize) {
            yield ar
            ar = []
        }
    }
    if (ar.length > 0) {
        yield ar
    }
}
