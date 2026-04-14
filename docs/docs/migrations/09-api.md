# 查询执行器 API

为了使用 API 更改数据库架构，你可以使用 `QueryRunner`。

```ts
import {
    MigrationInterface,
    QueryRunner,
    Table,
    TableIndex,
    TableColumn,
    TableForeignKey,
} from "typeorm"

export class QuestionRefactoringTIMESTAMP implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "question",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                    },
                    {
                        name: "name",
                        type: "varchar",
                    },
                ],
            }),
            true,
        )

        await queryRunner.createIndex(
            "question",
            new TableIndex({
                name: "IDX_QUESTION_NAME",
                columnNames: ["name"],
            }),
        )

        await queryRunner.createTable(
            new Table({
                name: "answer",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                    },
                    {
                        name: "name",
                        type: "varchar",
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true,
        )

        await queryRunner.addColumn(
            "answer",
            new TableColumn({
                name: "questionId",
                type: "int",
            }),
        )

        await queryRunner.createForeignKey(
            "answer",
            new TableForeignKey({
                columnNames: ["questionId"],
                referencedColumnNames: ["id"],
                referencedTableName: "question",
                onDelete: "CASCADE",
            }),
        )
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        const table = await queryRunner.getTable("answer")
        const foreignKey = table.foreignKeys.find(
            (fk) => fk.columnNames.indexOf("questionId") !== -1,
        )
        await queryRunner.dropForeignKey("answer", foreignKey)
        await queryRunner.dropColumn("answer", "questionId")
        await queryRunner.dropTable("answer")
        await queryRunner.dropIndex("question", "IDX_QUESTION_NAME")
        await queryRunner.dropTable("question")
    }
}
```

---

```ts
getDatabases(): Promise<string[]>
```

返回所有可用的数据库名称，包括系统数据库。

---

```ts
getSchemas(database?: string): Promise<string[]>
```

- `database` - 如果指定了数据库参数，则返回该数据库的架构列表

返回所有可用的架构名称，包括系统架构。仅适用于 SQLServer 和 Postgres。

---

```ts
getTable(tableName: string): Promise<Table|undefined>
```

- `tableName` - 需要加载的表名

根据给定名称从数据库中加载表。

---

```ts
getTables(tableNames: string[]): Promise<Table[]>
```

- `tableNames` - 需要加载的表名数组

根据给定名称数组从数据库中加载多个表。

---

```ts
hasDatabase(database: string): Promise<boolean>
```

- `database` - 需要检查的数据库名

检查指定名称的数据库是否存在。

---

```ts
hasSchema(schema: string): Promise<boolean>
```

- `schema` - 需要检查的架构名

检查指定名称的架构是否存在。仅用于 SqlServer 和 Postgres。

---

```ts
hasTable(table: Table|string): Promise<boolean>
```

- `table` - 表对象或表名

检查表是否存在。

---

```ts
hasColumn(table: Table|string, columnName: string): Promise<boolean>
```

- `table` - 表对象或表名
- `columnName` - 需要检查的列名

检查表中列是否存在。

---

```ts
createDatabase(database: string, ifNotExists?: boolean): Promise<void>
```

- `database` - 数据库名称
- `ifNotExists` - 如果设置为 `true`，当数据库已存在时静默忽略；否则抛出错误（默认）

创建一个新数据库。

---

```ts
dropDatabase(database: string, ifExists?: boolean): Promise<void>
```

- `database` - 数据库名称
- `ifExists` - 如果设置为 `true`，当数据库不存在时静默忽略；否则抛出错误（默认）

删除数据库。

---

```ts
createSchema(schemaPath: string, ifNotExists?: boolean): Promise<void>
```

- `schemaPath` - 架构名。对于 SqlServer，可以接受架构路径（例如 'dbName.schemaName'）作为参数。  
  如果传入架构路径，则将在指定数据库中创建架构
- `ifNotExists` - 如果设置为 `true`，当架构已存在时静默忽略；否则抛出错误（默认）

创建一个新的表架构。

---

```ts
dropSchema(schemaPath: string, ifExists?: boolean, isCascade?: boolean): Promise<void>
```

- `schemaPath` - 架构名。对于 SqlServer，可以接受架构路径（例如 'dbName.schemaName'）作为参数。  
  如果传入架构路径，则将在指定数据库中删除架构
