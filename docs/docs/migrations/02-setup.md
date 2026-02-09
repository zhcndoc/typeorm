# 设置

在使用迁移之前，您需要正确设置您的 [DataSource](../data-source/1-data-source.md) 选项：

```ts
export default new DataSource({
    // 基本设置
    synchronize: false,
    migrations: [__dirname + "/migrations/**/*{.js,.ts}"],

    // 可选
    migrationsRun: false,
    migrationsTableName: "migrations",
    migrationsTransactionMode: "all",

    // 其他选项...
})
```

## `synchronise`

关闭自动模式同步（同步数据库结构）对于使用迁移来说是必须的。否则迁移就没有意义。

## `migrations`

定义需要由 TypeORM 加载的迁移列表。它既接受迁移类，也接受包含迁移文件的目录。

最简单的方法是指定包含迁移文件的目录（支持通配符）：

```ts
migrations: [__dirname + "/migrations/**/*{.js,.ts}"]
```

同时定义 `.js` 和 `.ts` 扩展名可以让你在开发环境运行 `.ts` 文件，在生产环境运行编译成 JavaScript 的 `.js` 文件（例如来自 Docker 镜像）。

或者你也可以指定确切的类，以获得更细粒度的控制：

```ts
import FirstMigration from "./migrations/TIMESTAMP-first-migration"
import SecondMigration from "./migrations/TIMESTAMP-second-migration"

export default new DataSource({
    migrations: [FirstMigration, SecondMigration],
})
```

但这样会有更多的手工工作，且容易出错。

- `migrationsRun` — 指示是否在每次应用启动时自动运行 [迁移](../migrations/01-why.md)。

## 可选设置

### `migrationsRun`

指示是否在每次应用启动时自动运行迁移。默认值：`false`

### `migrationsTableName`

你可能想指定存储已执行迁移信息的表的名称。默认名称是 `'migrations'`。

```ts
migrationsTableName: "some_custom_migrations_table"
```

### `migrationsTransactionMode`

控制运行迁移时的事务模式。可选值如下：

- `all`（_默认_）— 将所有迁移运行包裹在一个事务中
- `none` — 不使用事务
- `each` — 每个迁移单独使用事务