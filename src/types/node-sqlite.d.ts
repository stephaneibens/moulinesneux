// Déclarations de types pour node:sqlite (Node.js v22+ / v24, API expérimentale)
declare module 'node:sqlite' {
  interface StatementResultingChanges {
    changes: number
    lastInsertRowid: number | bigint
  }

  interface StatementSyncInterface {
    all(...params: unknown[]): unknown[]
    get(...params: unknown[]): unknown
    run(...params: unknown[]): StatementResultingChanges
    iterate(...params: unknown[]): Iterable<unknown>
    sourceSQL: string
    expandedSQL: string
    setReadBigInts(readBigInts: boolean): void
    setAllowBareNamedParameters(allowBareNamedParameters: boolean): void
  }

  class DatabaseSync {
    constructor(location: string, options?: { open?: boolean; readOnly?: boolean; enableForeignKeyConstraints?: boolean; allowExtension?: boolean })
    open(): void
    close(): void
    prepare(sql: string): StatementSyncInterface
    exec(sql: string): void
    function(name: string, options: object, fn: (...args: unknown[]) => unknown): void
    function(name: string, fn: (...args: unknown[]) => unknown): void
    aggregate(name: string, options: { start?: unknown; step: (acc: unknown, ...args: unknown[]) => unknown; inverse?: (acc: unknown, ...args: unknown[]) => unknown; result?: (acc: unknown) => unknown; deterministic?: boolean; directOnly?: boolean; useBigIntArguments?: boolean; varargs?: boolean }): void
    applyChangeset(changeset: Uint8Array, options?: object): boolean
    loadExtension(path: string, entryPoint?: string): void
    isOpen: boolean
    isTransaction: boolean
    inTransaction: boolean
  }
}
