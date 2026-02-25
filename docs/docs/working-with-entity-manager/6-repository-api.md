# 仓库 API

## `Repository` API

- `manager` - 此仓库使用的 `EntityManager`。

```typescript
const manager = repository.manager
```

- `metadata` - 此仓库管理的实体的 `EntityMetadata`。

```typescript
const metadata = repository.metadata
```

- `queryRunner` - `EntityManager` 使用的查询运行器。  
  仅用于事务性实例的 EntityManager。

```typescript
const queryRunner = repository.queryRunner
```

- `target` - 此仓库管理的目标实体类。  
  仅用于事务性实例的 EntityManager。

```typescript
const target = repository.target
```

- `createQueryBuilder` - 创建用于构建 SQL 查询的查询构建器。  
  了解更多关于 [QueryBuilder](../query-builder/1-select-query-builder.md)。

```typescript
const users = await repository
    .createQueryBuilder("user")
    .where("user.name = :name", { name: "John" })
    .getMany()
```

- `hasId` - 检查给定实体的主键列属性是否已定义。

```typescript
if (repository.hasId(user)) {
    // ... 执行某些操作
}
```

- `getId` - 获取给定实体的主键列属性值。  
  如果实体有复合主键，则返回值是一个包含主键列名称和值的对象。

```typescript
const userId = repository.getId(user) // userId === 1
```

- `create` - 创建一个新的 `User` 实例。可选地接受一个包含用户属性的对象字面量，  
  这些属性将写入新创建的用户对象。

```typescript
const user = repository.create() // 等同于 const user = new User();
const user = repository.create({
    id: 1,
    firstName: "Timber",
    lastName: "Saw",
}) // 等同于 const user = new User(); user.firstName = "Timber"; user.lastName = "Saw";
```

- `merge` - 将多个实体合并成一个实体。

```typescript
const user = new User()
repository.merge(user, { firstName: "Timber" }, { lastName: "Saw" }) // 等同于 user.firstName = "Timber"; user.lastName = "Saw";
```

- `preload` - 根据给定的普通 JavaScript 对象创建一个新实体。如果实体已存在于数据库中，  
  则加载它（及其所有关联），用给定对象的新值替换所有属性，并返回新的实体。新的实体实际上是从数据库加载的实体，  
  其所有属性都被新对象的值替换。

> 注意：给定的类实体对象必须包含实体 ID / 主键用于查找。若未找到对应 ID 的实体，则返回 undefined。

```typescript
const partialUser = {
    id: 1,
    firstName: "Rizzrak",
    profile: {
        id: 1,
    },
}
const user = await repository.preload(partialUser)
// user 将包含 partialUser 缺失的所有数据以及 partialUser 中的属性值：
// { id: 1, firstName: "Rizzrak", lastName: "Saw", profile: { id: 1, ... } }
```

- `save` - 保存给定的实体或实体数组。  
  如果实体已存在于数据库中，则执行更新。  
  如果实体不存在数据库中，则执行插入。  
  会在单一事务中保存所有给定实体（当实体的 manager 非事务状态时）。  
  同时支持部分更新，因为所有未定义属性都会被跳过。  
  返回已保存的实体/实体数组。

```typescript
await repository.save(user)
await repository.save([category1, category2, category3])
```

- `remove` - 删除给定的实体或实体数组。  
  会在单一事务中删除所有给定实体（当实体的 manager 非事务状态时）。  
  返回被删除的实体/实体数组。

```typescript
await repository.remove(user)
await repository.remove([category1, category2, category3])
```

- `insert` - 插入新的实体或实体数组。

```typescript
await repository.insert({
    firstName: "Timber",
    lastName: "Timber",
})

await repository.insert([
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

- `update` - 通过实体 ID、IDs 或给定条件更新实体。设置来自部分实体的字段。

```typescript
await repository.update({ age: 18 }, { category: "ADULT" })
// 执行 UPDATE user SET category = ADULT WHERE age = 18

await repository.update(1, { firstName: "Rizzrak" })
// 执行 UPDATE user SET firstName = Rizzrak WHERE id = 1

