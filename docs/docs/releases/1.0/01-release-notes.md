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

- **MySQL / MariaDB: `mysql` package dropped** — 仅支持 `mysql2`；`connectorPackage` 选项已被移除 ([#11766](https://github.com/typeorm/typeorm/pull/11766) by [@pkuczynski](https://github.com/pkuczynski))
- **MySQL: `legacySpatialSupport` now defaults to `false`** — 默认使用标准的 `ST_GeomFromText`/`ST_AsText` 函数 ([#12083](https://github.com/typeorm/typeorm/pull/12083) by [@pkuczynski](https://github.com/pkuczynski))
- **MySQL: `width` and `zerofill` column options removed** — 这些选项在 MySQL 8.0.17 中已弃用，并在 MySQL 8.4 中被移除 ([#12084](https://github.com/typeorm/typeorm/pull/12084) by [@pkuczynski](https://github.com/pkuczynski))
- **MySQL: `QueryBuilder.useIndex()` accepts index name(s), not raw SQL** — `useIndex()` 现在接受单个索引名或索引名数组，并将其作为标识符进行转义。此前该参数会被插值为原始的、逗号分隔的 SQL 片段，这可能导致标识符注入 ([#12344](https://github.com/typeorm/typeorm/pull/12344) by [@eddieran](https://github.com/eddieran))
- **SQLite: `sqlite3` dropped, `better-sqlite3` is the default** — 不再支持 `sqlite3` 包；`flags` 和 `busyTimeout` 选项已被移除 ([#11836](https://github.com/typeorm/typeorm/pull/11836) by [@pkuczynski](https://github.com/pkuczynski))
- **MongoDB: driver v7+ required** — 已停止支持 MongoDB Node.js 驱动 v5/v6；`stats()` 方法已移除；已弃用的连接选项已移除；内部类型不再导出 ([#12208](https://github.com/typeorm/typeorm/pull/12208) by [@naorpeled](https://github.com/naorpeled), [#12179](https://github.com/typeorm/typeorm/pull/12179) by [@pkuczynski](https://github.com/pkuczynski), [#12120](https://github.com/typeorm/typeorm/pull/12120) by [@pkuczynski](https://github.com/pkuczynski), [#12037](https://github.com/typeorm/typeorm/pull/12037) by [@alumni](https://github.com/alumni))
- **MS SQL Server: `domain` connection option removed** — 改为使用带 NTLM 类型的 `authentication` ([#12135](https://github.com/typeorm/typeorm/pull/12135) by [@pkuczynski](https://github.com/pkuczynski))
- **MS SQL Server: `options.isolation` renamed to `options.isolationLevel`** — 值格式从 `READ_COMMITTED` 改为 `READ COMMITTED`，以匹配 `IsolationLevel` 类型；新增 `SNAPSHOT` 隔离级别 ([#12231](https://github.com/typeorm/typeorm/pull/12231) by [@Cprakhar](https://github.com/Cprakhar))
- **SAP HANA: deprecated connection aliases removed** — `hanaClientDriver`、`pool.max`、`pool.requestTimeout`、`pool.idleTimeout` 等已被移除，改用其现代等价项 ([#12080](https://github.com/typeorm/typeorm/pull/12080) by [@gioboa](https://github.com/gioboa))
- **Expo: legacy driver removed** — 旧版 Expo SQLite 驱动已被移除；请使用 Expo SDK v52+ 和现代异步 API ([#11860](https://github.com/typeorm/typeorm/pull/11860) by [@G0maa](https://github.com/G0maa))
- **Redis: legacy client support removed** — 查询结果缓存仅支持现代 Redis 客户端（v4+） ([#12057](https://github.com/typeorm/typeorm/pull/12057) by [@G0maa](https://github.com/G0maa))

### 移除的 API

- **`Connection` and `ConnectionOptions` removed** — 改为使用 `DataSource` 和 `DataSourceOptions` ([#12022](https://github.com/typeorm/typeorm/pull/12022) by [@alumni](https://github.com/alumni))
- **`.connection` property renamed to `.dataSource`** — `Driver`、`QueryRunner`、`EntityManager`、`QueryBuilder`、`EntityMetadata` 以及所有 `*Event` 订阅者接口上的 `connection` 属性已重命名为 `dataSource`；提供了一个已弃用的 getter 作为过渡 ([#12244](https://github.com/typeorm/typeorm/pull/12244), [#12245](https://github.com/typeorm/typeorm/pull/12245), [#12246](https://github.com/typeorm/typeorm/pull/12246), [#12249](https://github.com/typeorm/typeorm/pull/12249) by [@pkuczynski](https://github.com/pkuczynski))
- **`ConnectionManager` and global convenience functions removed** — `createConnection`、`getConnection`、`getManager`、`getRepository`、`createQueryBuilder` 以及其他全局函数已被移除 ([#12098](https://github.com/typeorm/typeorm/pull/12098) by [@michaelbromley](https://github.com/michaelbromley))
- **`getMongoRepository` and `getMongoManager` globals removed** — 改为使用 `dataSource.getMongoRepository()` 和 `dataSource.mongoManager` ([#12099](https://github.com/typeorm/typeorm/pull/12099) by [@pkuczynski](https://github.com/pkuczynski))
- **`DataSource.name` removed** — 命名连接在 v0.3 中已弃用；`ConnectionOptionsReader.all()` 已重命名为 `get()` ([#12136](https://github.com/typeorm/typeorm/pull/12136) by [@pkuczynski](https://github.com/pkuczynski))
- **`TYPEORM_*` environment variable support removed** — `ConnectionOptionsEnvReader`、`ormconfig.env` 和 `dotenv` 自动加载已被移除 ([#12134](https://github.com/typeorm/typeorm/pull/12134) by [@pkuczynski](https://github.com/pkuczynski))
- **`findByIds` removed** — 改为使用带 `In` 操作符的 `findBy` ([#12114](https://github.com/typeorm/typeorm/pull/12114) by [@pkuczynski](https://github.com/pkuczynski))
- **`findOneById` removed** — 改为使用 `findOneBy` ([#12198](https://github.com/typeorm/typeorm/pull/12198) by [@pkuczynski](https://github.com/pkuczynski))
- **`Repository.exist()` removed** — 改为使用 `Repository.exists()` ([#12131](https://github.com/typeorm/typeorm/pull/12131) by [@pkuczynski](https://github.com/pkuczynski))
- **`AbstractRepository`, `@EntityRepository`, and `getCustomRepository` removed** — 改为使用 `Repository.extend()` ([#12096](https://github.com/typeorm/typeorm/pull/12096) by [@pkuczynski](https://github.com/pkuczynski))
- **`@RelationCount` decorator removed** — 改为使用带子查询的 `@VirtualColumn` ([#12181](https://github.com/typeorm/typeorm/pull/12181) by [@pkuczynski](https://github.com/pkuczynski))
- **IoC container system removed** — `useContainer()`、`getFromContainer()` 及相关类型已被移除 ([#12180](https://github.com/typeorm/typeorm/pull/12180) by [@pkuczynski](https://github.com/pkuczynski))
- **`readonly` column option removed** — 改为使用 `update: false` ([#12132](https://github.com/typeorm/typeorm/pull/12132) by [@pkuczynski](https://github.com/pkuczynski))
- **`unsigned` on `ColumnNumericOptions` removed** — 仅影响 decimal/float 类型；整数类型的 `unsigned` 不受影响 ([#12133](https://github.com/typeorm/typeorm/pull/12133) by [@pkuczynski](https://github.com/pkuczynski))
- **QueryBuilder: `onConflict()`, deprecated `orUpdate()` overload, and `setNativeParameters()` removed** — 改为使用 `orIgnore()`/`orUpdate()` 数组签名和 `setParameters()` ([#12090](https://github.com/typeorm/typeorm/pull/12090) by [@pkuczynski](https://github.com/pkuczynski))
- **QueryBuilder: `printSql()` removed** — 由于所有执行的查询都已通过配置的 logger 记录，因此它已变得多余；如需查看 SQL，请改用 `getSql()` 或 `getQueryAndParameters()` ([#12151](https://github.com/typeorm/typeorm/pull/12151) by [@naorpeled](https://github.com/naorpeled), [#12220](https://github.com/typeorm/typeorm/pull/12220) by [@pkuczynski](https://github.com/pkuczynski))
- **QueryBuilder: `WhereExpression` type alias removed** — 改为使用 `WhereExpressionBuilder` ([#12097](https://github.com/typeorm/typeorm/pull/12097) by [@pkuczynski](https://github.com/pkuczynski))
- **QueryBuilder: `replacePropertyNames()` removed** — 它实际上是一个空操作 ([#12178](https://github.com/typeorm/typeorm/pull/12178) by [@pkuczynski](https://github.com/pkuczynski))
- **`join` find option removed** — 左连接请使用 `relations`，其他连接类型请使用 QueryBuilder ([#12188](https://github.com/typeorm/typeorm/pull/12188) by [@pkuczynski](https://github.com/pkuczynski))
- **String-based `select` removed** — 请使用对象语法 `select: { id: true }`，而不是 `select: ["id"]` ([#12214](https://github.com/typeorm/typeorm/pull/12214) by [@pkuczynski](https://github.com/pkuczynski))
- **String-based `relations` removed** — 请使用对象语法 `relations: { profile: true }`，而不是 `relations: ["profile"]` ([#12215](https://github.com/typeorm/typeorm/pull/12215) by [@pkuczynski](https://github.com/pkuczynski))
- **Deprecated lock modes removed** — `pessimistic_partial_write` 和 `pessimistic_write_or_fail` 已被带 `onLocked` 选项的 `pessimistic_write` 替代 ([#12093](https://github.com/typeorm/typeorm/pull/12093) by [@pkuczynski](https://github.com/pkuczynski))
- **`QueryRunner.loadedTables` and `loadedViews` removed** — 改为使用 `getTables()` 和 `getViews()` ([#12183](https://github.com/typeorm/typeorm/pull/12183) by [@pkuczynski](https://github.com/pkuczynski))
- **`MigrationExecutor.getAllMigrations()` removed** — 改为使用 `getPendingMigrations()`、`getExecutedMigrations()` 或 `dataSource.migrations` ([#12142](https://github.com/typeorm/typeorm/pull/12142) by [@pkuczynski](https://github.com/pkuczynski))
- **`EntityMetadata.createPropertyPath()` static method removed** — 内部工具方法，没有公开替代方案 ([#12141](https://github.com/typeorm/typeorm/pull/12141) by [@pkuczynski](https://github.com/pkuczynski))
- **Internal `nativeParameters` plumbing removed** from drivers and query builders ([#12104](https://github.com/typeorm/typeorm/pull/12104) by [@pkuczynski](https://github.com/pkuczynski))
- **Internal `broadcastLoadEventsForAll()` removed** from Broadcaster ([#12137](https://github.com/typeorm/typeorm/pull/12137) by [@pkuczynski](https://github.com/pkuczynski))
- **Internal `DriverUtils.buildColumnAlias()` removed** — 改为使用 `buildAlias()` ([#12138](https://github.com/typeorm/typeorm/pull/12138) by [@pkuczynski](https://github.com/pkuczynski))
- **`RdbmsSchemaBuilder.renameTables()` removed** — 一个空的无操作方法，从未被调用过 ([#12284](https://github.com/typeorm/typeorm/pull/12284) by [@naorpeled](https://github.com/naorpeled))
- **`EntityMetadata.getValueMap()` `options` parameter removed** — `skipNulls` 选项从未生效；删除第三个参数 ([#12303](https://github.com/typeorm/typeorm/pull/12303) by [@naorpeled](https://github.com/naorpeled))
- **`LegacyOracleNamingStrategy` and `NamingStrategyV03` moved to `@typeorm/legacy-naming-strategies`** — 这些类不再从 `typeorm` 核心包导出；如果你仍然需要它们，请安装独立的 `@typeorm/legacy-naming-strategies` 包并从那里导入 ([#12416](https://github.com/typeorm/typeorm/pull/12416) by [@alumni](https://github.com/alumni))

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

### 事务

- **所有驱动的 DataSource 级默认隔离级别** — `DataSourceOptions.isolationLevel` 现在会被每一个支持事务的驱动所遵从，而不仅仅是 SQL Server。通过 DataSource 启动的事务（显式或隐式用于 DML）默认使用该级别 ([#12269](https://github.com/typeorm/typeorm/pull/12269) by [@pkuczynski](https://github.com/pkuczynski))
- **Aurora Postgres：事务隔离级别支持** — Aurora Postgres 现在会遵从 `isolationLevel` 选项，无论是在 DataSource 上还是在显式调用 `startTransaction()` 时 ([#12334](https://github.com/typeorm/typeorm/pull/12334) by [@pkuczynski](https://github.com/pkuczynski))
- **Spanner：事务隔离级别支持** — Google Spanner 现在会遵从 `isolationLevel` 选项。Spanner 的 `supportedIsolationLevels` 仅限于 `REPEATABLE READ`（目前为预览）和 `SERIALIZABLE` ([#12335](https://github.com/typeorm/typeorm/pull/12335) by [@pkuczynski](https://github.com/pkuczynski))

### 驱动

- **PostgreSQL: `ADD VALUE` 用于枚举变更** — 在添加新的枚举值时，TypeORM 现在在可行时使用更简单的 `ALTER TYPE ... ADD VALUE` 语法，而不是 4 步的重命名-创建-迁移-删除方案 ([#10956](https://github.com/typeorm/typeorm/pull/10956) by [@janzipek](https://github.com/janzipek))
- **PostgreSQL: 额外扩展** — 新增 `installExtensions` 选项，可在连接设置过程中安装额外的 PostgreSQL 扩展 ([#11888](https://github.com/typeorm/typeorm/pull/11888) by [@Cprakhar](https://github.com/Cprakhar))
- **PostgreSQL: 部分索引支持** — 新增对 PostgreSQL 部分索引的支持 ([#11318](https://github.com/typeorm/typeorm/pull/11318) by [@freePixel](https://github.com/freePixel))
- **SAP HANA: SELECT 中的锁定** — 现在 SAP HANA 查询支持 `FOR UPDATE` 及其他锁模式 ([#11996](https://github.com/typeorm/typeorm/pull/11996) by [@alumni](https://github.com/alumni))
- **SAP HANA: 表注释** — `@Entity({ comment: "..." })` 现在可与 SAP HANA 一起使用 ([#11939](https://github.com/typeorm/typeorm/pull/11939) by [@Cprakhar](https://github.com/Cprakhar))
- **SAP HANA: 连接池超时** — 新增 `maxWaitTimeoutIfPoolExhausted` 连接池选项 ([#11868](https://github.com/typeorm/typeorm/pull/11868) by [@alumni](https://github.com/alumni))
- **SAP HANA: 生成列** — `@Column({ generatedType: "STORED", asExpression: "..." })` 现在在 SAP HANA 中受支持 ([#12393](https://github.com/typeorm/typeorm/pull/12393) by [@Cprakhar](https://github.com/Cprakhar))
- **SQLite: `jsonb` 列类型** — SQLite 现在支持 `jsonb` 列类型 ([#11933](https://github.com/typeorm/typeorm/pull/11933) by [@Cprakhar](https://github.com/Cprakhar))
- **MongoDB: 基于对象的 `select` 投影** — `find*()` 方法现在除了现有的字符串数组形式外，也接受其他驱动使用的相同对象式 `select` 语法（`select: { id: true, name: true }`）([#12237](https://github.com/typeorm/typeorm/pull/12237) by [@pkuczynski](https://github.com/pkuczynski))
- **React Native: 加密密钥** — 新增为 React Native SQLite 数据库传递加密密钥的选项 ([#11736](https://github.com/typeorm/typeorm/pull/11736) by [@HtSpChakradharCholleti](https://github.com/HtSpChakradharCholleti))

### 持久化与插入更新

- **`clear()` 中的级联截断** — `Repository.clear()` 和 `EntityManager.clear()` 现在接受 `{ cascade: true }`，可在 PostgreSQL、CockroachDB 和 Oracle 上执行 `TRUNCATE ... CASCADE` ([#11866](https://github.com/typeorm/typeorm/pull/11866) by [@Cprakhar](https://github.com/Cprakhar))
- **`increment`/`decrement` 的更好的类型** — 条件参数现在使用正确的实体感知类型，而非 `any` ([#11294](https://github.com/typeorm/typeorm/pull/11294) by [@OSA413](https://github.com/OSA413))

### 列类型与装饰器

- **`@Exclusion` 上的可延迟支持** — 与 `@Unique` 和 `@Index` 上现有的可延迟支持相对应 ([#11802](https://github.com/typeorm/typeorm/pull/11802) by [@oGAD31](https://github.com/oGAD31))

### 其他

- **v1 迁移的自动化 codemod** — 新增 `@typeorm/codemod` 包，可自动处理大部分破坏性变更：运行 `npx @typeorm/codemod v1 src/` 即可更新导入、API 重命名、find 选项语法等 ([#12233](https://github.com/typeorm/typeorm/pull/12233) by [@pkuczynski](https://github.com/pkuczynski))
- **改进的 ormconfig 错误处理** — 加载失败现在会记录警告日志，而不是静默失败 ([#11871](https://github.com/typeorm/typeorm/pull/11871) by [@Cprakhar](https://github.com/Cprakhar))

## Bug 修复

### 查询生成

- **`orderBy` 中的列别名正确转义** — 当别名与保留字冲突时，可防止 SQL 错误 ([#12027](https://github.com/typeorm/typeorm/pull/12027) by [@Cprakhar](https://github.com/Cprakhar))
- **`addOrderBy` 解析数据库列名** — 现在使用数据库列名（例如 `created_at`）而不是属性名可以正常工作 ([#11904](https://github.com/typeorm/typeorm/pull/11904) by [@smith-xyz](https://github.com/smith-xyz))
- **排序子查询列解析** — 修复了按子查询列排序时出现的“Cannot get metadata for given alias”错误 ([#11343](https://github.com/typeorm/typeorm/pull/11343) by [@trannhan0810](https://github.com/trannhan0810))
- **保留 `select` 列顺序** — `getQuery()`/`getSql()` 现在会按 `select()` 和 `addSelect()` 添加的顺序返回列 ([#11902](https://github.com/typeorm/typeorm/pull/11902) by [@Cprakhar](https://github.com/Cprakhar))
- **修复 `.update()` 查询生成** — 修正了使用 QueryBuilder `.update()` 时错误的 SQL 生成 ([#11993](https://github.com/typeorm/typeorm/pull/11993) by [@gioboa](https://github.com/gioboa))
- **带表别名的 upsert SQL 生成** — 修复了表继承和自定义模式下 upsert 查询中的错误列引用 ([#11915](https://github.com/typeorm/typeorm/pull/11915) by [@Cprakhar](https://github.com/Cprakhar))
- **联接时的 limit** — 修复了在使用 `skip`/`take` 分页并带有联接时结果不正确的问题 ([#11987](https://github.com/typeorm/typeorm/pull/11987) by [@gioboa](https://github.com/gioboa))
- **括号内的联接属性** — 修复了条件中包含括号时的联接解析问题 ([#11218](https://github.com/typeorm/typeorm/pull/11218) by [@balkrushna](https://github.com/balkrushna))
- **为聚合函数禁用全局 `ORDER BY`** — `repo.max()`、`repo.min()` 等不再生成带有 `ORDER BY` 子句的无效 SQL ([#11925](https://github.com/typeorm/typeorm/pull/11925) by [@Cprakhar](https://github.com/Cprakhar))
- **分页子查询包含已联接实体的主键** — 带 `skip`/`take` 的 `leftJoin` 现在可以正确加载关联实体 ([#11669](https://github.com/typeorm/typeorm/pull/11669) by [@mag123c](https://github.com/mag123c))
- **camelCase 别名缩短** — `shorten` 方法现在可以正确处理 `camelCase_aliases` ([#11283](https://github.com/typeorm/typeorm/pull/11283) by [@OSA413](https://github.com/OSA413))
- **`QueryBuilder.update()` 的实体类型** — `update(partialEntity)` 签名现在使用正确的、感知实体的类型，而不是宽松对象类型 ([#11296](https://github.com/typeorm/typeorm/pull/11296) by [@OSA413](https://github.com/OSA413))
- **日志查询中的空白字符** — 记录的查询字符串不再包含前导和尾随空白字符 ([#12047](https://github.com/typeorm/typeorm/pull/12047) by [@Cprakhar](https://github.com/Cprakhar))
- **`JsonContains` 接受数组值** — `JsonContains([...])` 不再抛出错误，并在 PostgreSQL 上生成预期的 `@>` 包含谓词 ([#12420](https://github.com/typeorm/typeorm/pull/12420) by [@kyungseopk1m](https://github.com/kyungseopk1m))
- **MSSQL 计算列的联接作用域** — 当多个表共享列名时，计算列的模式检查现在限定在正确的表上 ([#12288](https://github.com/typeorm/typeorm/pull/12288) by [@PreAgile](https://github.com/PreAgile))

### 关系与贪婪加载

- **非空 FK 的孤立 one-to-many 子项现在会被删除** — 在保存带级联的 one-to-many 关系并替换子项时，带非空 FK 的孤立行现在会被删除，而不是因约束违反而失败；可空 FK 的行仍会像以前一样被置空 ([#11982](https://github.com/typeorm/typeorm/pull/11982) by [@naorpeled](https://github.com/naorpeled))
- **贪婪关系现在遵循 `relationLoadStrategy: "query"`** — 当设置为 `"query"` 策略时，贪婪关系会通过单独查询加载，而不是始终使用 JOIN ([#11326](https://github.com/typeorm/typeorm/pull/11326) by [@SharkSharp](https://github.com/SharkSharp), [#12256](https://github.com/typeorm/typeorm/pull/12256) by [@pkuczynski](https://github.com/pkuczynski))
- **自引用关系别名冲突** — 在 `relationLoadStrategy: "query"` 下，自引用关系不再因别名冲突而生成错误的 SQL ([#11066](https://github.com/typeorm/typeorm/pull/11066) by [@campmarc](https://github.com/campmarc))
- **贪婪关系不再被重复联接** — 在 `relations` 中显式指定贪婪关系不再导致重复的 JOIN ([#11991](https://github.com/typeorm/typeorm/pull/11991) by [@veeceey](https://github.com/veeceey))
- **保存带有贪婪加载关系的实体** — 修复了实体具有贪婪加载关系时的保存失败问题 ([#11975](https://github.com/typeorm/typeorm/pull/11975) by [@gioboa](https://github.com/gioboa))
- **`select: false` 的列不再被读取查询返回** — 标记为 `select: false` 的列现在会被正确排除在 `find` 和查询构建器结果之外；如需包含，请使用 `addSelect`。注意，`select: false` 只控制读取时从数据库加载哪些内容——`repository.save()` 返回的内存实体（以及你传入的引用）不会被修改，因此你提供的任何值在持久化后仍然可用 ([#11944](https://github.com/typeorm/typeorm/pull/11944) by [@gioboa](https://github.com/gioboa), [#12501](https://github.com/typeorm/typeorm/pull/12501) by [@tada5hi](https://github.com/tada5hi))
- **带 `joinMapOne` 方法的子查询** — 修复了使用 join map 方法时的错误行为 ([#11943](https://github.com/typeorm/typeorm/pull/11943) by [@gioboa](https://github.com/gioboa))
- **嵌套嵌入实体中的关系 ID** — 修复了在嵌入实体中映射关系 ID 时出现的 `TypeError: Cannot set properties of undefined` ([#11942](https://github.com/typeorm/typeorm/pull/11942) by [@Cprakhar](https://github.com/Cprakhar))
- **`RelationIdLoader` 别名处理** — 使用 `DriverUtils.getAlias` 以防止数据库在标识符长度受限时截断别名 ([#11228](https://github.com/typeorm/typeorm/pull/11228) by [@te1](https://github.com/te1))
- **`createPropertyPath` 中的 `*-to-many`** — 移除了阻止某些关系配置的错误处理逻辑 ([#11119](https://github.com/typeorm/typeorm/pull/11119) by [@ThbltLmr](https://github.com/ThbltLmr))
- **带复合主键的 `OneToMany` 级联删除** — 当目标具有复合主键时，`cascade: ["remove"]` 现在会正确将删除传播到子实体；此前 `CascadesSubjectBuilder` 从未将这些子项标记为 `mustBeRemoved`，导致外键约束违规 ([#12286](https://github.com/typeorm/typeorm/pull/12286) by [@pkuczynski](https://github.com/pkuczynski))
- **多对多恢复时将 `withDeleted` 传递给 relation-id loader** — 恢复带有多对多关系的软删除实体时，不再尝试重新插入已存在的中间表行；当父查询设置了 `withDeleted` 时，`RelationIdLoader` 现在会包含已软删除的实体 ([#12287](https://github.com/typeorm/typeorm/pull/12287) by [@pkuczynski](https://github.com/pkuczynski))

### 持久化

- **`update: false` 或 `generatedType` 的 upsert** — upsert 现在可以正确处理不应更新的列 ([#12030](https://github.com/typeorm/typeorm/pull/12030) by [@gioboa](https://github.com/gioboa))
- **将值转换器应用于 `FindOperator`** — `ApplyValueTransformers` 现在可以正确转换 `FindOperator` 实例（如 `In`、`Between` 等）中的值 ([#11172](https://github.com/typeorm/typeorm/pull/11172) by [@ZimGil](https://github.com/ZimGil))
- **软删除不再更新已软删除的行** — `softDelete` 和 `softRemove` 现在会跳过已经被软删除的行 ([#10705](https://github.com/typeorm/typeorm/pull/10705) by [@hassanmehdi98](https://github.com/hassanmehdi98))
- **实体合并尊重 `null` 值** — 合并到实体时不再静默丢弃 `null` 属性值 ([#11154](https://github.com/typeorm/typeorm/pull/11154) by [@knoid](https://github.com/knoid))
- **Map/对象比较** — 修复了 Map 和普通对象列值的错误变更检测 ([#10990](https://github.com/typeorm/typeorm/pull/10990) by [@mgohin](https://github.com/mgohin))
- **日期转换器变更检测** — 修复了日期值转换器的误报脏数据检测 ([#11963](https://github.com/typeorm/typeorm/pull/11963) by [@gioboa](https://github.com/gioboa))
- **子级 mpath 更新** — 重新设置父级时，树实体的 mpath 现在会被正确更新，即使父级已软删除也是如此 ([#10844](https://github.com/typeorm/typeorm/pull/10844) by [@JoseCToscano](https://github.com/JoseCToscano))
- **闭包中间表的 schema/database 传播** — schema 和 database 设置现在会被正确传播到闭包中间表 ([#12110](https://github.com/typeorm/typeorm/pull/12110) by [@pkuczynski](https://github.com/pkuczynski))
- **schema builder 中的虚拟属性处理** — schema builder 不再尝试为虚拟属性创建列 ([#11000](https://github.com/typeorm/typeorm/pull/11000) by [@skyran1278](https://github.com/skyran1278))
- **无名称 `TableForeignKey` 的删除** — 删除没有显式名称的外键现在不会失败 ([#10744](https://github.com/typeorm/typeorm/pull/10744) by [@taichunmin](https://github.com/taichunmin))
- **`getPendingMigrations` 不再创建 migrations 表** — 检查待执行迁移现在不再有副作用 ([#11672](https://github.com/typeorm/typeorm/pull/11672) by [@pkuczynski](https://github.com/pkuczynski))
- **多对多 `deferrable` 外键** — `@ManyToMany` 现在会遵循中间表外键上的 `deferrable` 选项 ([#11924](https://github.com/typeorm/typeorm/pull/11924) by [@smith-xyz](https://github.com/smith-xyz))
- **复合外键列顺序** — schema builder 会对复合外键中的引用列进行排序，使其与被引用主键索引顺序一致，从而防止 MySQL / MSSQL / SAP HANA 拒绝该约束 ([#12280](https://github.com/typeorm/typeorm/pull/12280) by [@pkuczynski](https://github.com/pkuczynski))
- **保留用户定义的共享连接列变更集** — 关系之间共享的显式 `@JoinColumn` 项在持久化期间不再被丢弃 ([#12354](https://github.com/typeorm/typeorm/pull/12354) by [@PreAgile](https://github.com/PreAgile))

### 驱动特定修复

- **PostgreSQL: `timestamptz` 持久化/回填** — `timestamp with time zone` 列现在可以正确持久化和回填 ([#11774](https://github.com/typeorm/typeorm/pull/11774) by [@Minishlink](https://github.com/Minishlink))
- **PostgreSQL: 几何类型重新保存** — point/circle 值现在在持久化时会标准化，以避免重新保存已回填对象时出现无效输入错误 ([#11857](https://github.com/typeorm/typeorm/pull/11857) by [@Cprakhar](https://github.com/Cprakhar))
- **PostgreSQL/CockroachDB: 带引号名称的表** — 修复了对名称中包含特殊字符的表的处理 ([#10993](https://github.com/typeorm/typeorm/pull/10993) by [@iskalyakin](https://github.com/iskalyakin))
- **PostgreSQL: 顺序执行查询** — 现在同一连接上的查询会按顺序执行，以避免 `pg` 8.19.0 的弃用警告，包括剩余的关系加载和持久化路径 ([#12105](https://github.com/typeorm/typeorm/pull/12105) by [@pkuczynski](https://github.com/pkuczynski), [#12421](https://github.com/typeorm/typeorm/pull/12421) by [@kyungseopk1m](https://github.com/kyungseopk1m))
- **MySQL: PolarDB-X 2.0 版本检测** — `getVersion()` 不再为 PolarDB-X 2.0 返回 `undefined` ([#11837](https://github.com/typeorm/typeorm/pull/11837) by [@Missna](https://github.com/Missna))
- **MongoDB: `ObjectIdColumn` 属性名转换** — `findOneBy({ id: value })` 现在会在 MongoDB 查询中正确转换为 `_id` ([#12200](https://github.com/typeorm/typeorm/pull/12200) by [@pkuczynski](https://github.com/pkuczynski))
- **MongoDB: 嵌套文档中的嵌入数组** — 正确处理嵌套文档结构中的嵌入数组 ([#10940](https://github.com/typeorm/typeorm/pull/10940) by [@mciuchitu](https://github.com/mciuchitu))
- **SQLite: simple-enum 数组** — 带 `array: true` 的 `simple-enum` 列不再因 CHECK 约束错误而失败 ([#11865](https://github.com/typeorm/typeorm/pull/11865) by [@Cprakhar](https://github.com/Cprakhar))
- **SAP HANA: `Date` 参数转义** — JS `Date` 值现在作为查询参数传递，而不是嵌入到 SQL 字符串中 ([#11867](https://github.com/typeorm/typeorm/pull/11867) by [@alumni](https://github.com/alumni))
- **CockroachDB: 事务重试中的结构化查询结果** — 在 CockroachDB 事务重试回放期间，`useStructuredResult` 标志现在会被保留 ([#11861](https://github.com/typeorm/typeorm/pull/11861) by [@naorpeled](https://github.com/naorpeled))
- **Cordova: 查询受影响行数** — 查询结果现在包含受影响行数的计数 ([#10873](https://github.com/typeorm/typeorm/pull/10873) by [@jacobg](https://github.com/jacobg))
- **PostgreSQL / CockroachDB: 枚举值声明顺序** — 枚举值现在会按声明顺序加载，因此当没有变化时，生成的迁移不再反复变动 ([#12404](https://github.com/typeorm/typeorm/pull/12404) by [@pkuczynski](https://github.com/pkuczynski))
- **Expo: 自动加载 `expo-sqlite`** — Expo 驱动通过 `loadDependencies()` 加载 `expo-sqlite`，无需再显式传入该模块 ([#12363](https://github.com/typeorm/typeorm/pull/12363) by [@pkuczynski](https://github.com/pkuczynski))

### 其他

- **CLI `init` 命令** — 在 `package.json` 不存在时不再崩溃 ([#11947](https://github.com/typeorm/typeorm/pull/11947) by [@gioboa](https://github.com/gioboa))；已发布的包现在会正确包含脚手架所需的 `devDependencies` ([#12281](https://github.com/typeorm/typeorm/pull/12281) by [@pkuczynski](https://github.com/pkuczynski))；init 期间不再运行 `npm install`，因此可在离线或非 Node 项目环境中工作 ([#12386](https://github.com/typeorm/typeorm/pull/12386) by [@alumni](https://github.com/alumni))
- **Deno `process` 导入** — 修复了 Deno 上 `process` 依赖的错误导入 ([#11248](https://github.com/typeorm/typeorm/pull/11248) by [@yohannpoli](https://github.com/yohannpoli))
- **保留 MySQL/MSSQL 的查询堆栈跟踪** — 驱动错误现在会保留原始调用位置，使查询失败更容易调试 ([#12056](https://github.com/typeorm/typeorm/pull/12056) by [@Cprakhar](https://github.com/Cprakhar))

## 安全修复

- **SQL 注入防护** — 现在所有驱动在进行模式检查和 DDL 方法时都使用参数化查询和已转义的标识符，从而防止通过数据库/模式/表/列名称进行 SQL 注入（[#12207](https://github.com/typeorm/typeorm/pull/12207) by [@pkuczynski](https://github.com/pkuczynski), [#12197](https://github.com/typeorm/typeorm/pull/12197) by [@pkuczynski](https://github.com/pkuczynski), [#12185](https://github.com/typeorm/typeorm/pull/12185) by [@pkuczynski](https://github.com/pkuczynski))
- **OrderBy 条件校验** — QueryBuilder 的 `orderBy` 和 `addOrderBy` 现在会在运行时校验条件值，从而防止通过排序表达式进行注入（[#12217](https://github.com/typeorm/typeorm/pull/12217) by [@pkuczynski](https://github.com/pkuczynski))
- **在 Update/SoftDelete query builder 上校验 `.limit()`** — 传递给 `.limit()` 的非数字值现在会在调用时直接抛出异常，而不是被插入到 SQL 中（[#12436](https://github.com/typeorm/typeorm/pull/12436) by [@smith-xyz](https://github.com/smith-xyz))

## 性能改进

- **PostgreSQL / CockroachDB：`clearDatabase()` 中的批量 DROP** — 将单独的 DROP 语句合并为单个批量查询，显著减少测试设置期间的往返次数（[#12164](https://github.com/typeorm/typeorm/pull/12164), [#12159](https://github.com/typeorm/typeorm/pull/12159) 由 [@pkuczynski](https://github.com/pkuczynski) 贡献）

<!-- Built against f5cc456e7 -->
