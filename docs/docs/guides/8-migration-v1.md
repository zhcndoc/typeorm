# 迁移到 v1

This is the migration guide for upgrading from version `0.3.x` to `1.0`.

## JavaScript 和 Node.js 版本

最低支持的 JavaScript 版本现在是 `ES2023`，这意味着支持 Node 20 及更高版本。如果您使用的平台不支持 `ES2023`，请升级。

## 数据库客户端库

TypeORM 需要更新版本的数据库客户端库。

## MySQL / MariaDB

`connectorPackage` 选项已被移除，同时也移除了对旧版 `mysql` 客户端的支持。现在唯一支持的数据库客户端是 `mysql2`，TypeORM 将默认尝试加载它。如果您的项目中使用了 `mysql`，只需替换为 `mysql2` 即可。

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
