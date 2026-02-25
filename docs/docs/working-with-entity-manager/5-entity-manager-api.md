# `EntityManager` API

- `dataSource` - `EntityManager` 使用的数据源。

```typescript
const dataSource = manager.dataSource
```

- `queryRunner` - `EntityManager` 使用的查询运行器。
  仅在事务性实体管理器实例中使用。

```typescript
const queryRunner = manager.queryRunner
```

- `transaction` - 提供一个事务，在该事务中多个数据库请求将作为单一数据库事务执行。
  了解更多 [事务](../advanced-topics/2-transactions.md)。

```typescript
await manager.transaction(async (manager) => {
    // 注意：你必须使用传入的 manager 实例执行所有数据库操作
    // 这是一个专门用于该事务的 EntityManager 实例
    // 并且别忘了在这里使用 await
})
```

- `query` - 执行原生 SQL 查询。

```typescript
const rawData = await manager.query(`SELECT * FROM USERS`)

// 你也可以使用参数以避免 SQL 注入
// 不同驱动的语法有所区别

// aurora-mysql, better-sqlite3, capacitor, cordova,
// expo, mariadb, mysql, nativescript, react-native,
// sap, sqlite, sqljs
const rawData = await manager.query(
    "SELECT * FROM USERS WHERE name = ? and age = ?",
    ["John", 24],
)

// aurora-postgres, cockroachdb, postgres
const rawData = await manager.query(
    "SELECT * FROM USERS WHERE name = $1 and age = $2",
    ["John", 24],
)

// oracle
const rawData = await manager.query(
    "SELECT * FROM USERS WHERE name = :1 and age = :2",
    ["John", 24],
)

// spanner
const rawData = await manager.query(
    "SELECT * FROM USERS WHERE name = @param0 and age = @param1",
    ["John", 24],
)

// mssql
const rawData = await manager.query(
    "SELECT * FROM USERS WHERE name = @0 and age = @1",
    ["John", 24],
)
```

- `sql` - 使用模板字符串执行原生 SQL 查询。

```typescript
const rawData =
    await manager.sql`SELECT * FROM USERS WHERE name = ${"John"} and age = ${24}`
```

了解有关使用 [SQL Tag 语法](../guides/7-sql-tag.md)的更多内容。

- `createQueryBuilder` - 创建查询构建器，用于构建 SQL 查询。
  了解更多关于 [QueryBuilder](../query-builder/1-select-query-builder.md)。

```typescript
const users = await manager
    .createQueryBuilder()
    .select()
    .from(User, "user")
    .where("user.name = :name", { name: "John" })
    .getMany()
```

- `hasId` - 检查给定实体是否定义了其主键列属性。

```typescript
if (manager.hasId(user)) {
    // ... 执行某些操作
}
```

- `getId` - 获取给定实体的主键列属性值。
  如果实体有复合主键，则返回值为包含主键列名和值的对象。

```typescript
const userId = manager.getId(user) // userId === 1
```

- `create` - 创建一个新的 `User` 实例。可选地接收一个包含用户属性的对象字面量，
  属性将被写入新创建的用户对象。

```typescript
const user = manager.create(User) // 等同于 const user = new User();
const user = manager.create(User, {
    id: 1,
    firstName: "Timber",
    lastName: "Saw",
}) // 等同于 const user = new User(); user.firstName = "Timber"; user.lastName = "Saw";
```

- `merge` - 合并多个实体为单一实体。

```typescript
const user = new User()
manager.merge(User, user, { firstName: "Timber" }, { lastName: "Saw" }) // 等同于 user.firstName = "Timber"; user.lastName = "Saw";
```

- `preload` - 从给定的普通 JavaScript 对象创建一个新实体。如果实体已存在于数据库中，
  则加载该实体（以及所有相关联的实体），用新对象中的值替换所有值，并返回新实体。
  新实体实际上是从数据库中加载的实体，所有属性被新的对象替换。

```typescript
const partialUser = {
    id: 1,
    firstName: "Rizzrak",
    profile: {
        id: 1,
    },
}
const user = await manager.preload(User, partialUser)
// user 将包含 partialUser 中缺失的所有数据，且属性值为 partialUser 的值：
// { id: 1, firstName: "Rizzrak", lastName: "Saw", profile: { id: 1, ... } }
```

- `save` - 保存给定实体或实体数组。
  如果实体已存在数据库中，则更新它。
  如果实体尚未存在，则插入它。
  会在单个事务中保存所有给定实体（如果实体管理器本身不是事务性的）。
  也支持部分更新，因为所有未定义的属性都会被跳过。若想将值设为 `NULL`，必须手动将属性设置为 `null`。

