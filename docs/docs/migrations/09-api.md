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
createDatabase(database: string, ifNotExist?: boolean): Promise<void>
```

- `database` - 数据库名称
- `ifNotExist` - 如果为 `true`，则当数据库已存在时跳过创建，否则抛出错误

创建一个新数据库。

---

```ts
dropDatabase(database: string, ifExist?: boolean): Promise<void>
```

- `database` - 数据库名称
- `ifExist` - 如果为 `true`，则当数据库不存在时跳过删除，否则抛出错误

删除数据库。

---

```ts
createSchema(schemaPath: string, ifNotExist?: boolean): Promise<void>
```

- `schemaPath` - 架构名。对于 SqlServer，可以接受架构路径（例如 'dbName.schemaName'）作为参数。  
  如果传入架构路径，则将在指定数据库中创建架构
- `ifNotExist` - 如果为 `true`，当架构已存在时跳过创建，否则抛出错误

创建一个新的表架构。

---

```ts
dropSchema(schemaPath: string, ifExist?: boolean, isCascade?: boolean): Promise<void>
```

- `schemaPath` - 架构名。对于 SqlServer，可以接受架构路径（例如 'dbName.schemaName'）作为参数。  
  如果传入架构路径，则将在指定数据库中删除架构
- `ifExist` - 如果为 `true`，当架构未找到时跳过删除，否则抛出错误
- `isCascade` - 如果为 `true`，自动删除架构中的对象（表、函数等）。  
  仅适用于 Postgres。

删除一个表架构。

---

```ts
createTable(table: Table, ifNotExist?: boolean, createForeignKeys?: boolean, createIndices?: boolean): Promise<void>
```

- `table` - 表对象。
- `ifNotExist` - 如果为 `true`，当表已存在时跳过创建，否则抛出错误。默认 `false`
- `createForeignKeys` - 指示是否在创建表时创建外键。默认 `true`
- `createIndices` - 指示是否在创建表时创建索引。默认 `true`

创建一个新表。

---

```ts
dropTable(table: Table|string, ifExist?: boolean, dropForeignKeys?: boolean, dropIndices?: boolean): Promise<void>
```

- `table` - 要删除的表对象或表名
- `ifExist` - 如果为 `true`，当表不存在时跳过删除，否则抛出错误
- `dropForeignKeys` - 指示是否在删除表时删除外键。默认 `true`
- `dropIndices` - 指示是否在删除表时删除索引。默认 `true`

删除一个表。

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
dropColumn(table: Table|string, column: TableColumn|string): Promise<void>
```

- `table` - 表对象或名称
- `column` - 要删除的 TableColumn 对象或列名

删除表中的一个列。

---

```ts
dropColumns(table: Table|string, columns: TableColumn[]|string[]): Promise<void>
```

- `table` - 表对象或名称
- `columns` - 要删除的 TableColumn 对象数组或列名数组

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
dropPrimaryKey(table: Table|string): Promise<void>
```

- `table` - 表对象或名称

删除主键。

---

```ts
createUniqueConstraint(table: Table|string, uniqueConstraint: TableUnique): Promise<void>
```

- `table` - 表对象或名称
- `uniqueConstraint` - 要创建的 TableUnique 对象

创建新的唯一约束。

> 注意：MySQL 不支持此方法，因为 MySQL 将唯一约束存储为唯一索引。应该使用 `createIndex()` 方法。

---

```ts
createUniqueConstraints(table: Table|string, uniqueConstraints: TableUnique[]): Promise<void>
```

- `table` - 表对象或名称
- `uniqueConstraints` - 要创建的 TableUnique 对象数组

创建新的唯一约束。

> 注意：MySQL 不支持此方法，因为 MySQL 将唯一约束存储为唯一索引。应该使用 `createIndices()` 方法。

---

```ts
dropUniqueConstraint(table: Table|string, uniqueOrName: TableUnique|string): Promise<void>
```

- `table` - 表对象或名称
- `uniqueOrName` - 要删除的 TableUnique 对象或唯一约束名称

删除唯一约束。

> 注意：MySQL 不支持此方法，因为 MySQL 将唯一约束存储为唯一索引。应该使用 `dropIndex()` 方法。

---

```ts
dropUniqueConstraints(table: Table|string, uniqueConstraints: TableUnique[]): Promise<void>
```

- `table` - 表对象或名称
- `uniqueConstraints` - 要删除的 TableUnique 对象数组

删除唯一约束。

> 注意：MySQL 不支持此方法，因为 MySQL 将唯一约束存储为唯一索引。应该使用 `dropIndices()` 方法。

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
dropCheckConstraint(table: Table|string, checkOrName: TableCheck|string): Promise<void>
```

- `table` - 表对象或名称
- `checkOrName` - TableCheck 对象或检查约束名称

删除检查约束。

> 注意：MySQL 不支持检查约束。

---

```ts
dropCheckConstraints(table: Table|string, checkConstraints: TableCheck[]): Promise<void>
```

- `table` - 表对象或名称
- `checkConstraints` - TableCheck 对象数组

删除检查约束。

> 注意：MySQL 不支持检查约束。

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
dropForeignKey(table: Table|string, foreignKeyOrName: TableForeignKey|string): Promise<void>
```

- `table` - 表对象或名称
- `foreignKeyOrName` - TableForeignKey 对象或外键名称

删除外键。

---

```ts
dropForeignKeys(table: Table|string, foreignKeys: TableForeignKey[]): Promise<void>
```

- `table` - 表对象或名称
- `foreignKeys` - TableForeignKey 对象数组

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

创建多个索引。

---

```ts
dropIndex(table: Table|string, index: TableIndex|string): Promise<void>
```

- `table` - 表对象或名称
- `index` - TableIndex 对象或索引名称

删除索引。

---

```ts
dropIndices(table: Table|string, indices: TableIndex[]): Promise<void>
```

- `table` - 表对象或名称
- `indices` - TableIndex 对象数组

删除多个索引。

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