- `ifExists` - 如果设置为 `true`，当架构不存在时静默忽略；否则抛出错误（默认）
- `isCascade` - 如果为 `true`，自动删除架构中的对象（表、函数等）。仅适用于 Postgres。

删除一个表架构。

---

```ts
createTable(table: Table, ifNotExists?: boolean, createForeignKeys?: boolean, createIndices?: boolean): Promise<void>
```

- `table` - Table object.
- `ifNotExists` - when set to `true`, silently ignores if the table already exists; otherwise throws an error (default)
- `createForeignKeys` - indicates whether foreign keys will be created on table creation. Default `true`
- `createIndices` - indicates whether indexes will be created on table creation. Default `true`

创建一个新表。

---

```ts
dropTable(table: Table|string, ifExists?: boolean, dropForeignKeys?: boolean, dropIndices?: boolean): Promise<void>
```

- `table` - Table object or table name to be dropped
- `ifExists` - when set to `true`, silently ignores if the table does not exist; otherwise throws an error (default)
- `dropForeignKeys` - indicates whether foreign keys will be dropped on table deletion. Default `true`
- `dropIndices` - indicates whether indexes will be dropped on table deletion. Default `true`

删除一个表。

---

```ts
createView(view: View, syncWithMetadata?: boolean, oldView?: View): Promise<void>
```

- `view` - View object
- `syncWithMetadata` - indicates whether to sync view with metadata (optional)
- `oldView` - old View object to be replaced (optional)

Creates a new view.

---

```ts
dropView(view: View|string, ifExists?: boolean): Promise<void>
```

- `view` - View object or view name to be dropped
- `ifExists` - when set to `true`, silently ignores if the view does not exist; otherwise throws an error (default)

Drops a view.

---

```ts
renameTable(oldTableOrName: Table|string, newTableName: string): Promise<void>
```

- `oldTableOrName` - 要重命名的旧表对象或名称
- `newTableName` - 新表名

重命名一个表。

---

```ts
addColumn(table: Table|string, column: TableColumn): Promise<void>
```

- `table` - 表对象或名称
- `column` - 新列

添加一个新列。

---

```ts
addColumns(table: Table|string, columns: TableColumn[]): Promise<void>
```

- `table` - 表对象或名称
- `columns` - 新列数组

添加多个新列。

---

```ts
renameColumn(table: Table|string, oldColumnOrName: TableColumn|string, newColumnOrName: TableColumn|string): Promise<void>
```

- `table` - 表对象或名称
- `oldColumnOrName` - 旧列。可以是 TableColumn 对象或列名
- `newColumnOrName` - 新列。可以是 TableColumn 对象或列名

重命名一个列。

---

```ts
changeColumn(table: Table|string, oldColumn: TableColumn|string, newColumn: TableColumn): Promise<void>
```

- `table` - 表对象或名称
- `oldColumn` - 旧列。可以是 TableColumn 对象或列名
- `newColumn` - 新列。必须是 TableColumn 对象

修改表中的列。

---

```ts
changeColumns(table: Table|string, changedColumns: { oldColumn: TableColumn, newColumn: TableColumn }[]): Promise<void>
```

- `table` - 表对象或名称
- `changedColumns` - 修改列数组。  
    - `oldColumn` - 旧 TableColumn 对象  
    - `newColumn` - 新 TableColumn 对象

修改表中的多个列。

---

```ts
dropColumn(table: Table|string, column: TableColumn|string, ifExists?: boolean): Promise<void>
```

- `table` - 表对象或名称
- `column` - 要删除的 TableColumn 对象或列名
- `ifExists` - 如果设置为 `true`，当列不存在时静默忽略；否则抛出错误（默认）

删除表中的一个列。

---

```ts
dropColumns(table: Table|string, columns: TableColumn[]|string[], ifExists?: boolean): Promise<void>
```

- `table` - 表对象或名称
- `columns` - 要删除的 TableColumn 对象数组或列名数组
- `ifExists` - 如果设置为 `true`，当列不存在时静默忽略；否则抛出错误（默认）

删除表中的多个列。

---

```ts
createPrimaryKey(table: Table|string, columnNames: string[]): Promise<void>
```

- `table` - 表对象或名称
- `columnNames` - 将作为主键的列名数组

创建一个新的主键。

---

```ts
updatePrimaryKeys(table: Table|string, columns: TableColumn[]): Promise<void>
```

