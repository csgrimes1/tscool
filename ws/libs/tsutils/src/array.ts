export type ArrayAtLeastOneElement<T> = [T, ...T[]] & ReadonlyArray<T>
export type ArrayAtLeastTwoElements<T> = [T, T, ...T[]]  & ReadonlyArray<T>
