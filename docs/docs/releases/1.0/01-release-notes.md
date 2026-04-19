---
sidebar_label: 发布说明
---

# 发布说明 1.0

TypeORM 1.0 是一个重大版本，移除了长期弃用的 API，现代化了平台要求，并带来了在 0.3.x 周期中积累的数十个错误修复和新功能。

## 破坏性变更

> 有关详细的升级说明，请参阅 [升级指南](./02-upgrading-from-0.3.md)。

### 平台要求

- **要求 Node.js 20+** — 已移除对 Node.js 16 和 18 的支持，最低 JavaScript 目标版本现为 ES2023 ([#11382](https://github.com/typeorm/typeorm/pull/11382) by [@alumni](https://github.com/alumni))
- **移除 `Buffer` polyfill** — 现在在非 Node 平台上使用 `Uint8Array` 处理二进制数据；Node.js `Buffer`（继承自 `Uint8Array`）继续像以前一样工作 ([#11935](https://github.com/typeorm/typeorm/pull/11935) by [@pujux](https://github.com/pujux))
- **替换 Glob 库** — `glob` 已替换为 `tinyglobby`，`rimraf` 已被移除，减少了依赖项 ([#11699](https://github.com/typeorm/typeorm/pull/11699) by [@alumni](https://github.com/alumni))
- **哈希迁移至原生 `crypto`** — `sha.js` 和 `uuid` 包已被原生 `crypto` 模块和 `crypto.randomUUID()` 替代 ([#11864](https://github.com/typeorm/typeorm/pull/11864) by [@G0maa](https://github.com/G0maa), [#11769](https://github.com/typeorm/typeorm/pull/11769) by [@mag123c](https://github.com/mag123c))

### 驱动变更

- **MySQL / MariaDB：弃用 `mysql` 包** — 仅支持 `mysql2`；已移除 `connectorPackage` 选项 ([#11766](https://github.com/typeorm/typeorm/pull/11766) by [@pkuczynski](https://github.com/pkuczynski))
- **MySQL：`legacySpatialSupport` 默认值改为 `false`** — 默认使用标准的 `ST_GeomFromText`/`ST_AsText` 函数 ([#12083](https://github.com/typeorm/typeorm/pull/12083) by [@pkuczynski](https://github.com/pkuczynski))
- **MySQL：移除 `width` 和 `zerofill` 列选项** — 这些选项在 MySQL 8.0.17 中已被弃用，并在 MySQL 8.4 中移除 ([#12084](https://github.com/typeorm/typeorm/pull/12084) by [@pkuczynski](https://github.com/pkuczynski))
- **SQLite：弃用 `sqlite3`，`better-sqlite3` 成为默认驱动** — 不再支持 `sqlite3` 包；已移除 `flags` 和 `busyTimeout` 选项 ([#11836](https://github.com/typeorm/typeorm/pull/11836) by [@pkuczynski](https://github.com/pkuczynski))
- **MongoDB：要求驱动 v7+** — 已放弃对 MongoDB Node.js 驱动 v5/v6 的支持；移除 `stats()` 方法；移除已弃用的连接选项；不再导出内部类型 ([#12208](https://github.com/typeorm/typeorm/pull/12208) by [@naorpeled](https://github.com/naorpeled), [#12179](https://github.com/typeorm/typeorm/pull/12179) by [@pkuczynski](https://github.com/pkuczynski), [#12120](https://github.com/typeorm/typeorm/pull/12120) by [@pkuczynski](https://github.com/pkuczynski), [#12037](https://github.com/typeorm/typeorm/pull/12037) by [@alumni](https://github.com/alumni))
- **MS SQL Server：移除 `domain` 连接选项** — 请改用类型为 NTLM 的 `authentication` 选项 ([#12135](https://github.com/typeorm/typeorm/pull/12135) by [@pkuczynski](https://github.com/pkuczynski))
- **MS SQL Server：`options.isolation` 重命名为 `options.isolationLevel`** — 值格式从 `READ_COMMITTED` 更改为 `READ COMMITTED` 以匹配 `IsolationLevel` 类型；新增 `SNAPSHOT` 隔离级别 ([#12231](https://github.com/typeorm/typeorm/pull/12231) by [@Cprakhar](https://github.com/Cprakhar))
- **SAP HANA：移除已弃用的连接别名** — 已移除 `hanaClientDriver`、`pool.max`、`pool.requestTimeout`、`pool.idleTimeout` 等选项，请改用其现代等效选项 ([#12080](https://github.com/typeorm/typeorm/pull/12080) by [@gioboa](https://github.com/gioboa))
- **Expo：移除旧版驱动** — 已移除旧版 Expo SQLite 驱动；请使用 Expo SDK v52+ 及现代异步 API ([#11860](https://github.com/typeorm/typeorm/pull/11860) by [@G0maa](https://github.com/G0maa))
- **Redis：移除旧版客户端支持** — 查询结果缓存仅支持现代 Redis 客户端（v4+） ([#12057](https://github.com/typeorm/typeorm/pull/12057) by [@G0maa](https://github.com/G0maa))

### 移除的 API

- **`Connection` and `ConnectionOptions` removed** — 改用 `DataSource` 和 `DataSourceOptions` ([#12022](https://github.com/typeorm/typeorm/pull/12022) by [@alumni](https://github.com/alumni))
- **`.connection` 属性重命名为 `.dataSource`** — `Driver`、`QueryRunner`、`EntityManager`、`QueryBuilder`、`EntityMetadata` 以及所有 `*Event` 订阅器接口上的 `connection` 属性已重命名为 `dataSource`；提供了一个已弃用的 getter 作为桥接 ([#12244](https://github.com/typeorm/typeorm/pull/12244), [#12245](https://github.com/typeorm/typeorm/pull/12245), [#12246](https://github.com/typeorm/typeorm/pull/12246), [#12249](https://github.com/typeorm/typeorm/pull/12249) by [@pkuczynski](https://github.com/pkuczynski))
- **`ConnectionManager` 和全局便捷函数移除** — `createConnection`、`getConnection`、`getManager`、`getRepository`、`createQueryBuilder` 以及其他全局项已移除 ([#12098](https://github.com/typeorm/typeorm/pull/12098) by [@michaelbromley](https://github.com/michaelbromley))
- **`getMongoRepository` 和 `getMongoManager` 全局移除** — 改用 `dataSource.getMongoRepository()` 和 `dataSource.mongoManager` ([#12099](https://github.com/typeorm/typeorm/pull/12099) by [@pkuczynski](https://github.com/pkuczynski))
- **`DataSource.name` removed** — 在 v0.3 中已弃用命名连接；`ConnectionOptionsReader.all()` 重命名为 `get()` ([#12136](https://github.com/typeorm/typeorm/pull/12136) by [@pkuczynski](https://github.com/pkuczynski))
- **移除对 `TYPEORM_*` 环境变量的支持** — `ConnectionOptionsEnvReader`、`ormconfig.env` 和 `dotenv` 自动加载已移除 ([#12134](https://github.com/typeorm/typeorm/pull/12134) by [@pkuczynski](https://github.com/pkuczynski))
- **`findByIds` removed** — 改用 `findBy` 并搭配 `In` 操作符 ([#12114](https://github.com/typeorm/typeorm/pull/12114) by [@pkuczynski](https://github.com/pkuczynski))
- **`findOneById` removed** — 改用 `findOneBy` ([#12198](https://github.com/typeorm/typeorm/pull/12198) by [@pkuczynski](https://github.com/pkuczynski))
- **`Repository.exist()` removed** — 改用 `Repository.exists()` ([#12131](https://github.com/typeorm/typeorm/pull/12131) by [@pkuczynski](https://github.com/pkuczynski))
- **`AbstractRepository`、`@EntityRepository` 和 `getCustomRepository` removed** — 改用 `Repository.extend()` ([#12096](https://github.com/typeorm/typeorm/pull/12096) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `@RelationCount` 装饰器** — 请改用带子查询的 `@VirtualColumn` ([#12181](https://github.com/typeorm/typeorm/pull/12181) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 IoC 容器系统** — `useContainer()`、`getFromContainer()` 以及相关类型已移除 ([#12180](https://github.com/typeorm/typeorm/pull/12180) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `readonly` 列选项** — 改用 `update: false` ([#12132](https://github.com/typeorm/typeorm/pull/12132) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `ColumnNumericOptions` 上的 `unsigned`** — 仅影响 decimal/float 类型；整数的 `unsigned` 保持不变 ([#12133](https://github.com/typeorm/typeorm/pull/12133) by [@pkuczynski](https://github.com/pkuczynski))
- **QueryBuilder：移除 `onConflict()`、弃用的 `orUpdate()` 重载，以及 `setNativeParameters()`** — 改用 `orIgnore()`/`orUpdate()` 的数组签名，并使用 `setParameters()` ([#12090](https://github.com/typeorm/typeorm/pull/12090) by [@pkuczynski](https://github.com/pkuczynski))
- **QueryBuilder：移除 `printSql()`** — 由于所有已执行的查询都会通过已配置的 logger 记录，因此它是多余的；如需检查 SQL，请使用 `getSql()` 或 `getQueryAndParameters()` ([#12151](https://github.com/typeorm/typeorm/pull/12151) by [@naorpeled](https://github.com/naorpeled), [#12220](https://github.com/typeorm/typeorm/pull/12220) by [@pkuczynski](https://github.com/pkuczynski))
- **QueryBuilder：移除 `WhereExpression` 类型别名** — 改用 `WhereExpressionBuilder` ([#12097](https://github.com/typeorm/typeorm/pull/12097) by [@pkuczynski](https://github.com/pkuczynski))
- **QueryBuilder：移除 `replacePropertyNames()`** — 它是一个空操作（no-op） ([#12178](https://github.com/typeorm/typeorm/pull/12178) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `join` 查找选项** — 对于 LEFT JOIN 使用 `relations`，对于其他 join 类型请使用 QueryBuilder ([#12188](https://github.com/typeorm/typeorm/pull/12188) by [@pkuczynski](https://github.com/pkuczynski))
- **移除基于字符串的 `select`** — 请改用对象语法 `select: { id: true }`，而不是 `select: ["id"]` ([#12214](https://github.com/typeorm/typeorm/pull/12214) by [@pkuczynski](https://github.com/pkuczynski))
- **移除基于字符串的 `relations`** — 请改用对象语法 `relations: { profile: true }`，而不是 `relations: ["profile"]` ([#12215](https://github.com/typeorm/typeorm/pull/12215) by [@pkuczynski](https://github.com/pkuczynski))
- **移除已弃用的锁模式** — `pessimistic_partial_write` 和 `pessimistic_write_or_fail` 已被 `pessimistic_write`（并配合 `onLocked` 选项）替代 ([#12093](https://github.com/typeorm/typeorm/pull/12093) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `QueryRunner.loadedTables` 和 `loadedViews`** — 改用 `getTables()` 和 `getViews()` ([#12183](https://github.com/typeorm/typeorm/pull/12183) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `MigrationExecutor.getAllMigrations()`** — 改用 `getPendingMigrations()`、`getExecutedMigrations()` 或 `dataSource.migrations` ([#12142](https://github.com/typeorm/typeorm/pull/12142) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `EntityMetadata.createPropertyPath()` 静态方法** — 内部工具，没有公开的替代方案 ([#12141](https://github.com/typeorm/typeorm/pull/12141) by [@pkuczynski](https://github.com/pkuczynski))
- **从驱动和查询构建器中移除内部 `nativeParameters` 相关管道** ([#12104](https://github.com/typeorm/typeorm/pull/12104) by [@pkuczynski](https://github.com/pkuczynski))
- **从 Broadcaster 中移除内部 `broadcastLoadEventsForAll()`** ([#12137](https://github.com/typeorm/typeorm/pull/12137) by [@pkuczynski](https://github.com/pkuczynski))
- **移除内部 `DriverUtils.buildColumnAlias()`** — 改用 `buildAlias()` ([#12138](https://github.com/typeorm/typeorm/pull/12138) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `RdbmsSchemaBuilder.renameTables()`** — 一个空的 no-op 方法，且从未被调用 ([#12284](https://github.com/typeorm/typeorm/pull/12284) by [@naorpeled](https://github.com/naorpeled))
- **移除 `EntityMetadata.getValueMap()` 的 `options` 参数** — `skipNulls` 选项从未生效；移除第三个参数 ([#12303](https://github.com/typeorm/typeorm/pull/12303) by [@naorpeled](https://github.com/naorpeled))

### 行为变更

- **现在不可为空的关系使用 INNER JOIN** — 对于标记为 `nullable: false` 的 `ManyToOne` 以及拥有方 `OneToOne` 关系，改用 `INNER JOIN` 而不是 `LEFT JOIN`，这可能会排除具有孤立外键（orphaned foreign keys）的行 ([#12064](https://github.com/typeorm/typeorm/pull/12064) by [@pkuczynski](https://github.com/pkuczynski))
- **`invalidWhereValuesBehavior` 默认值为 `throw`** — 在 where 条件中传入 `null` 或 `undefined` 现在会抛出错误，而不是静默忽略该属性；若要匹配 null，请使用 `IsNull()` ([#11710](https://github.com/typeorm/typeorm/pull/11710) by [@naorpeled](https://github.com/naorpeled))
- **`invalidWhereValuesBehavior` 仅影响高级 API** — QueryBuilder 的 `.where()`、`.andWhere()`、`.orWhere()` 不再受此设置影响 ([#11878](https://github.com/typeorm/typeorm/pull/11878) by [@naorpeled](https://github.com/naorpeled))
- **`ConnectionOptionsReader` 和 `FileLogger` 路径从 `process.cwd()` 解析** — `ConnectionOptionsReader` 不再使用 `app-root-path` 来定位 `ormconfig` 文件；改为搜索 `process.cwd()`。如需覆盖，请在构造函数中传入 `{ root: "/custom/path" }`。`FileLogger.logPath` 也同样从 `process.cwd()` 解析 — 当应用不是从其根目录启动时，请使用绝对路径 ([#12257](https://github.com/typeorm/typeorm/pull/12257) by [@alumni](https://github.com/alumni))

## 新功能

### 查询构建器

- **`INSERT INTO ... SELECT FROM ...`** — `InsertQueryBuilder` 新增 `valuesFromSelect()` 方法，用于数据迁移和转换查询 ([#11896](https://github.com/typeorm/typeorm/pull/11896) by [@Cprakhar](https://github.com/Cprakhar))
- **update/upsert 的 `returning` 选项** — 仓库和实体管理器的 `update()` 和 `upsert()` 方法现在在支持 `RETURNING` 子句的数据库上支持 `returning` 选项 ([#11782](https://github.com/typeorm/typeorm/pull/11782) by [@naorpeled](https://github.com/naorpeled))
- **所有 drop 方法的 `ifExists` 参数** — `dropColumn`、`dropIndex`、`dropPrimaryKey`、`dropForeignKey`、`dropUniqueConstraint`、`dropCheckConstraint`、`dropExclusionConstraint` 及其复数变体现在接受 `ifExists` 标志 ([#12121](https://github.com/typeorm/typeorm/pull/12121) by [@pkuczynski](https://github.com/pkuczynski))
- **`QueryRunner` 的显式资源管理** — 支持 `await using` 语法（TypeScript 5.2+）实现自动清理 ([#11701](https://github.com/typeorm/typeorm/pull/11701) by [@alumni](https://github.com/alumni))

### Transactions

- **所有驱动的 DataSource 级默认隔离级别** — `DataSourceOptions.isolationLevel` 现在会被每一个支持事务的驱动所遵从，而不仅仅是 SQL Server。通过 DataSource 启动的事务（显式或隐式用于 DML）默认使用该级别 ([#12269](https://github.com/typeorm/typeorm/pull/12269) by [@pkuczynski](https://github.com/pkuczynski))
- **Aurora Postgres：事务隔离级别支持** — Aurora Postgres 现在会遵从 `isolationLevel` 选项，无论是在 DataSource 上还是在显式调用 `startTransaction()` 时 ([#12334](https://github.com/typeorm/typeorm/pull/12334) by [@pkuczynski](https://github.com/pkuczynski))
- **Spanner：事务隔离级别支持** — Google Spanner 现在会遵从 `isolationLevel` 选项。Spanner 的 `supportedIsolationLevels` 仅限于 `REPEATABLE READ`（目前为预览）和 `SERIALIZABLE` ([#12335](https://github.com/typeorm/typeorm/pull/12335) by [@pkuczynski](https://github.com/pkuczynski))

### Drivers

- **PostgreSQL：枚举变更的 `ADD VALUE`** — 在添加新的枚举值时，TypeORM 在可能的情况下会使用更简单的 `ALTER TYPE ... ADD VALUE` 语法，而不是 4 步的重命名-创建-迁移-删除方案 ([#10956](https://github.com/typeorm/typeorm/pull/10956) by [@janzipek](https://github.com/janzipek))
- **PostgreSQL：额外扩展** — 新增 `installExtensions` 选项，用于在连接初始化期间安装额外的 PostgreSQL 扩展 ([#11888](https://github.com/typeorm/typeorm/pull/11888) by [@Cprakhar](https://github.com/Cprakhar))
- **PostgreSQL：部分索引支持** — 增加对 PostgreSQL 部分索引的支持 ([#11318](https://github.com/typeorm/typeorm/pull/11318) by [@freePixel](https://github.com/freePixel))
- **SAP HANA：在 SELECT 中加锁** — `FOR UPDATE` 以及其他锁模式现在在 SAP HANA 查询中得到支持 ([#11996](https://github.com/typeorm/typeorm/pull/11996) by [@alumni](https://github.com/alumni))
- **SAP HANA：表注释** — `@Entity({ comment: "..." })` 现在可在 SAP HANA 上工作 ([#11939](https://github.com/typeorm/typeorm/pull/11939) by [@Cprakhar](https://github.com/Cprakhar))
- **SAP HANA：连接池超时** — 新增 `maxWaitTimeoutIfPoolExhausted` 连接池选项 ([#11868](https://github.com/typeorm/typeorm/pull/11868) by [@alumni](https://github.com/alumni))
- **SQLite：`jsonb` 列类型** — SQLite 现在支持 `jsonb` 列类型 ([#11933](https://github.com/typeorm/typeorm/pull/11933) by [@Cprakhar](https://github.com/Cprakhar))
- **MongoDB：基于对象的 `select` 投影** — `find*()` 方法现在除了现有的字符串数组形式外，还接受其他驱动使用的相同对象形式 `select` 语法（`select: { id: true, name: true }`） ([#12237](https://github.com/typeorm/typeorm/pull/12237) by [@pkuczynski](https://github.com/pkuczynski))
- **React Native：加密密钥** — 为 React Native SQLite 数据库新增用于传递加密密钥的选项 ([#11736](https://github.com/typeorm/typeorm/pull/11736) by [@HtSpChakradharCholleti](https://github.com/HtSpChakradharCholleti))

### 持久化与插入更新

- **`clear()` 中的级联截断** — `Repository.clear()` 和 `EntityManager.clear()` 现在接受 `{ cascade: true }` 以在 PostgreSQL、CockroachDB 和 Oracle 上执行 `TRUNCATE ... CASCADE` ([#11866](https://github.com/typeorm/typeorm/pull/11866) by [@Cprakhar](https://github.com/Cprakhar))
- **`increment`/`decrement` 的更好的类型** — 条件参数现在使用正确的实体感知类型，而非 `any` ([#11294](https://github.com/typeorm/typeorm/pull/11294) by [@OSA413](https://github.com/OSA413))

### 列类型与装饰器

- **`@Exclusion` 上的可延迟支持** — 与 `@Unique` 和 `@Index` 上现有的可延迟支持相对应 ([#11802](https://github.com/typeorm/typeorm/pull/11802) by [@oGAD31](https://github.com/oGAD31))

### 其他

- **v1 迁移的自动化 codemod** — 新增 `@typeorm/codemod` 包，可自动处理大部分破坏性变更：运行 `npx @typeorm/codemod v1 src/` 即可更新导入、API 重命名、find 选项语法等 ([#12233](https://github.com/typeorm/typeorm/pull/12233) by [@pkuczynski](https://github.com/pkuczynski))
- **改进的 ormconfig 错误处理** — 加载失败现在会记录警告日志，而不是静默失败 ([#11871](https://github.com/typeorm/typeorm/pull/11871) by [@Cprakhar](https://github.com/Cprakhar))

## Bug 修复

### 查询生成

- **Column alias properly escaped in `orderBy`** — 防止当别名名称与保留字冲突时产生 SQL 错误 ([#12027](https://github.com/typeorm/typeorm/pull/12027) by [@Cprakhar](https://github.com/Cprakhar))
- **`addOrderBy` 解析数据库列名** — 使用数据库列名（例如 `created_at`）而不是属性名现在可以正常工作 ([#11904](https://github.com/typeorm/typeorm/pull/11904) by [@smith-xyz](https://github.com/smith-xyz))
- **Order 子查询列解析** — 修复在按子查询列进行排序时出现 “Cannot get metadata for given alias” 错误 ([#11343](https://github.com/typeorm/typeorm/pull/11343) by [@trannhan0810](https://github.com/trannhan0810))
- **`select` 列排序得以保留** — `getQuery()`/`getSql()` 现在会以通过 `select()` 和 `addSelect()` 添加的顺序返回列 ([#11902](https://github.com/typeorm/typeorm/pull/11902) by [@Cprakhar](https://github.com/Cprakhar))
- **`.update()` 查询生成已修复** — 修正使用 QueryBuilder `.update()` 时生成了错误的 SQL ([#11993](https://github.com/typeorm/typeorm/pull/11993) by [@gioboa](https://github.com/gioboa))
- **带表别名的 Upsert SQL 生成** — 修复对具有表继承和自定义 schema 的 upsert 查询中错误的列引用 ([#11915](https://github.com/typeorm/typeorm/pull/11915) by [@Cprakhar](https://github.com/Cprakhar))
- **带连接的 Limit** — 修复在使用带连接的 `skip`/`take` 分页时出现不正确结果的问题 ([#11987](https://github.com/typeorm/typeorm/pull/11987) by [@gioboa](https://github.com/gioboa))
- **方括号内的 Join 属性** — 当条件中包含方括号时，修复了 join 解析问题 ([#11218](https://github.com/typeorm/typeorm/pull/11218) by [@balkrushna](https://github.com/balkrushna))
- **禁用聚合函数的全局 `ORDER BY`** — `repo.max()`、`repo.min()` 等现在不再在带 `ORDER BY` 子句时生成无效 SQL ([#11925](https://github.com/typeorm/typeorm/pull/11925) by [@Cprakhar](https://github.com/Cprakhar))
- **分页子查询包含已连接实体的 PK** — 使用 `leftJoin` 搭配 `skip`/`take` 现在会正确加载关联实体 ([#11669](https://github.com/typeorm/typeorm/pull/11669) by [@mag123c](https://github.com/mag123c))
- **驼峰命名的别名缩短** — `shorten` 方法现在能正确处理 `camelCase_aliases` ([#11283](https://github.com/typeorm/typeorm/pull/11283) by [@OSA413](https://github.com/OSA413))
- **`QueryBuilder.update()` 的实体类型** — `update(partialEntity)` 签名现在使用了正确的实体感知类型，而不是松散的对象类型 ([#11296](https://github.com/typeorm/typeorm/pull/11296) by [@OSA413](https://github.com/OSA413))
- **记录查询的空白处理** — 日志中的查询字符串不再包含尾部和头部的空白字符 ([#12047](https://github.com/typeorm/typeorm/pull/12047) by [@Cprakhar](https://github.com/Cprakhar))

### 关系与贪婪加载

- **非可空 FK 的孤儿一对多子项现在会被删除** — 当保存一个带级联的一对多关系并替换子项时，具有非可空 FK 的孤儿行现在会被删除，而不是因约束违规而失败；可空 FK 行仍如之前一样被置为 null ([#11982](https://github.com/typeorm/typeorm/pull/11982) by [@naorpeled](https://github.com/naorpeled))
- **急加载关系现在会尊重 `relationLoadStrategy: "query"`** — 当设置 `"query"` 策略时，急加载关系通过独立查询加载，而不是始终使用 JOIN ([#11326](https://github.com/typeorm/typeorm/pull/11326) by [@SharkSharp](https://github.com/SharkSharp), [#12256](https://github.com/typeorm/typeorm/pull/12256) by [@pkuczynski](https://github.com/pkuczynski))
- **自引用关系别名冲突** — 当 `relationLoadStrategy: "query"` 用于自引用关系时，不再因别名冲突产生错误 SQL ([#11066](https://github.com/typeorm/typeorm/pull/11066) by [@campmarc](https://github.com/campmarc))
- **急加载关系不再重复 JOIN** — 在 `relations` 中显式指定急加载关系不再导致重复的 JOIN ([#11991](https://github.com/typeorm/typeorm/pull/11991) by [@veeceey](https://github.com/veeceey))
- **带急加载关系的保存** — 修复当实体具有急加载关系时保存失败的问题 ([#11975](https://github.com/typeorm/typeorm/pull/11975) by [@gioboa](https://github.com/gioboa))
- **`select: false` 的列不再被返回** — 标记为 `select: false` 的列现在会正确地从查询结果中排除 ([#11944](https://github.com/typeorm/typeorm/pull/11944) by [@gioboa](https://github.com/gioboa))
- **使用 `joinMapOne` 方法的子查询** — 修复使用 join map 方法时的错误行为 ([#11943](https://github.com/typeorm/typeorm/pull/11943) by [@gioboa](https://github.com/gioboa))
- **嵌套嵌入实体中的 Relation IDs** — 当在嵌入实体中映射 relation ids 时，修复 `TypeError: Cannot set properties of undefined` ([#11942](https://github.com/typeorm/typeorm/pull/11942) by [@Cprakhar](https://github.com/Cprakhar))
- **`RelationIdLoader` 的别名处理** — 使用 `DriverUtils.getAlias` 以防止具有较短标识符限制的数据库进行别名截断 ([#11228](https://github.com/typeorm/typeorm/pull/11228) by [@te1](https://github.com/te1))
- **`createPropertyPath` 中的 `*-to-many`** — 移除了阻止某些关系配置的错误处理 ([#11119](https://github.com/typeorm/typeorm/pull/11119) by [@ThbltLmr](https://github.com/ThbltLmr))
- **复合主键上的 `OneToMany` 级联删除** — 当目标具有复合 PK 时，`cascade: ["remove"]` 现在会正确地将删除操作传播到子实体；之前 `CascadesSubjectBuilder` 从未将这些子实体标记为 `mustBeRemoved`，从而导致 FK 约束违规 ([#12286](https://github.com/typeorm/typeorm/pull/12286) by [@pkuczynski](https://github.com/pkuczynski))
- **用于多对多恢复时将 `withDeleted` 传播给 relation-id loader** — 使用多对多关系恢复已软删除的实体时，不再尝试重新插入已有的连接表行；当父查询设置了 `withDeleted` 时，`RelationIdLoader` 现在会包含软删除的实体 ([#12287](https://github.com/typeorm/typeorm/pull/12287) by [@pkuczynski](https://github.com/pkuczynski))

### 持久化

- **`update: false` 或 `generatedType` 的 upsert** — upsert 现在能正确处理那些不应更新的列 ([#12030](https://github.com/typeorm/typeorm/pull/12030) by [@gioboa](https://github.com/gioboa))
- **对 `FindOperator` 应用值转换器** — `ApplyValueTransformers` 现在会正确转换 `FindOperator` 实例内部的值，例如 `In`、`Between` 等 ([#11172](https://github.com/typeorm/typeorm/pull/11172) by [@ZimGil](https://github.com/ZimGil))
- **软删除不再更新已软删除的行** — `softDelete` 和 `softRemove` 现在会跳过已经软删除的行 ([#10705](https://github.com/typeorm/typeorm/pull/10705) by [@hassanmehdi98](https://github.com/hassanmehdi98))
- **实体合并尊重 `null` 值** — 合并到实体时不再静默丢弃 `null` 属性值 ([#11154](https://github.com/typeorm/typeorm/pull/11154) by [@knoid](https://github.com/knoid))
- **Map/对象比较** — 修复 Map 和普通对象列值的错误变更检测 ([#10990](https://github.com/typeorm/typeorm/pull/10990) by [@mgohin](https://github.com/mgohin))
- **日期转换器变更检测** — 修复带日期值转换器时的错误阳性脏数据检测 ([#11963](https://github.com/typeorm/typeorm/pull/11963) by [@gioboa](https://github.com/gioboa))
- **子 mpath 更新** — 当重新挂载树形实体的父项时，即使父项是软删除的，tree entity 的 mpath 也会被正确更新 ([#10844](https://github.com/typeorm/typeorm/pull/10844) by [@JoseCToscano](https://github.com/JoseCToscano))
- **Closure 连接表的 schema/database 传播** — schema 和 database 设置现在会被正确传播到 closure 连接表 ([#12110](https://github.com/typeorm/typeorm/pull/12110) by [@pkuczynski](https://github.com/pkuczynski))
- **schema builder 中对虚拟属性的处理** — schema builder 不再尝试为虚拟属性创建列 ([#11000](https://github.com/typeorm/typeorm/pull/11000) by [@skyran1278](https://github.com/skyran1278))
- **未命名的 `TableForeignKey` 删除** — 删除未显式指定名称的外键不再失败 ([#10744](https://github.com/typeorm/typeorm/pull/10744) by [@taichunmin](https://github.com/taichunmin))
- **`getPendingMigrations` 不再创建迁移表** — 检查待执行迁移不再产生副作用 ([#11672](https://github.com/typeorm/typeorm/pull/11672) by [@pkuczynski](https://github.com/pkuczynski))
- **多对多 `deferrable` 外键** — `@ManyToMany` 现在会在连接表的外键上遵从 `deferrable` 选项 ([#11924](https://github.com/typeorm/typeorm/pull/11924) by [@smith-xyz](https://github.com/smith-xyz))
- **复合外键列顺序** — schema builder 会对复合外键中被引用的列进行排序，以匹配被引用的主键索引顺序，从而避免 MySQL / MSSQL / SAP HANA 拒绝约束 ([#12280](https://github.com/typeorm/typeorm/pull/12280) by [@pkuczynski](https://github.com/pkuczynski))

### 驱动特定修复

- **PostgreSQL：`timestamptz` 持久化/填充** — `timestamp with time zone` 列现在能正确持久化和填充 ([#11774](https://github.com/typeorm/typeorm/pull/11774) by [@Minishlink](https://github.com/Minishlink))
- **PostgreSQL：几何类型重新保存** — 在持久化时会对 point/circle 值进行规范化，以避免重新保存填充对象时出现无效输入错误 ([#11857](https://github.com/typeorm/typeorm/pull/11857) by [@Cprakhar](https://github.com/Cprakhar))
- **PostgreSQL/CockroachDB：带引号的表名** — 修复了对名称中包含特殊字符的表的处理问题 ([#10993](https://github.com/typeorm/typeorm/pull/10993) by [@iskalyakin](https://github.com/iskalyakin))
- **PostgreSQL：顺序查询执行** — 现在在同一连接上顺序执行查询，以避免 `pg` 8.19.0 弃用警告 ([#12105](https://github.com/typeorm/typeorm/pull/12105) by [@pkuczynski](https://github.com/pkuczynski))
- **MySQL：PolarDB-X 2.0 版本检测** — `getVersion()` 不再为 PolarDB-X 2.0 返回 `undefined` ([#11837](https://github.com/typeorm/typeorm/pull/11837) by [@Missna](https://github.com/Missna))
- **MongoDB：`ObjectIdColumn` 属性名转换** — `findOneBy({ id: value })` 现在能正确转换为 MongoDB 查询中的 `_id` ([#12200](https://github.com/typeorm/typeorm/pull/12200) by [@pkuczynski](https://github.com/pkuczynski))
- **MongoDB：嵌套文档中的嵌入数组** — 正确处理嵌套文档结构中的嵌入数组 ([#10940](https://github.com/typeorm/typeorm/pull/10940) by [@mciuchitu](https://github.com/mciuchitu))
- **SQLite：simple-enum 数组** — 带 `array: true` 的 `simple-enum` 列不再因 CHECK 约束错误而失败 ([#11865](https://github.com/typeorm/typeorm/pull/11865) by [@Cprakhar](https://github.com/Cprakhar))
- **SAP HANA：`Date` 参数转义** — JS `Date` 值现在作为查询参数传递，而不是嵌入到 SQL 字符串中 ([#11867](https://github.com/typeorm/typeorm/pull/11867) by [@alumni](https://github.com/alumni))
- **CockroachDB：事务重试中的结构化查询结果** — `useStructuredResult` 标志现在在 CockroachDB 事务重试回放期间得以保留 ([#11861](https://github.com/typeorm/typeorm/pull/11861) by [@naorpeled](https://github.com/naorpeled))
- **Cordova：查询受影响行数** — 查询结果现在包含受影响行的计数 ([#10873](https://github.com/typeorm/typeorm/pull/10873) by [@jacobg](https://github.com/jacobg))

### 其他

- **CLI `init` 命令** — 当 `package.json` 不存在时不再崩溃 ([#11947](https://github.com/typeorm/typeorm/pull/11947) by [@gioboa](https://github.com/gioboa))；发布的包现在正确包含了脚手架所需的 `devDependencies` ([#12281](https://github.com/typeorm/typeorm/pull/12281) by [@pkuczynski](https://github.com/pkuczynski))
- **Deno `process` 导入** — 修复了 Deno 上 `process` 依赖的错误导入问题 ([#11248](https://github.com/typeorm/typeorm/pull/11248) by [@yohannpoli](https://github.com/yohannpoli))

## 安全修复

- **防止 SQL 注入** — 现在在所有驱动中用于模式自省（schema introspection）和 DDL 方法的查询都使用参数化查询与转义标识符，从而防止通过数据库/模式/表/列名进行 SQL 注入（[#12207](https://github.com/typeorm/typeorm/pull/12207) 由 [@pkuczynski](https://github.com/pkuczynski)、[#12197](https://github.com/typeorm/typeorm/pull/12197) 由 [@pkuczynski](https://github.com/pkuczynski)、[#12185](https://github.com/typeorm/typeorm/pull/12185) 由 [@pkuczynski](https://github.com/pkuczynski)）
- **OrderBy 条件校验** — QueryBuilder 的 `orderBy` 和 `addOrderBy` 现在会在运行时验证条件值，防止通过 order 表达式注入（[#12217](https://github.com/typeorm/typeorm/pull/12217) 由 [@pkuczynski](https://github.com/pkuczynski)）
- **QueryBuilder 在原始 SQL 片段中拒绝分号** — `select`、`addSelect`、`groupBy`、`addGroupBy`、`orderBy` 和 `addOrderBy` 现在当字符串参数包含 `;` 时会抛出异常，从而防止通过这些入口点进行语句堆叠注入（[#12209](https://github.com/typeorm/typeorm/pull/12209) 由 [@pkuczynski](https://github.com/pkuczynski)）

## 性能改进

- **PostgreSQL / CockroachDB：`clearDatabase()` 中的批量 DROP** — 将单独的 DROP 语句合并为单个批量查询，显著减少测试设置期间的往返次数（[#12164](https://github.com/typeorm/typeorm/pull/12164), [#12159](https://github.com/typeorm/typeorm/pull/12159) 由 [@pkuczynski](https://github.com/pkuczynski) 贡献）

<!-- Built against e085e4c67 -->