- `table` - 表对象或名称
- `columns` - 将被更新的 TableColumn 对象数组

更新复合主键。

---

```ts
dropPrimaryKey(table: Table|string, constraintName?: string, ifExists?: boolean): Promise<void>
```

- `table` - 表对象或名称
- `constraintName` - 约束名称（可选）
- `ifExists` - 如果设置为 `true`，当主键不存在时静默忽略；否则抛出错误（默认）

删除主键。

---

```ts
createUniqueConstraint(table: Table|string, uniqueConstraint: TableUnique): Promise<void>
```

- `table` - 表对象或名称
- `uniqueConstraint` - 要创建的 TableUnique 对象

创建新的唯一约束。

> Note: does not work for MySQL, because MySQL stores unique constraints as unique indexes. Use `createIndex()` method instead.

---

```ts
createUniqueConstraints(table: Table|string, uniqueConstraints: TableUnique[]): Promise<void>
```

- `table` - 表对象或名称
- `uniqueConstraints` - 要创建的 TableUnique 对象数组

创建新的唯一约束。

> Note: does not work for MySQL, because MySQL stores unique constraints as unique indexes. Use `createIndices()` method instead.

---

```ts
dropUniqueConstraint(table: Table|string, uniqueOrName: TableUnique|string, ifExists?: boolean): Promise<void>
```

- `table` - 表对象或名称
- `uniqueOrName` - 要删除的 TableUnique 对象或唯一约束名称
- `ifExists` - 如果设置为 `true`，当约束不存在时静默忽略；否则抛出错误（默认）

删除唯一约束。

> Note: does not work for MySQL, because MySQL stores unique constraints as unique indexes. Use `dropIndex()` method instead.

---

```ts
dropUniqueConstraints(table: Table|string, uniqueConstraints: TableUnique[], ifExists?: boolean): Promise<void>
```

- `table` - 表对象或名称
- `uniqueConstraints` - 要删除的 TableUnique 对象数组
- `ifExists` - 如果设置为 `true`，当约束不存在时静默忽略；否则抛出错误（默认）

删除唯一约束。

> Note: does not work for MySQL, because MySQL stores unique constraints as unique indexes. Use `dropIndices()` method instead.

---

```ts
createCheckConstraint(table: Table|string, checkConstraint: TableCheck): Promise<void>
```

- `table` - 表对象或名称
- `checkConstraint` - TableCheck 对象

创建新的检查约束。

> 注意：MySQL 不支持检查约束。

---

```ts
createCheckConstraints(table: Table|string, checkConstraints: TableCheck[]): Promise<void>
```

- `table` - 表对象或名称
- `checkConstraints` - TableCheck 对象数组

创建新的检查约束。

> 注意：MySQL 不支持检查约束。

---

```ts
dropCheckConstraint(table: Table|string, checkOrName: TableCheck|string, ifExists?: boolean): Promise<void>
```

- `table` - 表对象或名称
- `checkOrName` - TableCheck 对象或检查约束名称
- `ifExists` - 如果设置为 `true`，当约束不存在时静默忽略；否则抛出错误（默认）

删除检查约束。

> 注意：MySQL 不支持检查约束。

---

```ts
dropCheckConstraints(table: Table|string, checkConstraints: TableCheck[], ifExists?: boolean): Promise<void>
```

- `table` - 表对象或名称
- `checkConstraints` - TableCheck 对象数组
- `ifExists` - 如果设置为 `true`，当约束不存在时静默忽略；否则抛出错误（默认）

删除检查约束。

> 注意：MySQL 不支持检查约束。

---

```ts
createExclusionConstraint(table: Table|string, exclusionConstraint: TableExclusion): Promise<void>
```

- `table` - Table object or name
- `exclusionConstraint` - TableExclusion object

Creates a new exclusion constraint.

> Note: only PostgreSQL supports exclusion constraints.

---

```ts
createExclusionConstraints(table: Table|string, exclusionConstraints: TableExclusion[]): Promise<void>
```

- `table` - Table object or name
- `exclusionConstraints` - array of TableExclusion objects

Creates new exclusion constraints.

> Note: only PostgreSQL supports exclusion constraints.

---

```ts
dropExclusionConstraint(table: Table|string, exclusionOrName: TableExclusion|string, ifExists?: boolean): Promise<void>
```

