# 迁移到 v1

这是从版本 `0.3.x` 升级到 `1.0` 的迁移指南。

## JavaScript 和 Node.js 版本

最低支持的 JavaScript 版本现在是 `ES2023`，这意味着支持 Node 20 及更高版本。如果您使用的平台不支持 `ES2023`，请升级。

## 数据库客户端库

TypeORM 需要更新版本的数据库客户端库。

## MySQL / MariaDB

### `connectorPackage`

`connectorPackage` 选项已被移除，同时也移除了对旧版 `mysql` 客户端的支持。现在唯一支持的数据库客户端是 `mysql2`，TypeORM 将默认尝试加载它。如果您的项目中使用了 `mysql`，只需替换为 `mysql2` 即可。

### `legacySpatialSupport` 默认值更改为 `false`

`legacySpatialSupport` 选项现在默认值为 `false`，这意味着 TypeORM 使用符合标准的空间函数 `ST_GeomFromText` 和 `ST_AsText`，这些函数在 MySQL 5.7 中引入，并且是 MySQL 8.0+ 所要求的。MySQL 8.0 中移除了旧的 `GeomFromText` 和 `AsText` 函数。

如果您使用的是 MySQL 5.6 或更早版本且依赖空间类型，请显式设置 `legacySpatialSupport: true`：

```typescript
new DataSource({
    type: "mysql",
    legacySpatialSupport: true,
    // ...
})
```

### 移除 `width` 和 `zerofill` 列选项

MySQL 8.0.17 弃用了整数类型显示宽度和 `ZEROFILL` 属性，MySQL 8.4 则完全移除了它们。TypeORM 不再支持 `width` 和 `zerofill` 列选项。如果您之前使用了这些选项，请从列定义中移除：

```typescript
// 之前
@Column({ type: "int", width: 9, zerofill: true })
postCode: number

// 之后
@Column({ type: "int" })
postCode: number
```

如果需要数字的零填充显示格式，请在应用层使用 `String.prototype.padStart()` 或在原生查询中使用 MySQL 的 `LPAD()` 函数。整数类型的 `unsigned` 选项**不**受此更改影响，依旧有效。

## SAP HANA

移除了多个已废弃的 SAP HANA 连接别名。

- 移除了 `hanaClientDriver`，请使用 `driver`。
- 移除了 `pool.max`，请使用 `pool.maxConnectedOrPooled`。
- 移除了 `pool.requestTimeout`，请使用 `pool.maxWaitTimeoutIfPoolExhausted`。
- 移除了 `pool.idleTimeout`，请使用 `pool.maxPooledIdleTime`（单位：秒）。
- 移除了 `pool.min`、`pool.maxWaitingRequests` 和 `pool.checkInterval`，无替代选项。

另外注意池配置的默认行为变化：

- `pool.maxPooledIdleTime` 现在默认值为 30 秒，不再回退使用 `pool.idleTimeout`。
- `pool.maxWaitTimeoutIfPoolExhausted` 现在默认值为 0，不再回退使用 `pool.requestTimeout`。

## SQLite

不再支持 `sqlite3`，改为使用 `better-sqlite3` 作为 `sqlite` 数据库的主要驱动：

```typescript
new DataSource({
    type: "better-sqlite3", // 之前是 "sqlite"
    database: "db.sqlite",
})
```

### 移除 `flags` 选项

`sqlite3` 包接受 C 级别的打开标志（如 `OPEN_URI`、`OPEN_SHAREDCACHE` 等）。`better-sqlite3` 不支持这些，请改用专门的选项：

- `readonly` 用于只读模式
- `enableWAL` 用于 WAL 日志模式

### 将 `busyTimeout` 选项重命名为 `timeout`

`sqlite3` 使用 `busyTimeout` 配置 SQLite 的忙等待超时，`better-sqlite3` 改用了 `timeout`（默认：5000ms）。请相应更新您的 DataSource 选项：

```typescript
new DataSource({
    type: "better-sqlite3",
    database: "db.sqlite",
    timeout: 2000, // 之前是 sqlite3 中的 `busyTimeout`
})
```

## MongoDB

### 移除已废弃的连接选项

TypeORM 现在要求 **MongoDB 服务器版本为 6.0 或更高** 且使用 **`mongodb` Node.js 驱动版本 v6 或更高**（`^6.0.0 || ^7.0.0`）。不再支持 MongoDB 服务器 5.x 以及 `mongodb` 驱动 v5。

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

### `getMongoRepository` 和 `getMongoManager` 全局函数

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

### Types

The internal MongoDB types are no longer exported. You can import `ObjectId` from `mongodb` instead of `typeorm`.

## MS SQL Server

### `domain` connection option removed

The deprecated `domain` option on `SqlServerConnectionCredentialsOptions` has been removed. Use the `authentication` option with NTLM type instead:

