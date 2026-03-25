# TypeORM 1.0 发布说明

TypeORM 1.0 是一个重大版本，移除了长期弃用的 API，现代化了平台要求，并带来了在 0.3.x 周期中积累的数十个错误修复和新功能。

## 破坏性变更

> 查看 [迁移指南](./8-migration-v1.md) 获取详细的升级说明。

### 平台要求

- **要求 Node.js 20+** — 已移除对 Node.js 16 和 18 的支持，最低 JavaScript 目标版本现为 ES2023 ([#11382](https://github.com/typeorm/typeorm/pull/11382) by [@alumni](https://github.com/alumni))
- **移除 `Buffer` polyfill** — 现在在非 Node 平台上使用 `Uint8Array` 处理二进制数据；Node.js `Buffer`（继承自 `Uint8Array`）继续像以前一样工作 ([#11935](https://github.com/typeorm/typeorm/pull/11935) by [@pujux](https://github.com/pujux))
- **替换 Glob 库** — `glob` 已替换为 `tinyglobby`，`rimraf` 已被移除，减少了依赖项 ([#11699](https://github.com/typeorm/typeorm/pull/11699) by [@alumni](https://github.com/alumni))
- **哈希迁移至原生 `crypto`** — `sha.js` 和 `uuid` 包已被原生 `crypto` 模块和 `crypto.randomUUID()` 替代 ([#11864](https://github.com/typeorm/typeorm/pull/11864) by [@G0maa](https://github.com/G0maa), [#11769](https://github.com/typeorm/typeorm/pull/11769) by [@mag123c](https://github.com/mag123c))

### 驱动变更

- **MySQL / MariaDB：移除 `mysql` 包** — 仅支持 `mysql2`；已移除 `connectorPackage` 选项 ([#11766](https://github.com/typeorm/typeorm/pull/11766) by [@pkuczynski](https://github.com/pkuczynski))
- **MySQL：`legacySpatialSupport` 现在默认为 `false`** — 默认使用标准的 `ST_GeomFromText`/`ST_AsText` 函数 ([#12083](https://github.com/typeorm/typeorm/pull/12083) by [@pkuczynski](https://github.com/pkuczynski))
- **MySQL：移除 `width` 和 `zerofill` 列选项** — 这些选项在 MySQL 8.0.17 中已弃用，在 MySQL 8.4 中已移除 ([#12084](https://github.com/typeorm/typeorm/pull/12084) by [@pkuczynski](https://github.com/pkuczynski))
- **SQLite：移除 `sqlite3`，`better-sqlite3` 成为默认** — 不再支持 `sqlite3` 包；已移除 `flags` 和 `busyTimeout` 选项 ([#11836](https://github.com/typeorm/typeorm/pull/11836) by [@pkuczynski](https://github.com/pkuczynski))
- **MongoDB：要求驱动 v7+** — 已移除对 MongoDB Node.js 驱动 v5/v6 的支持；已移除 `stats()` 方法；已移除弃用的连接选项；不再导出内部类型 ([#12208](https://github.com/typeorm/typeorm/pull/12208) by [@naorpeled](https://github.com/naorpeled), [#12179](https://github.com/typeorm/typeorm/pull/12179) by [@pkuczynski](https://github.com/pkuczynski), [#12120](https://github.com/typeorm/typeorm/pull/12120) by [@pkuczynski](https://github.com/pkuczynski), [#12037](https://github.com/typeorm/typeorm/pull/12037) by [@alumni](https://github.com/alumni))
- **MS SQL Server：移除 `domain` 连接选项** — 改用带 NTLM 类型的 `authentication` ([#12135](https://github.com/typeorm/typeorm/pull/12135) by [@pkuczynski](https://github.com/pkuczynski))
- **SAP HANA：移除弃用的连接别名** — `hanaClientDriver`、`pool.max`、`pool.requestTimeout`、`pool.idleTimeout` 等已被移除，改用其现代等效项 ([#12080](https://github.com/typeorm/typeorm/pull/12080) by [@gioboa](https://github.com/gioboa))
- **Expo：移除旧版驱动** — 已移除旧版 Expo SQLite 驱动；使用 Expo SDK v52+ 配合现代异步 API ([#11860](https://github.com/typeorm/typeorm/pull/11860) by [@G0maa](https://github.com/G0maa))
- **Redis：移除旧版客户端支持** — 查询结果缓存仅支持现代 Redis 客户端（v4+） ([#12057](https://github.com/typeorm/typeorm/pull/12057) by [@G0maa](https://github.com/G0maa))

### 移除的 API

- **移除 `Connection` 和 `ConnectionOptions`** — 改用 `DataSource` 和 `DataSourceOptions` ([#12022](https://github.com/typeorm/typeorm/pull/12022) by [@alumni](https://github.com/alumni))
- **移除 `ConnectionManager` 和全局便捷函数** — 已移除 `createConnection`、`getConnection`、`getManager`、`getRepository`、`createQueryBuilder` 等全局函数 ([#12098](https://github.com/typeorm/typeorm/pull/12098) by [@michaelbromley](https://github.com/michaelbromley))
- **移除 `getMongoRepository` 和 `getMongoManager` 全局函数** — 改用 `dataSource.getMongoRepository()` 和 `dataSource.mongoManager` ([#12099](https://github.com/typeorm/typeorm/pull/12099) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `DataSource.name`** — 命名连接在 v0.3 中已弃用；`ConnectionOptionsReader.all()` 重命名为 `get()` ([#12136](https://github.com/typeorm/typeorm/pull/12136) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `TYPEORM_*` 环境变量支持** — 已移除 `ConnectionOptionsEnvReader`、`ormconfig.env` 和 `dotenv` 自动加载 ([#12134](https://github.com/typeorm/typeorm/pull/12134) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `findByIds`** — 改用 `findBy` 配合 `In` 操作符 ([#12114](https://github.com/typeorm/typeorm/pull/12114) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `Repository.exist()`** — 改用 `Repository.exists()` ([#12131](https://github.com/typeorm/typeorm/pull/12131) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `AbstractRepository`、`@EntityRepository` 和 `getCustomRepository`** — 改用 `Repository.extend()` ([#12096](https://github.com/typeorm/typeorm/pull/12096) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `@RelationCount` 装饰器** — 改用带子查询的 `@VirtualColumn` ([#12181](https://github.com/typeorm/typeorm/pull/12181) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 IoC 容器系统** — 已移除 `useContainer()`、`getFromContainer()` 及相关类型 ([#12180](https://github.com/typeorm/typeorm/pull/12180) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `readonly` 列选项** — 改用 `update: false` ([#12132](https://github.com/typeorm/typeorm/pull/12132) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `ColumnNumericOptions` 上的 `unsigned`** — 仅影响 decimal/float 类型；integer `unsigned` 不变 ([#12133](https://github.com/typeorm/typeorm/pull/12133) by [@pkuczynski](https://github.com/pkuczynski))
- **QueryBuilder：移除 `onConflict()`、已弃用的 `orUpdate()` 重载和 `setNativeParameters()`** — 改用 `orIgnore()`/`orUpdate()` 数组签名和 `setParameters()` ([#12090](https://github.com/typeorm/typeorm/pull/12090) by [@pkuczynski](https://github.com/pkuczynski))
- **QueryBuilder：`printSql()` 重命名为 `logQuery()`** ([#12151](https://github.com/typeorm/typeorm/pull/12151) by [@naorpeled](https://github.com/naorpeled))
- **QueryBuilder：移除 `WhereExpression` 类型别名** — 改用 `WhereExpressionBuilder` ([#12097](https://github.com/typeorm/typeorm/pull/12097) by [@pkuczynski](https://github.com/pkuczynski))
- **QueryBuilder：移除 `replacePropertyNames()`** — 这是一个空操作 ([#12178](https://github.com/typeorm/typeorm/pull/12178) by [@pkuczynski](https://github.com/pkuczynski))
- **移除弃用的锁定模式** — `pessimistic_partial_write` 和 `pessimistic_write_or_fail` 被带 `onLocked` 选项的 `pessimistic_write` 替代 ([#12093](https://github.com/typeorm/typeorm/pull/12093) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `QueryRunner.loadedTables` 和 `loadedViews`** — 改用 `getTables()` 和 `getViews()` ([#12183](https://github.com/typeorm/typeorm/pull/12183) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `MigrationExecutor.getAllMigrations()`** — 改用 `getPendingMigrations()`、`getExecutedMigrations()` 或 `dataSource.migrations` ([#12142](https://github.com/typeorm/typeorm/pull/12142) by [@pkuczynski](https://github.com/pkuczynski))
- **移除 `EntityMetadata.createPropertyPath()` 静态方法** — 内部工具，无公开替代方案 ([#12141](https://github.com/typeorm/typeorm/pull/12141) by [@pkuczynski](https://github.com/pkuczynski))
- **从驱动和查询构建器中移除内部 `nativeParameters` 管道** ([#12104](https://github.com/typeorm/typeorm/pull/12104) by [@pkuczynski](https://github.com/pkuczynski))
- **从 Broadcaster 中移除内部 `broadcastLoadEventsForAll()`** ([#12137](https://github.com/typeorm/typeorm/pull/12137) by [@pkuczynski](https://github.com/pkuczynski))
- **移除内部 `DriverUtils.buildColumnAlias()`** — 改用 `buildAlias()` ([#12138](https://github.com/typeorm/typeorm/pull/12138) by [@pkuczynski](https://github.com/pkuczynski))

### 行为变更

- **`invalidWhereValuesBehavior` 默认为 `throw`** — 在 where 条件中传递 `null` 或 `undefined` 现在会抛出错误，而不是静默忽略该属性；使用 `IsNull()` 进行 null 匹配 ([#11710](https://github.com/typeorm/typeorm/pull/11710) by [@naorpeled](https://github.com/naorpeled))
- **`invalidWhereValuesBehavior` 仅作用于高级 API** — QueryBuilder 的 `.where()`、`.andWhere()`、`.orWhere()` 不再受此设置影响 ([#11878](https://github.com/typeorm/typeorm/pull/11878) by [@naorpeled](https://github.com/naorpeled))

## 新功能

### 查询构建器

- **`INSERT INTO ... SELECT FROM ...`** — `InsertQueryBuilder` 新增 `valuesFromSelect()` 方法，用于数据迁移和转换查询 ([#11896](https://github.com/typeorm/typeorm/pull/11896) by [@Cprakhar](https://github.com/Cprakhar))
- **update/upsert 的 `returning` 选项** — 仓库和实体管理器的 `update()` 和 `upsert()` 方法现在在支持 `RETURNING` 子句的数据库上支持 `returning` 选项 ([#11782](https://github.com/typeorm/typeorm/pull/11782) by [@naorpeled](https://github.com/naorpeled))
- **所有 drop 方法的 `ifExists` 参数** — `dropColumn`、`dropIndex`、`dropPrimaryKey`、`dropForeignKey`、`dropUniqueConstraint`、`dropCheckConstraint`、`dropExclusionConstraint` 及其复数变体现在接受 `ifExists` 标志 ([#12121](https://github.com/typeorm/typeorm/pull/12121) by [@pkuczynski](https://github.com/pkuczynski))
- **`QueryRunner` 的显式资源管理** — 支持 `await using` 语法（TypeScript 5.2+）实现自动清理 ([#11701](https://github.com/typeorm/typeorm/pull/11701) by [@alumni](https://github.com/alumni))

### 驱动

- **PostgreSQL：枚举变更使用 `ADD VALUE`** — 添加新枚举值时，TypeORM 现在尽可能使用更简单的 `ALTER TYPE ... ADD VALUE` 语法，而非四步重命名-创建-迁移-删除方案 ([#10956](https://github.com/typeorm/typeorm/pull/10956) by [@janzipek](https://github.com/janzipek))
- **PostgreSQL：附加扩展** — 新增 `installExtensions` 选项，在连接设置期间安装额外的 PostgreSQL 扩展 ([#11888](https://github.com/typeorm/typeorm/pull/11888) by [@Cprakhar](https://github.com/Cprakhar))
- **PostgreSQL：部分索引支持** — 添加对 PostgreSQL 部分索引的支持 ([#11318](https://github.com/typeorm/typeorm/pull/11318) by [@freePixel](https://github.com/freePixel))
- **SAP HANA：SELECT 中的锁定** — 现在在 SAP HANA 查询中支持 `FOR UPDATE` 和其他锁定模式 ([#11996](https://github.com/typeorm/typeorm/pull/11996) by [@alumni](https://github.com/alumni))
- **SAP HANA：表注释** — `@Entity({ comment: "..." })` 现在支持 SAP HANA ([#11939](https://github.com/typeorm/typeorm/pull/11939) by [@Cprakhar](https://github.com/Cprakhar))
- **SAP HANA：池超时** — 新增 `maxWaitTimeoutIfPoolExhausted` 池选项 ([#11868](https://github.com/typeorm/typeorm/pull/11868) by [@alumni](https://github.com/alumni))
- **SQLite：`jsonb` 列类型** — SQLite 现在支持 `jsonb` 列类型 ([#11933](https://github.com/typeorm/typeorm/pull/11933) by [@Cprakhar](https://github.com/Cprakhar))
- **React Native：加密密钥** — 新增选项用于传递 React Native SQLite 数据库的加密密钥 ([#11736](https://github.com/typeorm/typeorm/pull/11736) by [@HtSpChakradharCholleti](https://github.com/HtSpChakradharCholleti))

### 持久化与插入更新

- **`clear()` 中的级联截断** — `Repository.clear()` 和 `EntityManager.clear()` 现在接受 `{ cascade: true }` 以在 PostgreSQL、CockroachDB 和 Oracle 上执行 `TRUNCATE ... CASCADE` ([#11866](https://github.com/typeorm/typeorm/pull/11866) by [@Cprakhar](https://github.com/Cprakhar))
- **`increment`/`decrement` 的更好的类型** — 条件参数现在使用正确的实体感知类型，而非 `any` ([#11294](https://github.com/typeorm/typeorm/pull/11294) by [@OSA413](https://github.com/OSA413))

### 列类型与装饰器

- **`@Exclusion` 上的可延迟支持** — 与 `@Unique` 和 `@Index` 上现有的可延迟支持相对应 ([#11802](https://github.com/typeorm/typeorm/pull/11802) by [@oGAD31](https://github.com/oGAD31))

### 其他

- **改进的 ormconfig 错误处理** — 加载失败现在记录警告，而非静默失败 ([#11871](https://github.com/typeorm/typeorm/pull/11871) by [@Cprakhar](https://github.com/Cprakhar))

## Bug 修复

### 查询生成

- **`orderBy` 中的列别名正确转义** — 防止别名与保留字冲突时产生 SQL 错误 ([#12027](https://github.com/typeorm/typeorm/pull/12027) by [@Cprakhar](https://github.com/Cprakhar))
- **`addOrderBy` 解析数据库列名** — 使用数据库列名（例如 `created_at`）而非属性名现已正确工作 ([#11904](https://github.com/typeorm/typeorm/pull/11904) by [@smith-xyz](https://github.com/smith-xyz))
- **子查询列排序解析** — 修复了按子查询列排序时出现 "Cannot get metadata for given alias" 错误的问题 ([#11343](https://github.com/typeorm/typeorm/pull/11343) by [@trannhan0810](https://github.com/trannhan0810))
- **`select` 列顺序保留** — `getQuery()`/`getSql()` 现在按照通过 `select()` 和 `addSelect()` 添加的顺序返回列 ([#11902](https://github.com/typeorm/typeorm/pull/11902) by [@Cprakhar](https://github.com/Cprakhar))
- **`.update()` 查询生成修复** — 修复了使用 QueryBuilder `.update()` 时 SQL 生成错误的问题 ([#11993](https://github.com/typeorm/typeorm/pull/11993) by [@gioboa](https://github.com/gioboa))
- **带表别名的 Upsert SQL 生成** — 修复了表继承和自定义模式下 upsert 查询中的错误列引用问题 ([#11915](https://github.com/typeorm/typeorm/pull/11915) by [@Cprakhar](https://github.com/Cprakhar))
- **带连接的限制** — 修复了使用 `skip`/`take` 分页与连接时的错误结果问题 ([#11987](https://github.com/typeorm/typeorm/pull/11987) by [@gioboa](https://github.com/gioboa))
- **括号内的连接属性** — 修复了条件包含括号时的连接解析问题 ([#11218](https://github.com/typeorm/typeorm/pull/11218) by [@balkrushna](https://github.com/balkrushna))
- **禁用聚合函数的全局 `ORDER BY`** — `repo.max()`、`repo.min()` 等不再产生包含 `ORDER BY` 子句的无效 SQL ([#11925](https://github.com/typeorm/typeorm/pull/11925) by [@Cprakhar](https://github.com/Cprakhar))
- **分页子查询包含连接实体的主键** — 带 `skip`/`take` 的 `leftJoin` 现在正确加载相关实体 ([#11669](https://github.com/typeorm/typeorm/pull/11669) by [@mag123c](https://github.com/mag123c))
- **camelCase 别名缩短** — `shorten` 方法现在正确处理 `camelCase_aliases` ([#11283](https://github.com/typeorm/typeorm/pull/11283) by [@OSA413](https://github.com/OSA413))

### 关系与贪婪加载

- **自引用关系别名冲突** — 使用 `relationLoadStrategy: "query"` 的自引用关系不再因别名冲突而产生错误 SQL ([#11066](https://github.com/typeorm/typeorm/pull/11066) by [@campmarc](https://github.com/campmarc))
- **贪婪关系不再重复连接** — 在 `relations` 中显式指定贪婪关系不再导致重复的 JOIN ([#11991](https://github.com/typeorm/typeorm/pull/11991) by [@veeceey](https://github.com/veeceey))
- **保存贪婪加载的关系** — 修复了实体具有贪婪加载关系时的保存失败问题 ([#11975](https://github.com/typeorm/typeorm/pull/11975) by [@gioboa](https://github.com/gioboa))
- **`select: false` 的列不再返回** — 标记为 `select: false` 的列现在正确地从查询结果中排除 ([#11944](https://github.com/typeorm/typeorm/pull/11944) by [@gioboa](https://github.com/gioboa))
- **带 `joinMapOne` 方法的子查询** — 修复了使用连接映射方法时的错误行为 ([#11943](https://github.com/typeorm/typeorm/pull/11943) by [@gioboa](https://github.com/gioboa))
- **嵌套嵌入实体中的关系 ID** — 修复了在嵌入实体中映射关系 ID 时出现 `TypeError: Cannot set properties of undefined` 的问题 ([#11942](https://github.com/typeorm/typeorm/pull/11942) by [@Cprakhar](https://github.com/Cprakhar))
- **`RelationIdLoader` 别名处理** — 使用 `DriverUtils.getAlias` 防止具有短标识符限制的数据库截断别名 ([#11228](https://github.com/typeorm/typeorm/pull/11228) by [@te1](https://github.com/te1))
- **`createPropertyPath` 中的 `*-to-many`** — 移除了阻止某些关系配置的错误处理 ([#11119](https://github.com/typeorm/typeorm/pull/11119) by [@ThbltLmr](https://github.com/ThbltLmr))

### 持久化

- **带 `update: false` 或 `generatedType` 的 Upsert** — upsert 现在正确处理不应更新的列 ([#12030](https://github.com/typeorm/typeorm/pull/12030) by [@gioboa](https://github.com/gioboa))
- **值转换器应用于 `FindOperator`** — `ApplyValueTransformers` 现在正确转换 `FindOperator` 实例（如 `In`、`Between` 等）内部的值 ([#11172](https://github.com/typeorm/typeorm/pull/11172) by [@ZimGil](https://github.com/ZimGil))
- **软删除不再更新已软删除的行** — `softDelete` 和 `softRemove` 现在跳过已软删除的行 ([#10705](https://github.com/typeorm/typeorm/pull/10705) by [@hassanmehdi98](https://github.com/hassanmehdi98))
- **实体合并尊重 `null` 值** — 合并到实体时不再静默丢弃 `null` 属性值 ([#11154](https://github.com/typeorm/typeorm/pull/11154) by [@knoid](https://github.com/knoid))
- **Map/对象比较** — 修复了 Map 和普通对象列值的错误变更检测 ([#10990](https://github.com/typeorm/typeorm/pull/10990) by [@mgohin](https://github.com/mgohin))
- **日期转换器变更检测** — 修复了日期值转换器的误报脏检测 ([#11963](https://github.com/typeorm/typeorm/pull/11963) by [@gioboa](https://github.com/gioboa))
- **子节点 mpath 更新** — 树实体 mpath 现在在重新设置父节点时正确更新，即使父节点已被软删除 ([#10844](https://github.com/typeorm/typeorm/pull/10844) by [@JoseCToscano](https://github.com/JoseCToscano))
- **模式构建器中的虚拟属性处理** — 模式构建器不再尝试为虚拟属性创建列 ([#11000](https://github.com/typeorm/typeorm/pull/11000) by [@skyran1278](https://github.com/skyran1278))
- **无名 `TableForeignKey` 删除** — 删除没有显式名称的外键不再失败 ([#10744](https://github.com/typeorm/typeorm/pull/10744) by [@taichunmin](https://github.com/taichunmin))
- **`getPendingMigrations` 不再创建迁移表** — 检查待处理迁移不再产生副作用 ([#11672](https://github.com/typeorm/typeorm/pull/11672) by [@pkuczynski](https://github.com/pkuczynski))

### 驱动特定修复

- **PostgreSQL: `timestamptz` 持久化/填充** — `timestamp with time zone` 列现在正确持久化和填充 ([#11774](https://github.com/typeorm/typeorm/pull/11774) by [@Minishlink](https://github.com/Minishlink))
- **PostgreSQL: 几何类型重新保存** — point/circle 值现在在持久化时规范化，以避免重新保存填充对象时出现无效输入错误 ([#11857](https://github.com/typeorm/typeorm/pull/11857) by [@Cprakhar](https://github.com/Cprakhar))
- **PostgreSQL/CockroachDB: 带引号的表名** — 修复了名称中包含特殊字符的表的处理问题 ([#10993](https://github.com/typeorm/typeorm/pull/10993) by [@iskalyakin](https://github.com/iskalyakin))
- **PostgreSQL: 顺序查询执行** — 现在在同一连接上顺序执行查询，以避免 `pg` 8.19.0 弃用警告 ([#12105](https://github.com/typeorm/typeorm/pull/12105) by [@pkuczynski](https://github.com/pkuczynski))
- **MySQL: PolarDB-X 2.0 版本检测** — `getVersion()` 不再为 PolarDB-X 2.0 返回 `undefined` ([#11837](https://github.com/typeorm/typeorm/pull/11837) by [@Missna](https://github.com/Missna))
- **MongoDB: `ObjectIdColumn` 属性名转换** — `findOneBy({ id: value })` 现在正确转换为 MongoDB 查询中的 `_id` ([#12200](https://github.com/typeorm/typeorm/pull/12200) by [@pkuczynski](https://github.com/pkuczynski))
- **MongoDB: 嵌套文档中的嵌入数组** — 正确处理嵌套文档结构中的嵌入数组 ([#10940](https://github.com/typeorm/typeorm/pull/10940) by [@mciuchitu](https://github.com/mciuchitu))
- **SQLite: simple-enum 数组** — 带 `array: true` 的 `simple-enum` 列不再因 CHECK 约束错误而失败 ([#11865](https://github.com/typeorm/typeorm/pull/11865) by [@Cprakhar](https://github.com/Cprakhar))
- **SAP HANA: `Date` 参数转义** — JS `Date` 值现在作为查询参数传递，而不是嵌入 SQL 字符串中 ([#11867](https://github.com/typeorm/typeorm/pull/11867) by [@alumni](https://github.com/alumni))
- **CockroachDB: 事务重试中的结构化查询结果** — `useStructuredResult` 标志现在在 CockroachDB 事务重试回放期间得以保留 ([#11861](https://github.com/typeorm/typeorm/pull/11861) by [@naorpeled](https://github.com/naorpeled))
- **Cordova: 查询受影响行数** — 查询结果现在包含受影响行的计数 ([#10873](https://github.com/typeorm/typeorm/pull/10873) by [@jacobg](https://github.com/jacobg))

### 其他

- **CLI `init` 命令** — 当 `package.json` 不存在时不再崩溃 ([#11947](https://github.com/typeorm/typeorm/pull/11947) by [@gioboa](https://github.com/gioboa))
- **Deno `process` 导入** — 修复了 Deno 上 `process` 依赖的错误导入 ([#11248](https://github.com/typeorm/typeorm/pull/11248) by [@yohannpoli](https://github.com/yohannpoli))

## 安全修复

- **SQL 注入防护** — 现在所有驱动程序在模式内省和 DDL 方法中使用参数化查询和转义标识符，防止通过数据库/模式/表/列名进行 SQL 注入 ([#12207](https://github.com/typeorm/typeorm/pull/12207) by [@pkuczynski](https://github.com/pkuczynski), [#12197](https://github.com/typeorm/typeorm/pull/12197) by [@pkuczynski](https://github.com/pkuczynski), [#12185](https://github.com/typeorm/typeorm/pull/12185) by [@pkuczynski](https://github.com/pkuczynski))

## 性能改进

- **PostgreSQL / CockroachDB：`clearDatabase()` 中的批量 DROP** — 将单独的 DROP 语句合并为单个批量查询，显著减少测试设置期间的往返次数 ([#12164](https://github.com/typeorm/typeorm/pull/12164), [#12159](https://github.com/typeorm/typeorm/pull/12159) by [@pkuczynski](https://github.com/pkuczynski))

<!-- Built against e2284d81ef198948245ba77a614a9d45536f13d4 -->
