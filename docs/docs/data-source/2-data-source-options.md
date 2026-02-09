# 数据源选项

## 什么是 DataSourceOptions？

`DataSourceOptions` 是你在创建新的 `DataSource` 实例时传入的数据源配置。
不同的关系型数据库管理系统（RDBMS）有其各自特定的选项。

## 常见的数据源选项

- `type` - RDBMS 类型。你必须指定所使用的数据库引擎。
  可选值包括：
  "mysql", "postgres", "cockroachdb", "sap", "spanner", "mariadb", "sqlite", "cordova", "react-native", "nativescript", "sqljs", "oracle", "mssql", "mongodb", "aurora-mysql", "aurora-postgres", "expo", "better-sqlite3", "capacitor"。
  此选项为 **必填**。

- `extra` - 传递给底层驱动的额外选项。
  当你需要向底层数据库驱动传递额外配置时使用它。

- `entities` - 需要加载并用于此数据源的实体或实体模式。
  它接受实体类、实体模式类以及从目录路径加载。
  目录支持 glob 模式。
  例如：`entities: [Post, Category, "entities/*.js", "modules/**/entities/*.js"]`。
  了解更多关于 [实体](../entity/1-entities.md)。
  了解更多关于 [实体模式](../entity/6-separating-entity-definition.md)。

- `subscribers` - 需要加载并用于此数据源的订阅者。
  它接受实体类和目录路径加载。
  目录支持 glob 模式。
  例如：`subscribers: [PostSubscriber, AppSubscriber, "subscribers/*.js", "modules/**/subscribers/*.js"]`。
  了解更多关于 [订阅者](../advanced-topics/4-listeners-and-subscribers.md)。

- `logging` - 指示是否启用日志记录。
  如果设置为 `true`，将启用查询和错误日志。
  你也可以指定不同类型的日志记录，例如 `["query", "error", "schema"]`。
  了解更多关于 [日志记录](../advanced-topics/5-logging.md)。

- `logger` - 用于日志记录的日志器。可选值有 "advanced-console"、"formatted-console"、"simple-console" 和 "file"。
  默认是 "advanced-console"。你也可以指定实现了 `Logger` 接口的日志器类。
  了解更多关于 [日志记录](../advanced-topics/5-logging.md)。

- `maxQueryExecutionTime` - 如果查询执行时间超过此最大执行时间（毫秒），日志器将记录该查询。

- `poolSize` - 配置连接池中最大活动连接数。

- `namingStrategy` - 用于数据库中表和列命名的命名策略。

- `entityPrefix` - 给此数据源的所有表（或集合）添加指定字符串的前缀。

- `entitySkipConstructor` - 指示 TypeORM 在从数据库反序列化实体时是否跳过构造函数。
  注意：不调用构造函数时，私有属性和默认属性可能不会如预期工作。

- `dropSchema` - 每次初始化数据源时丢弃数据库模式（schema）。
  使用此选项时要非常小心，请勿在生产环境中使用——否则你会丢失所有生产数据。
  该选项适用于调试和开发阶段。

- `synchronize` - 指示是否在每次应用启动时自动创建数据库模式。
  使用此选项时要非常小心，请勿在生产环境中使用——否则你可能会丢失生产数据。
  该选项适用于调试和开发阶段。
  作为替代，你可以使用 CLI 来运行 schema:sync 命令。
  注意，对于 MongoDB，因其无模式（schemaless），此选项不会创建模式，而是仅通过创建索引实现同步。

- `migrations` - 需要加载并用于此数据源的[迁移](../migrations/01-why.md)。

- `migrationsRun` - 指示是否在每次应用启动时自动运行[迁移](../migrations/01-why.md)。

- `migrationsTableName` - 数据库中包含执行过的[迁移](../migrations/01-why.md)信息的表名。

- `migrationsTransactionMode` - 控制运行[迁移](../migrations/01-why.md)时的事务模式。

- `metadataTableName` - 数据库中包含表元数据信息的表名。
  默认这个表名为 "typeorm_metadata"。

- `cache` - 启用实体结果缓存。你也可以在这里配置缓存类型及其它缓存选项。
  详细阅读缓存内容请看 [这里](../query-builder/6-caching.md)。

- `isolateWhereStatements` - 启用 where 语句隔离，自动将每个 where 子句用括号包裹。
  例如 `.where("user.firstName = :search OR user.lastName = :search")` 会变成 `WHERE (user.firstName = ? OR user.lastName = ?)`，而不是 `WHERE user.firstName = ? OR user.lastName = ?`。

- `invalidWhereValuesBehavior` - 控制 TypeORM 中 where 条件对 null 和 undefined 值的处理方式（影响所有操作，包括查找、查询构建器、仓库方法）。
    - 对 `null` 的处理选项：
        - `'ignore'`（默认） - 跳过 null 属性
        - `'sql-null'` - 将 null 转换为 SQL NULL
        - `'throw'` - 抛出错误
    - 对 `undefined` 的处理选项：
        - `'ignore'`（默认） - 跳过 undefined 属性
        - `'throw'` - 抛出错误

    示例：`invalidWhereValuesBehavior: { null: 'sql-null', undefined: 'throw' }`。

    了解更多关于[Null 和 Undefined 的处理](./5-null-and-undefined-handling.md)。

## 数据源选项示例

下面是一个 MySQL 的数据源选项示例：

```typescript
{
    host: "localhost",
    port: 3306,
    username: "test",
    password: "test",
    database: "test",
    logging: true,
    synchronize: true,
    entities: [__dirname + "/entities/**/*{.js,.ts}"],
    subscribers: [__dirname + "/subscribers/**/*{.js,.ts}"],
    entitySchemas: [__dirname + "/schemas/**/*.json"],
    migrations: [__dirname + "/migrations/**/*{.js,.ts}"]
}
```