// 可选请求 RETURNING / OUTPUT 值（仅支持部分驱动）
const result = await repository.update(
    1,
    { firstName: "Rizzrak" },
    { returning: ["id", "firstName"] },
)
console.log(result.raw) // [{ id: 1, firstName: "Rizzrak" }]
```

你可以传入 **条件对象数组** 来一次匹配多组不同行（条件用 OR 连接）：

```typescript
await repository.update([{ status: "expired" }, { flagged: true }], {
    active: false,
})
// 执行 UPDATE user SET active = false WHERE status = 'expired' OR flagged = true
```

- `updateAll` - 更新目标类型的 _所有_ 实体（无 WHERE 子句）。设置来自部分实体的字段。

```typescript
await repository.updateAll({ category: "ADULT" })
// 执行 UPDATE user SET category = ADULT

await repository.updateAll(
    { category: "ADULT" },
    { returning: "*" }, // 限于支持返回（returning）子句的驱动
)
```

- `upsert` - 如果实体不存在则插入新的实体或实体数组，否则执行更新。AuroraDataApi、Cockroach、Mysql、Postgres 和 Sqlite 数据库驱动支持此功能。

当 upsert 操作因冲突导致更新时，像 `@UpdateDateColumn` 和 `@VersionColumn` 这样的特殊列会自动更新为当前值。

```typescript
await repository.upsert(
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
 *  ON CONFLICT (externalId) DO UPDATE
 *  SET firstName = EXCLUDED.firstName,
 *      updatedDate = CURRENT_TIMESTAMP,
 *      version = version + 1
 **/
```

你还可以请求从 upsert 操作返回值（仅支持含 RETURNING / OUTPUT 的驱动）：

```typescript
const { raw } = await repository.upsert(
    { externalId: "abc123", firstName: "Rizzrak" },
    {
        conflictPaths: ["externalId"],
        returning: ["externalId", "firstName"],
    },
)
console.log(raw) // [{ externalId: "abc123", firstName: "Rizzrak" }]
```

```typescript
await repository.upsert(
    [
        { externalId: "abc123", firstName: "Rizzrak" },
        { externalId: "bca321", firstName: "Karzzir" },
    ],
    {
        conflictPaths: ["externalId"],
        skipUpdateIfNoValuesChanged: true, // postgres 支持，如果更新不会改变行则跳过更新
        upsertType: "upsert", // "on-conflict-do-update" | "on-duplicate-key-update" | "upsert" - 可选指定 Upsert 类型 - 目前 'upsert' 仅 CockroachDB 支持
    },
)
/** 执行
 *  INSERT INTO user
 *  VALUES
 *      (externalId = abc123, firstName = Rizzrak),
 *      (externalId = cba321, firstName = Karzzir),
 *  ON CONFLICT (externalId) DO UPDATE
 *  SET firstName = EXCLUDED.firstName
 *  WHERE user.firstName IS DISTINCT FROM EXCLUDED.firstName
 **/
```

```typescript
await repository.upsert(
    [
        { externalId: "abc123", firstName: "Rizzrak", dateAdded: "2020-01-01" },
        { externalId: "bca321", firstName: "Karzzir", dateAdded: "2022-01-01" },
    ],
    {
        conflictPaths: ["externalId"],
        skipUpdateIfNoValuesChanged: true, // postgres 支持，如果更新不会改变行则跳过更新
        indexPredicate: "dateAdded > 2020-01-01", // postgres 支持，允许部分索引
    },
)
/** 执行
 *  INSERT INTO user
 *  VALUES
 *      (externalId = abc123, firstName = Rizzrak, dateAdded = 2020-01-01),
 *      (externalId = cba321, firstName = Karzzir, dateAdded = 2022-01-01),
 *  ON CONFLICT (externalId) WHERE ( dateAdded > 2021-01-01 ) DO UPDATE
 *  SET firstName = EXCLUDED.firstName,
 *  SET dateAdded = EXCLUDED.dateAdded,
 *  WHERE user.firstName IS DISTINCT FROM EXCLUDED.firstName OR user.dateAdded IS DISTINCT FROM EXCLUDED.dateAdded
 **/
```

- `delete` - 通过实体 ID、IDs 或给定条件删除实体：

```typescript
await repository.delete(1)
await repository.delete([1, 2, 3])
await repository.delete({ firstName: "Timber" })
```

- `deleteAll` - 删除目标类型的 _所有_ 实体（无 WHERE 子句）。

```typescript
await repository.deleteAll()
// 执行 DELETE FROM user
```

另请参阅 `clear` 方法，它执行数据库的 `TRUNCATE TABLE` 操作。

- `softDelete` 和 `restore` - 通过 ID、IDs 或给定条件软删除和恢复行：

```typescript
const repository = dataSource.getRepository(Entity)
// 软删除一个实体
await repository.softDelete(1)
// 你也可以使用 restore 恢复它;
await repository.restore(1)
// 软删除多个实体
await repository.softDelete([1, 2, 3])
// 或通过其他属性软删除
await repository.softDelete({ firstName: "Jake" })

// 不同条件批量软删除
await repository.softDelete([{ firstName: "Jake" }, { age: 25 }, { id: 42 }])
// 执行三条独立 UPDATE 查询（设置 deletedAt 时间戳）：
// UPDATE entity SET deletedAt = NOW() WHERE firstName = Jake
// UPDATE entity SET deletedAt = NOW() WHERE age = 25
// UPDATE entity SET deletedAt = NOW() WHERE id = 42
```

- `softRemove` 和 `recover` - 这是 `softDelete` 和 `restore` 的另一种方式。

```typescript
// 你可以使用 softRemove 软删除它们
const entities = await repository.find()
const entitiesAfterSoftRemove = await repository.softRemove(entities)

// 并且你可以使用 recover 恢复它们;
await repository.recover(entitiesAfterSoftRemove)
```

- `increment` - 对符合给定选项的实体的某字段递增指定值。

```typescript
await repository.increment({ firstName: "Timber" }, "age", 3)
```

- `decrement` - 对符合给定选项的实体的某字段递减指定值。

```typescript
await repository.decrement({ firstName: "Timber" }, "age", 3)
```

- `exists` - 检查是否存在任何符合 `FindOptions` 的实体。

```typescript
const exists = await repository.exists({
    where: {
        firstName: "Timber",
    },
})
```

- `existsBy` - 检查是否存在任何符合 `FindOptionsWhere` 的实体。

```typescript
const exists = await repository.existsBy({ firstName: "Timber" })
```

- `count` - 计算符合 `FindOptions` 的实体数量。对于分页很有用。

```typescript
const count = await repository.count({
    where: {
        firstName: "Timber",
    },
})
```

- `countBy` - 计算符合 `FindOptionsWhere` 的实体数量。对于分页很有用。

```typescript
const count = await repository.countBy({ firstName: "Timber" })
```

- `sum` - 返回所有符合 `FindOptionsWhere` 的实体指定数值字段的总和。

```typescript
const sum = await repository.sum("age", { firstName: "Timber" })
```

- `average` - 返回所有符合 `FindOptionsWhere` 的实体指定数值字段的平均值。

```typescript
const average = await repository.average("age", { firstName: "Timber" })
```

- `minimum` - 返回所有符合 `FindOptionsWhere` 的实体指定数值字段的最小值。

```typescript
const minimum = await repository.minimum("age", { firstName: "Timber" })
```

- `maximum` - 返回所有符合 `FindOptionsWhere` 的实体指定数值字段的最大值。

```typescript
const maximum = await repository.maximum("age", { firstName: "Timber" })
```

- `find` - 查找符合给定 `FindOptions` 的实体。

```typescript
const timbers = await repository.find({
    where: {
        firstName: "Timber",
    },
})
```

- `findBy` - 查找符合给定 `FindWhereOptions` 的实体。

```typescript
const timbers = await repository.findBy({
    firstName: "Timber",
})
```

- `findAndCount` - 查找符合给定 `FindOptions` 的实体。  
  同时计数所有符合条件的实体数，  
  但忽略分页设置（from 和 take 选项）。

```typescript
const [timbers, timbersCount] = await repository.findAndCount({
    where: {
        firstName: "Timber",
    },
})
```

- `findAndCountBy` - 查找符合给定 `FindOptionsWhere` 的实体。  
  同时计数所有符合条件的实体数，  
  但忽略分页设置（from 和 take 选项）。

```typescript
const [timbers, timbersCount] = await repository.findAndCountBy({
    firstName: "Timber",
})
```

- `findOne` - 查找第一个符合给定 `FindOptions` 的实体。

```typescript
const timber = await repository.findOne({
    where: {
        firstName: "Timber",
    },
})
```

- `findOneBy` - 查找第一个符合给定 `FindOptionsWhere` 的实体。

```typescript
const timber = await repository.findOneBy({ firstName: "Timber" })
```

- `findOneOrFail` - 查找第一个符合某 ID 或查找选项的实体。  
  若无匹配项则返回拒绝的 Promise。

```typescript
const timber = await repository.findOneOrFail({
    where: {
        firstName: "Timber",
    },
})
```

- `findOneByOrFail` - 查找第一个符合给定 `FindOptions` 的实体。  
  若无匹配项则返回拒绝的 Promise。

```typescript
const timber = await repository.findOneByOrFail({ firstName: "Timber" })
```

- `query` - 执行原始 SQL 查询。

```typescript
const rawData = await repository.query(`SELECT * FROM USERS`)

// 你也可以使用参数来避免 SQL 注入
// 语法因驱动而异

// aurora-mysql, better-sqlite3, capacitor, cordova,
// expo, mariadb, mysql, nativescript, react-native,
// sap, sqlite, sqljs
const rawData = await repository.query(
    "SELECT * FROM USERS WHERE name = ? and age = ?",
    ["John", 24],
)

// aurora-postgres, cockroachdb, postgres
const rawData = await repository.query(
    "SELECT * FROM USERS WHERE name = $1 and age = $2",
    ["John", 24],
)

// oracle
const rawData = await repository.query(
    "SELECT * FROM USERS WHERE name = :1 and age = :2",
    ["John", 24],
)

// spanner
const rawData = await repository.query(
    "SELECT * FROM USERS WHERE name = @param0 and age = @param1",
    ["John", 24],
)

// mssql
const rawData = await repository.query(
    "SELECT * FROM USERS WHERE name = @0 and age = @1",
    ["John", 24],
)
```

- `clear` - 清空指定表中的所有数据（截断该表）。支持级联选项，可同时清空所有拥有此表外键的表（仅支持 PostgreSQL/CockroachDB 和 Oracle；其他数据库若设置 cascade 为 true 会报错）。

```typescript
await repository.clear()

// 带级联选项（仅 PostgreSQL/CockroachDB 和 Oracle 支持）
await repository.clear({ cascade: true })
```

### 额外选项

可选的 `SaveOptions` 可作为参数传给 `save` 方法。

- `data` - 额外的数据，随持久化方法传递，可在订阅者中使用。  
- `listeners`: boolean - 表示是否调用监听器和订阅者。默认启用，设置 `{ listeners: false }` 可禁用。  
- `transaction`: boolean - 默认启用事务，持久化操作中的所有查询都包含在事务中。设置 `{ transaction: false }` 可禁用。  
- `chunk`: number - 将保存操作分为多个批次执行。例如，若需保存 100,000 个对象但遇到问题，可通过设置 `{ chunk: 10000 }` 分成 10 批，每批保存 10,000 个。此选项适用于处理大量插入时驱动参数数量有限制的情况。  
- `reload`: boolean - 标识在持久化操作期间是否应重新加载正在持久化的实体。仅对不支持 RETURNING / OUTPUT 语句的数据库有效。默认启用。

示例：

```typescript
userRepository.save(users, { chunk: 1000 })
```

可选的 `RemoveOptions` 可作为参数传给 `remove` 和 `delete` 方法。

- `data` - 额外的数据，随删除方法传递，可在订阅者中使用。  
- `listeners`: boolean - 表示是否调用监听器和订阅者。默认启用，设置 `{ listeners: false }` 可禁用。  
- `transaction`: boolean - 默认启用事务，持久化操作中的所有查询都包含在事务中。设置 `{ transaction: false }` 可禁用。  
- `chunk`: number - 将删除操作分为多个批次执行。例如，若需删除 100,000 个对象遇到问题，可通过设置 `{ chunk: 10000 }` 分成 10 批，每批删除 10,000 个。此选项适用于处理大量删除时驱动参数数量有限制的情况。

示例：

```typescript
userRepository.remove(users, { chunk: 1000 })
```

## `TreeRepository` API

关于 `TreeRepository` API，请参阅 [树形实体文档](../entity/4-tree-entities.md#working-with-tree-entities)。

## `MongoRepository` API

关于 `MongoRepository` API，请参阅 [MongoDB 文档](../drivers/mongodb.md)。
