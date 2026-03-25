# 迁移到 v1

这是从版本 `0.3.x` 升级到 `1.0` 的迁移指南。

## 平台要求

### Node.js 20+

最低 JavaScript 目标版本现在是 `ES2023`，需要 **Node.js 20 或更高版本**。如果您使用的是较旧的 Node.js 版本，请在更新 TypeORM 之前进行升级。

### 在非 Node 平台上 `Buffer` 被替换为 `Uint8Array`

浏览器 `Buffer` polyfill 已被移除。在非 Node 平台（浏览器、Deno、Bun）上，二进制数据现在以 `Uint8Array` 形式表示。Node.js 用户不受影响 — Node 的 `Buffer` 继承自 `Uint8Array`，并继续像以前一样工作。

## 驱动程序变更

### MySQL / MariaDB

#### `connectorPackage` 选项已移除

`connectorPackage` 选项已被移除，同时也移除了对旧版 `mysql` 客户端的支持。现在唯一支持的数据库客户端是 `mysql2`，TypeORM 将默认尝试加载它。如果您的项目中使用了 `mysql`，只需替换为 `mysql2` 即可。

#### `legacySpatialSupport` 默认值更改为 `false`

`legacySpatialSupport` 选项现在默认值为 `false`，这意味着 TypeORM 使用符合标准的空间函数 `ST_GeomFromText` 和 `ST_AsText`，这些函数在 MySQL 5.7 中引入，并且是 MySQL 8.0+ 所要求的。MySQL 8.0 中移除了旧的 `GeomFromText` 和 `AsText` 函数。

如果您使用的是 MySQL 5.6 或更早版本且依赖空间类型，请显式设置 `legacySpatialSupport: true`：

```typescript
new DataSource({
    type: "mysql",
    legacySpatialSupport: true,
    // ...
})
```

#### `width` 和 `zerofill` 列选项已移除

MySQL 8.0.17 弃用了整数类型显示宽度和 `ZEROFILL` 属性，MySQL 8.4 则完全移除了它们。TypeORM 不再支持 `width` 和 `zerofill` 列选项。如果您之前使用了这些选项，请从列定义中移除：

```typescript
// 之前
@Column({ type: "int", width: 9, zerofill: true })
postCode: number

// 之后
@Column({ type: "int" })
postCode: number
```

如果您需要零填充的显示格式，请在应用层使用 `String.prototype.padStart()` 或在原始查询中使用 MySQL `LPAD()` 函数来处理。整数类型的 `unsigned` 选项**不受**此更改影响。

### SQLite

`sqlite3` 包已被弃用。请改用 `better-sqlite3`：

```typescript
// 之前
new DataSource({
    type: "sqlite",
    database: "db.sqlite",
})

// 之后
new DataSource({
    type: "better-sqlite3",
    database: "db.sqlite",
})
```

#### `flags` 选项已移除

`sqlite3` 包接受 C 级别的打开标志（如 `OPEN_URI`、`OPEN_SHAREDCACHE` 等）。`better-sqlite3` 不支持这些，请改用专门的选项：

- `readonly` 用于只读模式
- `enableWAL` 用于 WAL 日志模式

#### `busyTimeout` 选项重命名为 `timeout`

`sqlite3` 包使用 `busyTimeout` 来配置 SQLite 的忙等待超时。`better-sqlite3` 改用 `timeout`（默认值：5000ms）：

```typescript
// 之前
new DataSource({
    type: "sqlite",
    database: "db.sqlite",
    busyTimeout: 2000,
})

// 之后
new DataSource({
    type: "better-sqlite3",
    database: "db.sqlite",
    timeout: 2000,
})
```

### MongoDB

TypeORM 现在需要 **`mongodb` Node.js 驱动 v7 或更高版本**（`^7.0.0`）。已不再支持 `mongodb` 驱动 v5/v6。

#### 已弃用的连接选项已移除

下列 MongoDB 连接选项已被移除：

