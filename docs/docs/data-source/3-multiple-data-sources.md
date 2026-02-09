# 多数据源、数据库、模式和复制设置

## 使用多个数据源

要使用多个连接到不同数据库的数据源，只需创建多个 DataSource 实例：

```typescript
import { DataSource } from "typeorm"

const db1DataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "admin",
    database: "db1",
    entities: [__dirname + "/entities/*{.js,.ts}"],
    synchronize: true,
})

const db2DataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "admin",
    database: "db2",
    entities: [__dirname + "/entities/*{.js,.ts}"],
    synchronize: true,
})
```

## 在单个数据源中使用多个数据库

要在单个数据源中使用多个数据库，
可以在每个实体中指定数据库名称：

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ database: "secondDB" })
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string
}
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ database: "thirdDB" })
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string
}
```

`User` 实体会创建在 `secondDB` 数据库中，`Photo` 实体会创建在 `thirdDB` 数据库中。
所有其他实体会在数据源选项中定义的默认数据库中创建。

如果想从不同的数据库中查询数据，只需提供实体即可：

```typescript
const users = await dataSource
    .createQueryBuilder()
    .select()
    .from(User, "user")
    .addFrom(Photo, "photo")
    .andWhere("photo.userId = user.id")
    .getMany() // userId 不是外键，因为这是跨数据库请求
```

此代码会生成如下 SQL 查询（根据数据库类型不同）：

```sql
SELECT * FROM "secondDB"."user" "user", "thirdDB"."photo" "photo"
    WHERE "photo"."userId" = "user"."id"
```

你也可以指定表路径而不是实体：

```typescript
const users = await dataSource
    .createQueryBuilder()
    .select()
    .from("secondDB.user", "user")
    .addFrom("thirdDB.photo", "photo")
    .andWhere("photo.userId = user.id")
    .getMany() // userId 不是外键，因为这是跨数据库请求
```

此功能仅在 MySQL 和 MSSQL 数据库中支持。

## 在单个数据源中使用多个模式（schema）

要在应用中使用多个模式，只需在每个实体上设置 `schema`：

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ schema: "secondSchema" })
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string
}
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ schema: "thirdSchema" })
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string
}
```

`User` 实体将创建在 `secondSchema` 模式中，`Photo` 实体将创建在 `thirdSchema` 模式中。
其他所有实体会在数据源选项中定义的默认数据库中创建。

如果想从不同模式中查询数据，只需提供实体：

```typescript
const users = await dataSource
    .createQueryBuilder()
    .select()
    .from(User, "user")
    .addFrom(Photo, "photo")
    .andWhere("photo.userId = user.id")
    .getMany() // userId 不是外键，因为这是跨数据库请求
```

此代码会生成如下 SQL 查询（根据数据库类型不同）：

```sql
SELECT * FROM "secondSchema"."question" "question", "thirdSchema"."photo" "photo"
    WHERE "photo"."userId" = "user"."id"
```

你也可以指定表路径而非实体：

```typescript
const users = await dataSource
    .createQueryBuilder()
    .select()
    .from("secondSchema.user", "user") // 在mssql中你甚至可以指定数据库：secondDB.secondSchema.user
    .addFrom("thirdSchema.photo", "photo") // 在mssql中你甚至可以指定数据库：thirdDB.thirdSchema.photo
    .andWhere("photo.userId = user.id")
    .getMany()
```

