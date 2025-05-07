export function *count(to: number) {
    for(let i=0; i<=to; i++) {
        yield i
    }
}

export function range(start: number, stop: number, step?: number): Iterable<number>;
export function range(end: number): Iterable<number>;

export function *range(arg1: number, arg2?: number, arg3?: number): Iterable<number> {
    const step = arg3 ?? 1
    const end = arg2 ?? arg1
    const start = arg2 === undefined
        ? 0
        : arg1
    
    for(let i=start; Math.abs(i)<Math.abs(end); i=i+step) {
        yield i
    }
}
