# DataSource API

- `options` - 用于创建该 dataSource 的选项。
  详细了解 [数据源选项](./2-data-source-options.md)。

```typescript
const dataSourceOptions: DataSourceOptions = dataSource.options
```

- `isInitialized` - 指示 DataSource 是否已初始化以及是否已建立与数据库的初始连接/连接池。

```typescript
const isInitialized: boolean = dataSource.isInitialized
```

- `driver` - 该 dataSource 使用的底层数据库驱动。

```typescript
const driver: Driver = dataSource.driver
```

- `manager` - 用于操作实体的 `EntityManager`。
  详细了解 [实体管理器](../working-with-entity-manager/1-working-with-entity-manager.md) 和 [仓库](../working-with-entity-manager/2-working-with-repository.md)。

```typescript
const manager: EntityManager = dataSource.manager
// 你可以调用 manager 的方法，例如 find：
const users = await manager.find()
```

- `mongoManager` - 用于 mongodb 数据源操作实体的 `MongoEntityManager`。
  有关 MongoEntityManager 的更多信息，请参阅 [MongoDB](../drivers/mongodb.md) 文档。

```typescript
const manager: MongoEntityManager = dataSource.mongoManager
// 你可以调用 manager 或 mongodb-manager 特有的方法，例如 find：
const users = await manager.find()
```

- `initialize` - 初始化数据源并打开数据库连接池。

```typescript
await dataSource.initialize()
```

- `destroy` - 销毁 DataSource 并关闭所有数据库连接。
  通常，在应用关闭时调用此方法。

```typescript
await dataSource.destroy()
```

- `synchronize` - 同步数据库架构。当在数据源选项中设置 `synchronize: true` 时，会调用此方法。
  通常在应用启动时调用。

```typescript
await dataSource.synchronize()
```

- `dropDatabase` - 删除数据库及其所有数据。
  在生产环境中请谨慎使用此方法，因为它会清除所有数据库表及其数据。
  仅可在数据库连接建立后使用。

```typescript
await dataSource.dropDatabase()
```

- `runMigrations` - 运行所有待执行的迁移。

```typescript
await dataSource.runMigrations()
```

- `undoLastMigration` - 撤销最后一次执行的迁移。

```typescript
await dataSource.undoLastMigration()
```

- `hasMetadata` - 检查是否已注册给定实体的元数据。

```typescript
if (dataSource.hasMetadata(User))
    const userMetadata = dataSource.getMetadata(User)
```

- `getMetadata` - 获取给定实体的 `EntityMetadata`。
  你也可以指定表名，如果找到对应表名的实体元数据，则返回该元数据。

```typescript
const userMetadata = dataSource.getMetadata(User)
// 现在你可以获取关于 User 实体的任何信息
```

- `getRepository` - 获取给定实体的 `Repository`。
  你也可以指定表名，如果找到对应表的仓库，则返回该仓库。
  详细了解 [仓库](../working-with-entity-manager/2-working-with-repository.md)。

```typescript
const repository = dataSource.getRepository(User)
// 现在你可以调用仓库方法，例如 find：
const users = await repository.find()
```

- `getTreeRepository` - 获取给定实体的 `TreeRepository`。
  你也可以指定表名，如果找到对应表的仓库，则返回该仓库。
  详细了解 [仓库](../working-with-entity-manager/2-working-with-repository.md)。

```typescript
const repository = dataSource.getTreeRepository(Category)
// 现在你可以调用树型仓库方法，例如 findTrees：
const categories = await repository.findTrees()
```

- `getMongoRepository` - 获取给定实体的 `MongoRepository`。
  该仓库用于 MongoDB 数据源中的实体。
  详细了解 [MongoDB 支持](../drivers/mongodb.md)。

```typescript
const repository = dataSource.getMongoRepository(User)
// 现在你可以调用 mongodb 特有的仓库方法，例如 createEntityCursor：
const categoryCursor = repository.createEntityCursor()
const category1 = await categoryCursor.next()
const category2 = await categoryCursor.next()
```

- `transaction` - 提供单个事务，其中的多个数据库请求将作为一个数据库事务执行。
  详细了解 [事务](../advanced-topics/2-transactions.md)。

```typescript
await dataSource.transaction(async (manager) => {
    // 注意：你必须使用给定的 manager 实例执行所有数据库操作
    // 它是与当前事务关联的 EntityManager 特殊实例
    // 并且不要忘记 await 这些操作
})
```

- `query` - 执行原始 SQL 查询。

```typescript
const rawData = await dataSource.query(`SELECT * FROM USERS`)

// 你也可以使用参数以避免 SQL 注入
// 不同驱动的语法有所不同

// aurora-mysql, better-sqlite3, capacitor, cordova,
// expo, mariadb, mysql, nativescript, react-native,
// sap, sqlite, sqljs
const rawData = await dataSource.query(
    "SELECT * FROM USERS WHERE name = ? and age = ?",
    ["John", 24],
)

// aurora-postgres, cockroachdb, postgres
const rawData = await dataSource.query(
    "SELECT * FROM USERS WHERE name = $1 and age = $2",
    ["John", 24],
)

// oracle
const rawData = await dataSource.query(
    "SELECT * FROM USERS WHERE name = :1 and age = :2",
    ["John", 24],
)

// spanner
const rawData = await dataSource.query(
    "SELECT * FROM USERS WHERE name = @param0 and age = @param1",
    ["John", 24],
)

// mssql
const rawData = await dataSource.query(
    "SELECT * FROM USERS WHERE name = @0 and age = @1",
    ["John", 24],
)
```

- `sql` - 使用模板字符串执行原始 SQL 查询。

```typescript
const rawData =
    await dataSource.sql`SELECT * FROM USERS WHERE name = ${"John"} and age = ${24}`
```

详细了解使用 [SQL 标签语法](../guides/7-sql-tag.md)。

- `createQueryBuilder` - 创建查询构建器，用于构建查询。
  详细了解 [查询构建器](../query-builder/1-select-query-builder.md)。

```typescript
const users = await dataSource
    .createQueryBuilder()
    .select()
    .from(User, "user")
    .where("user.name = :name", { name: "John" })
    .getMany()
```

- `createQueryRunner` - 创建查询运行器，用于管理和操作单个真实数据库数据源。
  详细了解 [QueryRunner](../query-runner.md)。

```typescript
const queryRunner = dataSource.createQueryRunner()

// 只有调用 connect 后才能使用它的方法
// 该方法用于执行真实的数据库连接
await queryRunner.connect()

// .. 现在你可以使用 query runner 并调用其方法了

// 非常重要 - 完成工作后别忘了释放 query runner
await queryRunner.release()
```