此功能仅在 Postgres 和 MSSQL 数据库中支持。
在 MSSQL 中，你也可以结合使用模式和数据库，例如：

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity({ database: "secondDB", schema: "public" })
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string
}
```

## 复制（Replication）

你可以使用 TypeORM 设置读写复制。
复制配置示例：

```typescript
const datasource = new DataSource({
    type: "mysql",
    logging: true,
    replication: {
        master: {
            host: "server1",
            port: 3306,
            username: "test",
            password: "test",
            database: "test",
        },
        slaves: [
            {
                host: "server2",
                port: 3306,
                username: "test",
                password: "test",
                database: "test",
            },
            {
                host: "server3",
                port: 3306,
                username: "test",
                password: "test",
                database: "test",
            },
        ],
    },
})
```

定义复制从库（slaves）后，TypeORM 默认会将所有可能的查询发送到从库。

- 通过 `find` 方法或 `SelectQueryBuilder` 执行的所有查询将使用随机的 `slave` 实例
- 所有通过 `update`、`create`、`InsertQueryBuilder`、`UpdateQueryBuilder` 等执行的写操作将使用 `master` 实例
- 通过调用 `.query()` 执行的所有原始查询将使用 `master` 实例
- 所有模式更新操作都使用 `master` 实例执行

### 明确选择查询目标

默认情况下，TypeORM 会将所有读取查询都发送到随机的读从库，写入操作发送到主库。这意味着当你首次在配置中添加 `replication` 设置后，任何现有的不显式指定复制模式的读取查询都会开始访问从库。这有利于扩展，但如果某些查询**必须**返回最新数据，则需要在创建查询运行器时显式传入复制模式。

如果你想明确使用 `master` 进行读取查询，创建 `QueryRunner` 时传入明确的 `ReplicationMode`：

```typescript
const masterQueryRunner = dataSource.createQueryRunner("master")
try {
    const postsFromMaster = await dataSource
        .createQueryBuilder(Post, "post", masterQueryRunner) // 你可以作为可选参数传递 QueryRunner 给查询构造器
        .setQueryRunner(masterQueryRunner) // 或使用 setQueryRunner 设置或覆盖查询构造器的 QueryRunner
        .getMany()
} finally {
    await masterQueryRunner.release()
}
```

如果你想在原始查询中使用从库，创建 `QueryRunner` 时传入 `"slave"`：

```typescript
const slaveQueryRunner = dataSource.createQueryRunner("slave")
try {
    const userFromSlave = await slaveQueryRunner.query(
        "SELECT * FROM users WHERE id = $1",
        [userId],
        slaveQueryRunner,
    )
} finally {
    return slaveQueryRunner.release()
}
```

**注意**：手动创建的 `QueryRunner` 实例必须显式释放。如果不释放，查询运行器会一直占用一个数据库连接，阻止其他查询使用该连接。

### 调整读取查询默认目标

如果不想让所有读取都默认发送到 `slave` 实例，可以在复制配置中传入 `defaultMode: "master"` 来更改默认读取目标：

```typescript
const datasource = new DataSource({
    type: "mysql",
    logging: true,
    replication: {
        // 设置读取查询默认目标为主库
        defaultMode: "master",
        master: {
            host: "server1",
            port: 3306,
            username: "test",
            password: "test",
            database: "test",
        },
        slaves: [
            {
                host: "server2",
                port: 3306,
                username: "test",
                password: "test",
                database: "test",
            },
        ],
    },
})
```

在此模式下，默认不会将查询发送给读从库，你必须显式使用 `.createQueryRunner("slave")` 调用，才能访问从库。

如果你是首次在现有应用中添加复制配置，这是保证初始行为不变的好选项，之后可以逐步在每个查询运行器上使用读副本。

### 支持的驱动

复制支持 MySQL、PostgreSQL、SQL Server、Cockroach、Oracle 和 Spanner 连接驱动。

MySQL 复制支持附加配置选项：

```typescript
{
  replication: {
    master: {
      host: "server1",
      port: 3306,
      username: "test",
      password: "test",
      database: "test"
    },
    slaves: [{
      host: "server2",
      port: 3306,
      username: "test",
      password: "test",
      database: "test"
    }, {
      host: "server3",
      port: 3306,
      username: "test",
      password: "test",
      database: "test"
    }],

    /**
    * 如果为 true，在连接失败时 PoolCluster 会尝试重新连接。（默认：true）
    */
    canRetry: true,

    /**
     * 如果连接失败，node 的 errorCount 增加。
     * 当 errorCount 大于 removeNodeErrorCount 时，会移除 PoolCluster 中的该节点。（默认：5）
     */
    removeNodeErrorCount: 5,

    /**
     * 如果连接失败，指定毫秒数后尝试重新连接。
     * 如果设置为 0，则节点将被移除且不会再重用。（默认：0）
     */
     restoreNodeTimeout: 0,

    /**
     * 确定如何选择从库：
     * RR: 轮询选择。
     * RANDOM: 随机选择节点。
     * ORDER: 无条件选择第一个可用节点。
     */
    selector: "RR"
  }
}
```