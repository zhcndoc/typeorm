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

下列 MongoDB 连接选项已被移除：

| 已移除选项           | 替代操作                                               |
| -------------------- | ------------------------------------------------------ |
| `appname`            | 改用 `appName`（驼峰式）                               |
| `fsync`              | 改用 `writeConcern: { journal: true }`                 |
| `j`                  | 改用 `writeConcern: { journal: true }`                 |
| `useNewUrlParser`    | 移除 — 自 MongoDB Driver v4.0 起无效                     |
| `useUnifiedTopology` | 移除 — 自 MongoDB Driver v4.0 起无效                     |
| `wtimeout`           | 改用 `writeConcern: { wtimeoutMS: 2500 }`               |

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

## Expo

已移除对旧版 Expo SQLite 驱动的支持。旧版 API 在 Expo SDK v52 中被移除，因此您需要使用 Expo SDK v52 或更高版本，以及现代的异步 SQLite API。

## 哈希

历史上 TypeORM 使用了非标准的 SHA-1 实现来进行哈希运算。现已更改为使用 Node.js 内置的 `crypto` 模块。

对于浏览器环境，`RandomGenerator.sha1` 已修正为标准实现。

## Glob 模式

Glob 模式现在由 `tinyglobby` 处理，替代了之前的 `glob`。虽然 `tinyglobby` 几乎是 `glob` 的直接替代品，但在某些情况下行为可能有所不同。

## 移除的废弃功能

### `Connection` 与 `DataSource`

`DataSource` 在 v0.3 中取代了 `Connection`，以更好地体现该类的抽象概念。为向后兼容，`Connection` 曾被保留为 `DataSource` 的别名，但现已移除。类似地，`ConnectionOptions` 现为 `DataSourceOptions`。

此外，`DataSource` 类中的旧方法名称也已删除，比如 `Connection.connect()` 现只有 `DataSource.initialize()`，`Connection.close()` 变为 `DataSource.destroy()` 等。

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

### `ConnectionManager`

`ConnectionManager` 类已被移除。如果您曾使用它管理多个连接，请直接创建和管理您的 `DataSource` 实例。

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

### `WhereExpression` 类型别名

已废弃的 `WhereExpression` 类型别名已被移除。请改用 `WhereExpressionBuilder`。

### `Repository.exist()`

已废弃的 `Repository.exist()` 方法已被移除。请改用 `exists()`，行为完全相同：

```typescript
// 之前
const hasUsers = await userRepository.exist({ where: { isActive: true } })

// 之后
const hasUsers = await userRepository.exists({ where: { isActive: true } })
```