```typescript
// Before
new DataSource({
    type: "mssql",
    domain: "MYDOMAIN",
    username: "user",
    password: "pass",
    // ...
})

// After
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

## Expo

已移除对旧版 Expo SQLite 驱动的支持。旧版 API 在 Expo SDK v52 中被移除，因此您需要使用 Expo SDK v52 或更高版本，以及现代的异步 SQLite API。

## 哈希

历史上 TypeORM 使用了非标准的 SHA-1 实现来进行哈希运算。现已更改为使用 Node.js 内置的 `crypto` 模块。

对于浏览器环境，`RandomGenerator.sha1` 已修正为标准实现。

## Glob 模式

Glob 模式现在由 `tinyglobby` 处理，替代了之前的 `glob`。虽然 `tinyglobby` 几乎是 `glob` 的直接替代品，但在某些情况下行为可能有所不同。

## 移除的废弃功能

### Redis

`RedisQueryResultCache` 中移除了对旧版（v3/v4）Redis 客户端的支持。

### 全局快捷函数

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

请改用您的 `DataSource` 实例上的对应方法。例如：

```typescript
// 之前
const repo = getRepository(User)
const qb = createQueryBuilder("user")

// 之后
const repo = dataSource.getRepository(User)
const qb = dataSource.createQueryBuilder("user")
```

## Data Source

### `Connection` vs `DataSource`

`DataSource` replaced `Connection` in v0.3 to provide a better meaning to the abstract concept represented by this class. For backwards compatibility, `Connection` was kept as an alias to `DataSource`, now this alias was removed. Similarly, `ConnectionOptions` is now `DataSourceOptions`.

In addition, the old method names of the `DataSource` class have been removed, so `Connection.connect()` is now only `DataSource.initialize()`, `Connection.close()` is `DataSource.destroy()` etc.

### `ConnectionManager`

`ConnectionManager` 类已被移除。如果您曾使用它管理多个连接，请直接创建和管理您的 `DataSource` 实例。

## 数据列

### `readonly`

已废弃的 `readonly` 列选项已被移除。请改用 `update` 选项——注意其含义是相反的：

```typescript
// 之前
@Column({ readonly: true })
authorName: string

// 之后
@Column({ update: false })
authorName: string
```

### `unsigned`

在 `ColumnNumericOptions` 中（用于如 `@Column("decimal", { unsigned: true })` 这类 decimal/float 类型重载的 `unsigned` 属性）已被移除，因为 MySQL 不再支持非整数字段的 `UNSIGNED`。`ColumnOptions` 中用于整数类型的 `unsigned` 选项未受影响，仍然可用。

## 仓库

### `findByIds`

已废弃的 `findByIds` 方法已从 `EntityManager`、`Repository` 和 `BaseEntity` 中移除。请改用带 `In` 操作符的 `findBy`：

```typescript
// 之前
const users = await repository.findByIds([1, 2, 3])

// 之后
import { In } from "typeorm"

const users = await repository.findBy({ id: In([1, 2, 3]) })
```

### `exist`

已废弃的 `Repository.exist()` 方法已被移除。请改用 `exists()` —— 两者行为完全相同：

```typescript
// 之前
const hasUsers = await userRepository.exist({ where: { isActive: true } })

// 之后
const hasUsers = await userRepository.exists({ where: { isActive: true } })
```

### `AbstractRepository`、`@EntityRepository` 和 `getCustomRepository`

`AbstractRepository` 类、`@EntityRepository` 装饰器和 `getCustomRepository()` 方法已被移除。这些在 v0.3 中已经废弃，建议使用 `Repository.extend()`。

之前：

```typescript
@EntityRepository(User)
class UserRepository extends AbstractRepository<User> {
    findByName(name: string) {
        return this.repository.findOneBy({ name })
    }
}

// 使用方式
const userRepo = dataSource.getCustomRepository(UserRepository)
```

之后：

```typescript
const UserRepository = dataSource.getRepository(User).extend({
    findByName(name: string) {
        return this.findOneBy({ name })
    },
})
```

以下错误类也被移除了：`CustomRepositoryDoesNotHaveEntityError`、`CustomRepositoryCannotInheritRepositoryError`、`CustomRepositoryNotFoundError`。

### `@RelationCount` 装饰器与 `loadRelationCountAndMap`

`@RelationCount` 装饰器和 `SelectQueryBuilder.loadRelationCountAndMap()` 方法已被移除。请改用 `@VirtualColumn` 或在查询构建器中使用子查询代替：

```typescript
// 之前
@RelationCount((post: Post) => post.categories)
categoryCount: number

// 之后 — 使用带子查询的 @VirtualColumn
// 请替换连接表名和列名以匹配你的数据库结构
@VirtualColumn({
    query: (alias) =>
        `SELECT COUNT(*) FROM post_categories_category WHERE postId = ${alias}.id`,
})
categoryCount: number
```

## 查询构建器

### `onConflict`

`InsertQueryBuilder` 上的 `onConflict()` 方法已被移除。请改用 `orIgnore()` 或 `orUpdate()`：

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

### `orUpdate`

基于对象的 `orUpdate()` 重载（接受 `{ columns?, overwrite?, conflict_target? }`）已被移除。请改用数组形式签名：

```typescript
// 之前
.orUpdate({ conflict_target: ["date"], overwrite: ["title"] })