| 已移除选项           | 替代操作                                               |
| -------------------- | ------------------------------------------------------ |
| `appname`            | 改用 `appName`（驼峰式）                               |
| `fsync`              | 改用 `writeConcern: { journal: true }`                 |
| `j`                  | 改用 `writeConcern: { journal: true }`                 |
| `keepAlive`          | 移除 — 自 MongoDB 驱动 v6.0 起始终启用                  |
| `keepAliveInitialDelay` | 移除 — 自 MongoDB 驱动 v6.0 起不可配置                  |
| `ssl`                | 改用 `tls`                                             |
| `sslCA`              | 改用 `tlsCAFile`                                       |
| `sslCRL`             | 移除 — 现代驱动中无替代项                               |
| `sslCert`            | 改用 `tlsCertificateKeyFile`                            |
| `sslKey`             | 改用 `tlsCertificateKeyFile`                            |
| `sslPass`            | 改用 `tlsCertificateKeyFilePassword`                    |
| `sslValidate`        | 改用 `tlsAllowInvalidCertificates`（取反含义）          |
| `useNewUrlParser`    | 移除 — 自 MongoDB 驱动 v4.0 起无效                      |
| `useUnifiedTopology` | 移除 — 自 MongoDB 驱动 v4.0 起无效                      |
| `w`                  | 改用 `writeConcern: { w: 1 }`                          |
| `wtimeout`           | 改用 `writeConcern: { wtimeoutMS: 2500 }`               |
| `wtimeoutMS`         | 改用 `writeConcern: { wtimeoutMS: 2500 }`               |

#### `stats()` 方法已移除

`stats()` 方法已从 `MongoQueryRunner`、`MongoEntityManager` 和 `MongoRepository` 中移除。底层的 `collStats` 命令在 MongoDB 服务器 6.2 中已被弃用，`Collection.stats()` 方法在 MongoDB Driver v7 中已被移除。