```typescript
await manager.save(user)
await manager.save([category1, category2, category3])
```

- `remove` - 删除给定实体或实体数组。
  会在单个事务中删除所有给定实体（如果实体管理器本身不是事务性的）。

```typescript
await manager.remove(user)
await manager.remove([category1, category2, category3])
```

- `insert` - 插入一个新实体或实体数组。

```typescript
await manager.insert(User, {
    firstName: "Timber",
    lastName: "Timber",
})

await manager.insert(User, [
    {
        firstName: "Foo",
        lastName: "Bar",
    },
    {
        firstName: "Rizz",
        lastName: "Rak",
    },
])
```

- `update` - 通过实体 ID、多个 ID、给定条件，或条件对象数组更新实体。按提供的部分实体设置字段。

```typescript
await manager.update(User, { age: 18 }, { category: "ADULT" })
// 执行 UPDATE user SET category = ADULT WHERE age = 18

await manager.update(User, 1, { firstName: "Rizzrak" })
// 执行 UPDATE user SET firstName = Rizzrak WHERE id = 1

// 批量更新，每个操作条件不同
await manager.update(User, [
    { criteria: { id: 1 }, data: { firstName: "Rizzrak" } },
    { criteria: { id: 2 }, data: { firstName: "Karzzir" } },
    { criteria: { age: 18 }, data: { category: "ADULT" } },
])
// 执行三条独立的 UPDATE 查询：
// UPDATE user SET firstName = Rizzrak WHERE id = 1
// UPDATE user SET firstName = Karzzir WHERE id = 2
// UPDATE user SET category = ADULT WHERE age = 18
```

你也可以传入**条件对象数组**，以在一次调用中匹配多组不同行，例如（这些条件使用 OR 连接）：

```typescript
await manager.update(User, [{ status: "expired" }, { flagged: true }], {
    active: false,
})
// 执行 UPDATE user SET active = false WHERE status = 'expired' OR flagged = true
```

- `updateAll` - 更新目标类型的所有实体（无 WHERE 条件）。按提供的部分实体设置字段。

```typescript
await manager.updateAll(User, { category: "ADULT" })
// 执行 UPDATE user SET category = ADULT
```

- `upsert` - 插入新实体或实体数组，除非它们已存在，在那种情况下改为更新。由 AuroraDataApi、Cockroach、Mysql、Postgres 和 Sqlite 数据库驱动支持。

当 upsert 操作因冲突导致更新时，像 `@UpdateDateColumn` 和 `@VersionColumn` 这样特殊的列会自动更新为当前值。

```typescript
await manager.upsert(
    User,
    [
        { externalId: "abc123", firstName: "Rizzrak" },
        { externalId: "bca321", firstName: "Karzzir" },
    ],
    ["externalId"],
)
/** 执行
 *  INSERT INTO user
 *  VALUES
 *      (externalId = abc123, firstName = Rizzrak),
 *      (externalId = cba321, firstName = Karzzir),
 *  ON CONFLICT (externalId) DO UPDATE firstName = EXCLUDED.firstName
 **/
```

- `delete` - 通过实体 ID、多 ID、给定条件，或条件对象数组删除实体。

```typescript
await manager.delete(User, 1)
await manager.delete(User, [1, 2, 3])
await manager.delete(User, { firstName: "Timber" })

// 批量删除，每个操作条件不同
await manager.delete(User, [{ firstName: "Timber" }, { age: 18 }, { id: 42 }])
// 执行三条独立的 DELETE 查询：
// DELETE FROM user WHERE firstName = Timber
// DELETE FROM user WHERE age = 18
// DELETE FROM user WHERE id = 42
```

你可以传入**条件对象数组**，匹配多组不同的行（条件使用 OR 连接）。这与传入原始数组不同，后者被视为 ID 列表：

```typescript
// 原始数组 —— 解释为 WHERE id IN (1, 2, 3)
await manager.delete(User, [1, 2, 3])

// 对象数组 —— 每个元素都是独立条件（多个条件 OR 连接）
await manager.delete(User, [{ id: 1 }, { email: "old@example.com" }])
// 执行 DELETE FROM user WHERE id = 1 OR email = 'old@example.com'
```

注意：传入空对象 `{}` 或 `[{}]` 会抛出 `TypeORMError`，以防意外删除整表。

- `deleteAll` - 删除目标类型的所有实体（无 WHERE 条件）。

```typescript
await manager.deleteAll(User)
// 执行 DELETE FROM user
```