// 之后
.orUpdate(["title"], ["date"])
```

### `replacePropertyNames`

已废弃的受保护方法 `replacePropertyNames()` 已被移除。该方法自从属性名替换转由 `replacePropertyNamesForTheWholeQuery()` 处理后即为无操作。如果你在自定义 QueryBuilder 子类中重写了此方法，重写将不再被调用。

### `setNativeParameters`

`setNativeParameters()` 方法已被移除。请改用 `setParameters()`。

### `WhereExpression` 类型别名

已废弃的 `WhereExpression` 类型别名已被移除。请改用 `WhereExpressionBuilder`。

### 废弃的锁模式

`pessimistic_partial_write` 和 `pessimistic_write_or_fail` 锁模式已被移除。请改用带有 `onLocked` 选项的 `pessimistic_write`：

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

### `getAllMigrations`

已废弃的 `getAllMigrations()` 方法已被移除。请改用 `getMigrations()` —— 两者行为相同：

```typescript
// 之前
const migrations = await migrationExecutor.getAllMigrations()

// 之后
const migrations = migrationExecutor.getMigrations()
```

### `QueryRunner.loadedTables` 和 `loadedViews`

已废弃的 `QueryRunner` 接口上的 `loadedTables` 和 `loadedViews` 属性已被移除。请改用 `getTables()` 和 `getViews()`：

```typescript
// 之前
const tables = queryRunner.loadedTables
const views = queryRunner.loadedViews

// 之后
const tables = await queryRunner.getTables()
const views = await queryRunner.getViews()
```

## 配置

### `invalidWhereValuesBehavior` 默认改为抛错

where 条件中 null 和 undefined 值的默认行为发生了变化。此前，null 和 undefined 值会被静默忽略（属性被跳过）。现在，默认 **会抛出错误**。

此变更避免了诸如 `findBy({ id: undefined })` 这类查询静默返回第一条数据而非报错的潜在错误。

```typescript
// v0.3：静默返回所有帖子（null 被忽略）
// v1.0：抛出 TypeORMError
await repository.find({ where: { text: null } })

// v0.3：静默返回所有帖子（undefined 被忽略）
// v1.0：抛出 TypeORMError
await repository.find({ where: { text: undefined } })
```

要匹配 null 值，请使用 `IsNull()` 操作符：

```typescript
import { IsNull } from "typeorm"

await repository.find({ where: { text: IsNull() } })
```

要恢复之前行为，请在数据源选项中设置 `invalidWhereValuesBehavior`：

```typescript
new DataSource({
    // ...
    invalidWhereValuesBehavior: {
        null: "ignore",
        undefined: "ignore",
    },
})
```

该设置影响所有高级 API —— 查询操作、仓库/管理器的变更方法和 `queryBuilder.setFindOptions()`（这是惟一影响到的 QueryBuilder 方法）。其余 QueryBuilder 方法（`.where()`、`.andWhere()`、`.orWhere()`）不受影响 —— null 和 undefined 值原样传递。详情请查看[Null 和 undefined 的处理](../data-source/5-null-and-undefined-handling.md)。

### 取消通过环境变量配置支持

废弃了 `ConnectionOptionsEnvReader` 类以及通过 `TYPEORM_CONNECTION`、`TYPEORM_URL` 和其他 `TYPEORM_*` 环境变量配置连接的功能，也不再支持 `ormconfig.env` 文件格式。TypeORM 也不再自动加载 `.env` 文件或依赖 `dotenv`。

请改用 TypeScript 或 JavaScript 配置文件（`ormconfig.ts`、`ormconfig.js`），直接引用环境变量：

```typescript
// ormconfig.ts
export default {
    type: process.env.DB_TYPE,
    url: process.env.DB_URL,
    // ...
}
```

### `name`

废弃了 `DataSource` 和 `BaseDataSourceOptions` 上的 `name` 属性。命名连接在 v0.3 版本移除 `ConnectionManager` 时即被废弃。如果你曾用 `name` 识别连接，请改为直接管理 `DataSource` 实例。

`ConnectionOptionsReader` 也已简化：`all()` 被重命名为 `get()`（返回所有配置数组），旧的 `get(name)` 和 `has(name)` 方法已被移除。

```typescript
const reader = new ConnectionOptionsReader()

// 若 ormconfig 只有单个数据源
const [options] = await reader.get()

// 若要在多个数据源中获取指定配置
const allOptions = await reader.get()
const postgresOptions = allOptions.find((o) => o.type === "postgres")
```

## 容器系统

废弃了 IoC 容器集成：`useContainer()`、`getFromContainer()`、`ContainerInterface`、`ContainedType` 和 `UseContainerOptions` 已被移除。TypeORM 现在始终直接实例化迁移和订阅者。如果需要依赖注入，请自行实例化类并传入 `DataSource` 选项：

```typescript
// 之前
import { useContainer } from "typeorm"
useContainer(myContainer)

// 之后 — 直接传入预构建的实例
new DataSource({
    subscribers: [new MySubscriber(dep1, dep2)],
    migrations: [new MyMigration(dep1)],
    // ...
})
```
```