请改用 [`$collStats`](https://www.mongodb.com/docs/manual/reference/operator/aggregation/collStats/) 聚合阶段。注意响应结构有所不同 — `count`、`size` 和 `storageSize` 等属性嵌套在 `storageStats` 下，而不是位于顶层。

```typescript
// 之前
const stats = await mongoRepository.stats()
console.log(stats.count)
console.log(stats.size)
console.log(stats.totalIndexSize)

// 之后 — 使用 $collStats 聚合阶段
const [stats] = await dataSource.mongoManager
    .aggregate(MyEntity, [{ $collStats: { storageStats: {} } }])
    .toArray()
console.log(stats.storageStats.count)
console.log(stats.storageStats.size)
console.log(stats.storageStats.totalIndexSize)
```

#### 全局函数 `getMongoRepository` 和 `getMongoManager` 已移除

已废弃的全局函数 `getMongoRepository()` 和 `getMongoManager()` 已被移除。请改用 `DataSource` 或 `EntityManager` 实例方法：

```typescript
// 之前
import { getMongoManager, getMongoRepository } from "typeorm"

const manager = getMongoManager()
const repository = getMongoRepository(User)

// 之后
const manager = dataSource.mongoManager
const repository = dataSource.getMongoRepository(User)
```

#### 类型

内部的 MongoDB 类型（`ObjectId` 等）不再从 `typeorm` 中重新导出。请直接从 `mongodb` 导入：

```typescript
// 之前
import { ObjectId } from "typeorm"

// 之后
import { ObjectId } from "mongodb"
```

### MS SQL Server

#### `domain` 连接选项已移除

`SqlServerConnectionCredentialsOptions` 上已弃用的 `domain` 选项已被移除。请改用 `authentication` 选项并指定 NTLM 类型：

```typescript
// 之前
new DataSource({
    type: "mssql",
    domain: "MYDOMAIN",
    username: "user",
    password: "pass",
    // ...
})

// 之后
new DataSource({
    type: "mssql",
    authentication: {
        type: "ntlm",
        options: {
            domain: "MYDOMAIN",
            userName: "user",
            password: "pass",
        },
    },
    // ...
})
```

### SAP HANA

几个已弃用的 SAP HANA 连接别名已被移除。

- `hanaClientDriver` 已被移除。请改用 `driver`。
- `pool.max` 已被移除。请改用 `pool.maxConnectedOrPooled`。
- `pool.requestTimeout` 已被移除。请改用 `pool.maxWaitTimeoutIfPoolExhausted`。
- `pool.idleTimeout` 已被移除。请改用 `pool.maxPooledIdleTime`（秒）。
- `pool.min`、`pool.maxWaitingRequests` 和 `pool.checkInterval` 已被移除，无替代项。

另请注意连接池配置中的默认行为更改：

- `pool.maxPooledIdleTime` 现在默认值为 `30` 秒，不再回退到 `pool.idleTimeout`。
- `pool.maxWaitTimeoutIfPoolExhausted` 现在默认值为 `0`，不再回退到 `pool.requestTimeout`。

### Expo

对传统 Expo SQLite 驱动程序的支持已被移除。传统 API 已在 Expo SDK v52 中被移除。请升级到 **Expo SDK v52 或更高版本**并使用现代异步 SQLite API：

```typescript
// 之前
new DataSource({
    type: "expo",
    database: "db.sqlite",
})

// 之后 — 使用 Expo SDK v52+ 与现代异步 API
new DataSource({
    type: "expo",
    database: "db.sqlite",
    driver: require("expo-sqlite"),
})
```

### Redis（缓存）

已移除对 `RedisQueryResultCache` 中传统（v3）Redis 客户端的支持。请升级到 **Redis 客户端 v4 或更高版本**（`redis`、`ioredis`）：

```typescript
// 之前 — redis v3
import { createClient } from "redis"
const client = createClient()

// 之后 — redis v4+
import { createClient } from "redis"
const client = createClient()
await client.connect()
```

## 数据源

### `Connection` → `DataSource`

`DataSource` 在 v0.3 中取代了 `Connection`。向后兼容的别名现在已被移除：

```typescript
// 之前
import { Connection, ConnectionOptions } from "typeorm"

const connection = await createConnection(options)
await connection.close()

// 之后
import { DataSource, DataSourceOptions } from "typeorm"

const dataSource = new DataSource(options)
await dataSource.initialize()
await dataSource.destroy()
```

以下重命名适用于整个项目：

| 之前                             | 之后                       |
| -------------------------------- | -------------------------- |
| `Connection`                     | `DataSource`               |
| `ConnectionOptions`              | `DataSourceOptions`        |
| `BaseConnectionOptions`          | `BaseDataSourceOptions`    |
| `MysqlConnectionOptions`         | `MysqlDataSourceOptions`   |
| _（所有驱动程序遵循相同模式）_   |                            |
| `connection.connect()`           | `dataSource.initialize()`  |
| `connection.close()`             | `dataSource.destroy()`     |
| `connection.isConnected`         | `dataSource.isInitialized` |

### `name` 属性已移除

`DataSource` 和 `BaseDataSourceOptions` 上已弃用的 `name` 属性已被移除。命名连接在 v0.3 中 `ConnectionManager` 被移除时已被弃用。如果您曾使用 `name` 来标识连接，请直接管理您的 `DataSource` 实例。

注意：读取 `dataSource.name` 的代码现在将收到 `undefined` 而不是 `"default"`。如果您在日志记录或多租户逻辑中使用此值，请相应更新。

### 各个类中的 `.connection` 属性现为 `.dataSource`

`Driver`、`QueryRunner`、`EntityManager`、`QueryBuilder`、`EntityMetadata` 和 `*Event` 类中的 `connection` 属性已重命名为 `dataSource`。对于 `EntityManager`，此更改在 0.3 中已宣布，但实际上并未实现。为了便于过渡，添加了一个已弃用的 getter，它返回与 `dataSource` 相同的值。

### 其他

`ConnectionManager` 类已被移除。如果您曾使用它来管理多个连接，请直接创建和管理您的 `DataSource` 实例。

`ConnectionOptionsReader` 也已简化：`all()` 已重命名为 `get()`（以数组形式返回所有配置），旧的 `get(name)` 和 `has(name)` 方法已被移除。

```typescript
const reader = new ConnectionOptionsReader()

// 当您的 ormconfig 具有单个数据源时
const [options] = await reader.get()

// 当您需要从多个数据源获取特定配置时
const allOptions = await reader.get()
const postgresOptions = allOptions.find((o) => o.type === "postgres")
```

### 全局便利函数已移除

以下已废弃的全局函数已被移除：

- `createConnection` / `createConnections`
- `getConnection`
- `getConnectionManager`
- `getConnectionOptions`
- `getManager`
- `getSqljsManager`
- `getRepository`
- `getTreeRepository`
- `createQueryBuilder`

请使用 `DataSource` 实例上的等效方法：

```typescript
// 之前
const repo = getRepository(User)
const qb = createQueryBuilder("user")

// 之后
const repo = dataSource.getRepository(User)
const qb = dataSource.createQueryBuilder("user")
```

### 通过环境变量配置已移除

已弃用的 `ConnectionOptionsEnvReader` 类以及通过 `TYPEORM_CONNECTION`、`TYPEORM_URL` 和其他 `TYPEORM_*` 环境变量配置连接的能力已被移除。`ormconfig.env` 文件格式也不再受支持。TypeORM 不再自动加载 `.env` 文件或依赖 `dotenv`。

请改用 TypeScript 或 JavaScript 配置文件：

```typescript
// ormconfig.ts
export default {
    type: process.env.DB_TYPE,
    url: process.env.DB_URL,
    // ...
}
```

## 行为变更

### `invalidWhereValuesBehavior` 默认值更改为 `throw`

**这是一个重大的行为变更，可能会导致现有应用程序在运行时出现问题。**

where 条件中 null 和 undefined 值的默认行为已更改。以前，null 和 undefined 值会被静默忽略（该属性被跳过）。现在，两者**默认都会抛出错误**。

此更改可防止出现像 `findBy({ id: undefined })` 这样的查询静默返回所有行而不是失败的隐蔽错误。

```typescript
// v0.3: 静默返回所有帖子（null 被忽略）
// v1.0: 抛出 TypeORMError
await repository.find({ where: { text: null } })

// v0.3: 静默返回所有帖子（undefined 被忽略）
// v1.0: 抛出 TypeORMError
await repository.find({ where: { text: undefined } })
```

要匹配 null 值，请使用 `IsNull()` 操作符：

```typescript
import { IsNull } from "typeorm"

await repository.find({ where: { text: IsNull() } })
```

要恢复以前的行为，请在数据源选项中设置 `invalidWhereValuesBehavior`：

```typescript
new DataSource({
    // ...
    invalidWhereValuesBehavior: {
        null: "ignore",
        undefined: "ignore",
    },
})
```

此设置保护所有高级 API —— 查询操作、仓库/管理器的变更方法，以及 `queryBuilder.setFindOptions()`（唯一受影响的 QueryBuilder 方法）。其余的 QueryBuilder 方法（`.where()`、`.andWhere()`、`.orWhere()`）**不受**影响 —— null 和 undefined 值会原样传递。详情请参见 [Null 和 undefined 处理](../data-source/5-null-and-undefined-handling.md)。

### 哈希处理

TypeORM 之前使用 `sha.js` npm 包进行 SHA-1 哈希（非标准实现）。这已被替换为 Node.js 内置的 `crypto` 模块，并且 `uuid` 包已被替换为 `crypto.randomUUID()`。

对于浏览器环境，`RandomGenerator.sha1` 已修复为标准实现。

**影响：** 如果你使用 TypeORM 的查询结果缓存，升级后现有的缓存条目将失效，因为哈希函数产生了不同的输出。这是无害的 —— 缓存将自动重建 —— 但你可能会看到缓存未命中的情况短暂增加。

### Glob 模式

Glob 模式（用于实体/迁移文件发现）现在由 `tinyglobby` 处理，而不是 `glob`。这基本上是一个直接替换，但花括号扩展或平台特定路径分隔符的边界情况可能表现不同。

## 数据列

### `readonly` 选项已移除

已废弃的 `readonly` 列选项已被移除。请改用 `update` 选项 —— 注意其含义是相反的：

```typescript
// 之前
@Column({ readonly: true })
authorName: string

// 之后
@Column({ update: false })
authorName: string
```

### `ColumnNumericOptions` 上的 `unsigned` 已移除

`ColumnNumericOptions` 上已废弃的 `unsigned` 属性（用于 decimal/float 列类型重载，如 `@Column("decimal", { unsigned: true })`）已被移除，因为 MySQL 已为非整数数值类型废弃了 `UNSIGNED`。整数类型的 `ColumnOptions` 上的 `unsigned` 选项**不受**影响。

## 关联关系

### `nullable: false` 现在使用 INNER JOIN

标记为 `nullable: false` 的关联关系现在通过 `relations`、即时加载或查询选项加载时使用 `INNER JOIN` 而不是 `LEFT JOIN`。这仅适用于拥有连接列的关联类型（`ManyToOne` 和拥有端的 `OneToOne`）。

这在语义上是正确的，因为非空外键保证相关实体存在，并允许数据库优化器生成更高效的查询计划。

**潜在破坏性变更：** 如果你的数据库包含违反 `NOT NULL` 约束的行（例如孤立的外键，或设置了 `nullable: false` 但列在数据库中实际上是可空的），这些行将从查询结果中排除。验证你的数据完整性，或在需要时将关联关系更改为 `nullable: true`。

```typescript
// INNER JOIN — 保证相关实体存在
@ManyToOne(() => User, { nullable: false })
author: User

// LEFT JOIN — 相关实体可能不存在（默认）
@ManyToOne(() => User)
optionalEditor: User
```

`OneToMany`、`ManyToMany` 和反向的 `OneToOne` 关联关系始终使用 `LEFT JOIN`，无论 `nullable` 设置如何，因为这些关联类型在当前表上没有连接列。

**软删除例外：** 如果相关实体有 `@DeleteDateColumn`，即使对于 `nullable: false` 的关联关系也会使用 `LEFT JOIN`（除非设置了 `withDeleted: true`）。这可以防止软删除的相关实体过滤掉其父行。

## 仓库

### `findOneById`

已从 `EntityManager`、`Repository`、`BaseEntity`、`MongoEntityManager` 和 `MongoRepository` 中移除已废弃的 `findOneById` 方法。请改用 `findOneBy`：

```typescript
// 之前
const user = await manager.findOneById(User, 1)
const user = await repository.findOneById(1)
const user = await User.findOneById(1)

// 之后
const user = await manager.findOneBy(User, { id: 1 })
const user = await repository.findOneBy({ id: 1 })
const user = await User.findOneBy({ id: 1 })
```

对于带有 `@ObjectIdColumn()` 的 MongoDB 实体，`findOneBy` 的工作方式相同 —— TypeORM 会自动将属性名转换为 `_id`。

### `findByIds` 已移除

已从 `EntityManager`、`Repository` 和 `BaseEntity` 中移除已废弃的 `findByIds` 方法。请改用带 `In` 操作符的 `findBy`：

```typescript
// 之前
const users = await repository.findByIds([1, 2, 3])

// 之后
import { In } from "typeorm"

const users = await repository.findBy({ id: In([1, 2, 3]) })
```

### `exist` 重命名为 `exists`

已废弃的 `Repository.exist()` 方法已被移除。请改用 `exists()` —— 两者行为完全相同：

```typescript
// 之前
const hasUsers = await userRepository.exist({ where: { isActive: true } })

// 之后
const hasUsers = await userRepository.exists({ where: { isActive: true } })
```

### `AbstractRepository`、`@EntityRepository` 和 `getCustomRepository` 已移除

`AbstractRepository` 类、`@EntityRepository` 装饰器和 `getCustomRepository()` 方法已被移除。这些在 v0.3 中已被废弃，取而代之的是 `Repository.extend()`：

```typescript
// 之前
@EntityRepository(User)
class UserRepository extends AbstractRepository<User> {
    findByName(name: string) {
        return this.repository.findOneBy({ name })
    }
}
const userRepo = dataSource.getCustomRepository(UserRepository)

// 之后
const UserRepository = dataSource.getRepository(User).extend({
    findByName(name: string) {
        return this.findOneBy({ name })
    },
})
```

以下错误类也被移除了：`CustomRepositoryDoesNotHaveEntityError`、`CustomRepositoryCannotInheritRepositoryError`、`CustomRepositoryNotFoundError`。

### `@RelationCount` 装饰器和 `loadRelationCountAndMap` 已移除

`@RelationCount` 装饰器和 `SelectQueryBuilder.loadRelationCountAndMap()` 方法已被移除。请改用 `@VirtualColumn` 或在查询构建器中使用子查询代替：

```typescript
// 之前
@RelationCount((post: Post) => post.categories)
categoryCount: number

// 之后 —— 使用带子查询的 @VirtualColumn
// 请替换连接表名和列名以匹配你的数据库结构
@VirtualColumn({
    query: (alias) =>
        `SELECT COUNT(*) FROM post_categories_category WHERE postId = ${alias}.id`,
})
categoryCount: number
```

## 查询选项

### `join` 选项已移除

`FindOneOptions` 和 `FindManyOptions` 上已废弃的 `join` 属性以及 `JoinOptions` 接口已被移除。

#### `leftJoinAndSelect` → `relations`

如果你之前使用 `leftJoinAndSelect`，请将其替换为 `relations` 对象语法 —— `relations` 始终执行带选择的 LEFT JOIN，这是等效的：

```typescript
// 之前
const posts = await repository.find({
    join: {
        alias: "post",
        leftJoinAndSelect: {
            categories: "post.categories",
            author: "post.author",
        },
    },
})

// 之后
const posts = await repository.find({
    relations: { categories: true, author: true },
})
```

#### 所有其他连接类型 → QueryBuilder

`relations` 选项仅支持带选择的 LEFT JOIN。如果你之前使用 `innerJoinAndSelect`、`innerJoin` 或 `leftJoin`（不带选择），请切换到 QueryBuilder API：

```typescript
// 之前 —— innerJoinAndSelect
const posts = await repository.find({
    join: {
        alias: "post",
        innerJoinAndSelect: {
            categories: "post.categories",
        },
    },
})

// 之后 —— 使用 innerJoinAndSelect 的 QueryBuilder
const posts = await repository
    .createQueryBuilder("post")
    .innerJoinAndSelect("post.categories", "categories")
    .getMany()

// 之前 —— leftJoin（不带选择）
const posts = await repository.find({
    join: {
        alias: "post",
        leftJoin: {
            categories: "post.categories",
        },
    },
    where: { categories: { isRemoved: false } },
})

// 之后 —— 使用 leftJoin 的 QueryBuilder
const posts = await repository
    .createQueryBuilder("post")
    .leftJoin("post.categories", "categories")
    .where("categories.isRemoved = :isRemoved", { isRemoved: false })
    .getMany()
```

这种区别在实践中很重要。例如，PostgreSQL 和 CockroachDB 不允许在外部连接的可空侧使用 `FOR UPDATE`，因此结合锁定与连接关系的查询可能需要 INNER JOIN：

```typescript
// 之前 —— innerJoinAndSelect + 锁定
const post = await repository.findOne({
    join: {
        alias: "post",
        innerJoinAndSelect: {
            categories: "post.categories",
        },
    },
    lock: { mode: "pessimistic_write", tables: ["category"] },
})

// 之后 —— 使用 innerJoinAndSelect + 锁定的 QueryBuilder
const post = await repository
    .createQueryBuilder("post")
    .innerJoinAndSelect("post.categories", "categories")
    .setLock("pessimistic_write", undefined, ["categories"])
    .getOne()
```

#### 嵌套关系的锁定 → QueryBuilder

`relations` 选项不能与连接表上的悲观锁定一起使用，因为 `relations` 始终使用 LEFT JOIN，而 PostgreSQL/CockroachDB 拒绝在外部连接的可空侧使用 `FOR UPDATE`。请改用带 `innerJoinAndSelect` 的 QueryBuilder：

```typescript
// 之前 —— 通过查询选项实现嵌套关系 + 锁定
const post = await repository.findOne({
    where: { id: 1 },
    join: {
        alias: "post",
        innerJoinAndSelect: {
            categories: "post.categories",
            images: "categories.images",
        },
    },
    lock: { mode: "pessimistic_write", tables: ["images"] },
})

// 之后 —— 使用 innerJoinAndSelect + 锁定的 QueryBuilder
const post = await repository
    .createQueryBuilder("post")
    .innerJoinAndSelect("post.categories", "categories")
    .innerJoinAndSelect("categories.images", "images")
    .where("post.id = :id", { id: 1 })
    .setLock("pessimistic_write", undefined, ["images"])
    .getOne()
```

请注意，使用 `relations` 锁定**主**表仍然有效 —— 只有锁定**连接的**表才需要使用带有内部连接的 QueryBuilder。

### 基于字符串的 `select` 已移除

`select` 查询选项的已废弃字符串数组语法已被移除。请改用对象语法：

```typescript
// 之前
const users = await repository.find({
    select: ["id", "name"],
})

// 之后
const users = await repository.find({
    select: { id: true, name: true },
})
```

被移除的类型是 `FindOptionsSelectByString`。

### 基于字符串的 `relations` 已移除

`relations` 查询选项的已废弃字符串数组语法已被移除。请改用对象语法：

```typescript
// 之前
const users = await repository.find({
    relations: ["profile", "posts"],
})

// 之后
const users = await repository.find({
    relations: { profile: true, posts: true },
})
```

被移除的类型是 `FindOptionsRelationByString`。

## QueryBuilder

### `printSql` 已移除

QueryBuilder 上的 `printSql()` 方法已被移除。它是多余的，因为当启用查询日志时，所有执行的查询已经通过配置的日志记录器自动记录。请改用 `getSql()` 或 `getQueryAndParameters()` 来检查生成的 SQL：

```typescript
// 之前
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.id = :id", { id: 1 })
    .printSql()
    .getMany()

// 之后 — 在执行前检查 SQL
const qb = dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.id = :id", { id: 1 })

console.log(qb.getSql())
// 或: const [sql, params] = qb.getQueryAndParameters()

const users = await qb.getMany()
```

要自动记录所有执行的查询，请在 DataSource 中启用查询日志：

```typescript
new DataSource({
    // ...
    logging: ["query"],
})
```

### `onConflict` 已移除

`InsertQueryBuilder` 上的 `onConflict()` 方法已被移除。它接受原始 SQL 字符串，这些是特定于驱动且容易出错的。请改用 `orIgnore()` 或 `orUpdate()`：

```typescript
// 之前
await dataSource
    .createQueryBuilder()
    .insert()
    .into(Post)
    .values(post)
    .onConflict(`("id") DO NOTHING`)
    .execute()

// 之后
await dataSource
    .createQueryBuilder()
    .insert()
    .into(Post)
    .values(post)
    .orIgnore()
    .execute()

// 之前
await dataSource
    .createQueryBuilder()
    .insert()
    .into(Post)
    .values(post)
    .onConflict(`("id") DO UPDATE SET "title" = :title`)
    .setParameter("title", post.title)
    .execute()

// 之后
await dataSource
    .createQueryBuilder()
    .insert()
    .into(Post)
    .values(post)
    .orUpdate(["title"], ["id"])
    .execute()
```

### `orUpdate` 对象重载已移除

基于对象的 `orUpdate()` 重载（接受 `{ columns?, overwrite?, conflict_target? }`）已被移除。请改用数组形式签名：

```typescript
// 之前
.orUpdate({ conflict_target: ["date"], overwrite: ["title"] })

// 之后
.orUpdate(["title"], ["date"])
```

### `setNativeParameters` 已移除

```typescript
// 之前
qb.setNativeParameters({ key: "value" })

// 之后
qb.setParameters({ key: "value" })
```

内部的 `QueryExpressionMap.nativeParameters` 属性也已被移除。如果你有访问 `expressionMap.nativeParameters` 的自定义 QueryBuilder 子类，请切换到 `expressionMap.parameters`。

### `WhereExpression` 类型别名已移除

```typescript
// 之前
import { WhereExpression } from "typeorm"

// 之后
import { WhereExpressionBuilder } from "typeorm"
```

### `replacePropertyNames` 已移除

已废弃的受保护方法 `replacePropertyNames()` 已被移除。该方法自从属性名替换转由 `replacePropertyNamesForTheWholeQuery()` 处理后即为无操作。如果你在自定义 QueryBuilder 子类中重写了此方法，重写将不再被调用。

### 已弃用的锁定模式已移除

```typescript
// 之前
.setLock("pessimistic_partial_write")

// 之后
.setLock("pessimistic_write")
.setOnLocked("skip_locked")

// 之前
.setLock("pessimistic_write_or_fail")

// 之后
.setLock("pessimistic_write")
.setOnLocked("nowait")
```

在查询选项中同样适用：

```typescript
// 之前
{ lock: { mode: "pessimistic_partial_write" } }

// 之后
{ lock: { mode: "pessimistic_write", onLocked: "skip_locked" } }

// 之前
{ lock: { mode: "pessimistic_write_or_fail" } }

// 之后
{ lock: { mode: "pessimistic_write", onLocked: "nowait" } }
```

## 迁移

### `getAllMigrations` 已移除

已弃用的 `getAllMigrations()` 方法已从 `MigrationExecutor` 中移除。请改用 `getPendingMigrations()` 或 `getExecutedMigrations()`，或直接访问 `dataSource.migrations` 获取已注册迁移类的列表：

```typescript
// 之前
const migrations = await migrationExecutor.getAllMigrations()

// 之后 — 取决于你的需要
const pending = await migrationExecutor.getPendingMigrations()
const executed = await migrationExecutor.getExecutedMigrations()
const registered = dataSource.migrations
```

### `QueryRunner.loadedTables` 和 `loadedViews` 已移除

```typescript
// 之前
const tables = queryRunner.loadedTables
const views = queryRunner.loadedViews

// 之后
const tables = await queryRunner.getTables()
const views = await queryRunner.getViews()
```

注意：替代方案是异步方法，而不是同步属性。

## 容器系统

已弃用的 IoC 容器集成已被移除：`useContainer()`、`getFromContainer()`、`ContainerInterface`、`ContainedType` 和 `UseContainerOptions`。

TypeORM 不再内置 IoC 容器支持。`typeorm-typedi-extensions` 和 `typeorm-routing-controllers-extensions` 包也不再兼容。下面的部分介绍了如何根据你的设置进行迁移。

### 带有依赖项的订阅者和迁移

TypeORM 始终在内部使用零参数构造函数实例化订阅者和迁移，因此你不能传递预构建的实例。如果你的迁移需要访问服务，请在迁移本身内部使用 `DataSource`（可通过 `queryRunner.dataSource` 获取）：

```typescript
// 之前
import { useContainer } from "typeorm"
import { Container } from "typedi"
useContainer(Container)

// 之后 — 在迁移内部通过 DataSource 访问依赖项
export class MyMigration1234 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        const repo = queryRunner.dataSource.getRepository(User)
        // ...
    }
}
```

### 访问仓库和实体管理器

如果你之前使用 `typeorm-typedi-extensions` 将 `EntityManager` 或仓库注入到你的服务中，请直接改用 `DataSource`：

```typescript
// 之前（使用 typeorm-typedi-extensions）
import { InjectManager, InjectRepository } from "typeorm-typedi-extensions"

class UserService {
    @InjectManager()
    private manager: EntityManager

    @InjectRepository(User)
    private userRepository: Repository<User>
}

// 之后 — 从 DataSource 实例访问
class UserService {
    private manager: EntityManager
    private userRepository: Repository<User>

    constructor(dataSource: DataSource) {
        this.manager = dataSource.manager
        this.userRepository = dataSource.getRepository(User)
    }
}
```

### 与 DI 框架一起使用

如果你使用 DI 框架，请在容器中注册 `DataSource`（或其仓库）作为提供程序：

```typescript
// typedi 示例
import { DataSource } from "typeorm"
import { Container } from "typedi"

const dataSource = new DataSource({
    /* ... */
})
await dataSource.initialize()
Container.set(DataSource, dataSource)
Container.set("UserRepository", dataSource.getRepository(User))
```

### NestJS

NestJS 用户不受影响 — `@nestjs/typeorm` 包有自己的集成，不依赖于 TypeORM 已移除的容器系统。但是，`@nestjs/typeorm` v10 和当前的 v11.0.0 尝试注册已移除的 `Connection` 类，将在启动时崩溃。确保你使用的是包含 TypeORM v1 兼容性修复版本的 `@nestjs/typeorm`。

## 其他内部移除

以下内部 API 已被移除。只有在你构建自定义驱动、扩展 QueryBuilder 或使用低级元数据 API 时，这些才会影响你：

| 已移除 | 替代方案 |
| ---------------------------------------------- | ------------------------------------------------- |
| `EntityMetadata.createPropertyPath()`（静态） | 已移除，无公共替代方案 |
| `DriverUtils.buildColumnAlias()` | 使用 `DriverUtils.buildAlias()` |
| `Broadcaster.broadcastLoadEventsForAll()` | 无替代方案 — 使用单独的事件订阅者 |
| `QueryExpressionMap.nativeParameters` | 使用 `QueryExpressionMap.parameters` |