- `table` - Table object or name
- `exclusionOrName` - TableExclusion object or exclusion constraint name
- `ifExists` - when set to `true`, silently ignores if the constraint does not exist; otherwise throws an error (default)

Drops an exclusion constraint.

> Note: only PostgreSQL supports exclusion constraints.

---

```ts
dropExclusionConstraints(table: Table|string, exclusionConstraints: TableExclusion[], ifExists?: boolean): Promise<void>
```

- `table` - Table object or name
- `exclusionConstraints` - array of TableExclusion objects
- `ifExists` - when set to `true`, silently ignores if the constraints do not exist; otherwise throws an error (default)

Drops exclusion constraints.

> Note: only PostgreSQL supports exclusion constraints.

---

```ts
createForeignKey(table: Table|string, foreignKey: TableForeignKey): Promise<void>
```

- `table` - 表对象或名称
- `foreignKey` - TableForeignKey 对象

创建新的外键。

---

```ts
createForeignKeys(table: Table|string, foreignKeys: TableForeignKey[]): Promise<void>
```

- `table` - 表对象或名称
- `foreignKeys` - TableForeignKey 对象数组

创建新的外键。

---

```ts
dropForeignKey(table: Table|string, foreignKeyOrName: TableForeignKey|string, ifExists?: boolean): Promise<void>
```

- `table` - 表对象或名称
- `foreignKeyOrName` - TableForeignKey 对象或外键名称
- `ifExists` - 如果设置为 `true`，当外键不存在时静默忽略；否则抛出错误（默认）

删除外键。

---

```ts
dropForeignKeys(table: Table|string, foreignKeys: TableForeignKey[], ifExists?: boolean): Promise<void>
```

- `table` - 表对象或名称
- `foreignKeys` - TableForeignKey 对象数组
- `ifExists` - 如果设置为 `true`，当外键不存在时静默忽略；否则抛出错误（默认）

删除多个外键。

---

```ts
createIndex(table: Table|string, index: TableIndex): Promise<void>
```

- `table` - 表对象或名称
- `index` - TableIndex 对象

创建新的索引。

---

```ts
createIndices(table: Table|string, indices: TableIndex[]): Promise<void>
```

- `table` - 表对象或名称
- `indices` - TableIndex 对象数组

Creates new indexes.

---

```ts
dropIndex(table: Table|string, index: TableIndex|string, ifExists?: boolean): Promise<void>
```

- `table` - 表对象或名称
- `index` - TableIndex 对象或索引名称
- `ifExists` - 如果设置为 `true`，当索引不存在时静默忽略；否则抛出错误（默认）

删除索引。

---

```ts
dropIndices(table: Table|string, indices: TableIndex[], ifExists?: boolean): Promise<void>
```

- `table` - Table object or name
- `indices` - array of TableIndex objects
- `ifExists` - when set to `true`, silently ignores if the indexes do not exist; otherwise throws an error (default)

Drops indexes.

---

```ts
clearTable(tableName: string, options?: {cascade?: boolean}): Promise<void>
```

- `tableName` - 表名
- `options` - 额外选项  
    - `cascade` - 指示是否清空带有外键约束的表中的行（仅支持 PostgreSQL/CockroachDB 和 Oracle；其他数据库若设置为 `true` 会抛出错误）。默认 `false`

清空表的所有内容。

> 注意：该操作使用 SQL 的 TRUNCATE 语句，无法在事务中回滚。

---

```ts
enableSqlMemory(): void
```

启用一种特殊的查询执行器模式，在该模式下 SQL 查询不会被执行，而是会被存储到查询执行器内部的特殊变量中。  
你可以使用 `getMemorySql()` 方法获取存储的 SQL。

---

```ts
disableSqlMemory(): void
```

禁用上述特殊查询执行器模式，之前存储的 SQL 会被清空。

---

```ts
clearSqlMemory(): void
```

清空所有存储的 SQL 语句。

---

```ts
getMemorySql(): SqlInMemory
```

- 返回一个 `SqlInMemory` 对象，包含了 `upQueries` 和 `downQueries` SQL 语句数组

获取存储在内存中的 SQL，SQL 中的参数已被替换。

---

```ts
executeMemoryUpSql(): Promise<void>
```

执行存储的上行（up）SQL 查询。

---

```ts
executeMemoryDownSql(): Promise<void>
```

执行存储的下行（down）SQL 查询。

---