另请参考 `clear` 方法，它执行数据库的 `TRUNCATE TABLE` 操作。

- `increment` - 将匹配给定条件的实体的某个列按提供的值递增。

```typescript
await manager.increment(User, { firstName: "Timber" }, "age", 3)
```

- `decrement` - 将匹配给定条件的实体的某个列按提供的值递减。

```typescript
await manager.decrement(User, { firstName: "Timber" }, "age", 3)
```

- `exists` - 检查是否存在匹配 `FindOptions` 条件的任何实体。

```typescript
const exists = await manager.exists(User, {
    where: {
        firstName: "Timber",
    },
})
```

- `existsBy` - 检查是否存在匹配 `FindOptionsWhere` 条件的任何实体。

```typescript
const exists = await manager.existsBy(User, { firstName: "Timber" })
```

- `count` - 统计匹配 `FindOptions` 条件的实体数量。适用于分页。

```typescript
const count = await manager.count(User, {
    where: {
        firstName: "Timber",
    },
})
```

- `countBy` - 统计匹配 `FindOptionsWhere` 条件的实体数量。适用于分页。

```typescript
const count = await manager.countBy(User, { firstName: "Timber" })
```

- `find` - 查找匹配给定 `FindOptions` 的实体。

```typescript
const timbers = await manager.find(User, {
    where: {
        firstName: "Timber",
    },
})
```

- `findBy` - 查找匹配给定 `FindWhereOptions` 的实体。

```typescript
const timbers = await manager.findBy(User, {
    firstName: "Timber",
})
```

- `findAndCount` - 查找匹配给定 `FindOptions` 的实体。
  同时统计所有匹配条件的实体数量，但忽略分页设置（from 和 take 选项）。

```typescript
const [timbers, timbersCount] = await manager.findAndCount(User, {
    where: {
        firstName: "Timber",
    },
})
```

- `findAndCountBy` - 查找匹配给定 `FindOptionsWhere` 的实体。
  同时统计所有匹配条件的实体数量，但忽略分页设置（from 和 take 选项）。

```typescript
const [timbers, timbersCount] = await manager.findAndCountBy(User, {
    firstName: "Timber",
})
```

- `findOne` - 查找匹配给定 `FindOptions` 的第一个实体。

```typescript
const timber = await manager.findOne(User, {
    where: {
        firstName: "Timber",
    },
})
```

- `findOneBy` - 查找匹配给定 `FindOptionsWhere` 的第一个实体。

```typescript
const timber = await manager.findOneBy(User, { firstName: "Timber" })
```

- `findOneOrFail` - 查找匹配某个 ID 或查找选项的第一个实体。
  若无匹配，则返回的 Promise 拒绝。

```typescript
const timber = await manager.findOneOrFail(User, {
    where: {
        firstName: "Timber",
    },
})
```

- `findOneByOrFail` - 查找匹配给定 `FindOptionsWhere` 的第一个实体。
  若无匹配，则返回的 Promise 拒绝。

```typescript
const timber = await manager.findOneByOrFail(User, { firstName: "Timber" })
```

- `clear` - 清空指定表的所有数据（截断表）。支持级联选项，同时清空所有引用此表的外键表数据（仅 PostgreSQL/CockroachDB 和 Oracle 支持；其他数据库设置 cascade 为 true 会抛错）。

```typescript
await manager.clear(User)

// 使用级联选项（仅 PostgreSQL/CockroachDB 和 Oracle 支持）
await manager.clear(User, { cascade: true })
```

- `getRepository` - 获取用于操作特定实体的 `Repository`。
  了解更多关于 [Repositories](./2-working-with-repository.md)。

```typescript
const userRepository = manager.getRepository(User)
```

- `getTreeRepository` - 获取用于操作特定实体的 `TreeRepository`。
  了解更多关于 [Repositories](./2-working-with-repository.md)。

```typescript
const categoryRepository = manager.getTreeRepository(Category)
```

- `getMongoRepository` - 获取用于操作特定实体的 `MongoRepository`。
  了解更多关于 [MongoDB](../drivers/mongodb.md)。

```typescript
const userRepository = manager.getMongoRepository(User)
```

- `withRepository` - 获取事务中使用的自定义仓库实例。
  了解更多关于 [自定义仓库](./4-custom-repository.md)。

```typescript
const myUserRepository = manager.withRepository(UserRepository)
```

- `release` - 释放实体管理器的查询运行器。
  仅在查询运行器被手动创建和管理时使用。

```typescript
await manager.release()
```
