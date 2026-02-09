# 迁移到 v1

## 依赖

最低支持的 JavaScript 版本现在是 ES2023，这意味着支持 Node 20 及更高版本。如果您使用的平台不支持 ES2023，请升级。

TypeORM 需要更新版本的数据库客户端库。

Glob 模式现在由 `tinyglobby` 处理，替代了之前的 `glob`。虽然 `tinyglobby` 几乎是 `glob` 的直接替代品，但在某些情况下行为可能有所不同。

## MySQL / MariaDB

`connectorPackage` 选项已被移除，同时也移除了对旧版 `mysql` 客户端的支持。现在唯一支持的数据库客户端是 `mysql2`，TypeORM 将默认尝试加载它。如果您的项目中使用了 `mysql`，只需替换为 `mysql2` 即可。

## Expo

已移除对旧版 Expo SQLite 驱动的支持。旧版 API 在 Expo SDK v52 中被移除，因此您需要使用 Expo SDK v52 或更高版本，以及现代的异步 SQLite API。

## 哈希

历史上 TypeORM 使用了非标准的 SHA-1 实现来进行哈希运算。现已更改为使用 Node.js 内置的 `crypto` 模块。

对于浏览器环境，`RandomGenerator.sha1` 已修正为标准实现。