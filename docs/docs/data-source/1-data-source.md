# DataSource

## 什么是 DataSource？

只有在你设置了 `DataSource` 后，才能与数据库进行交互。
TypeORM 的 `DataSource` 保存你的数据库连接设置，并根据你使用的关系型数据库管理系统（RDBMS）建立初始数据库连接或连接池。

要建立初始连接或连接池，你必须调用 `DataSource` 实例的 `initialize` 方法。

断开连接（关闭连接池中的所有连接）发生在调用 `destroy` 方法时。

通常，你会在应用启动时调用 `DataSource` 实例的 `initialize` 方法，
在完成数据库操作后调用 `destroy` 方法。
实际上，如果你是在构建一个网站的后端且后端服务器一直运行，
你通常不会调用 `destroy` 来销毁 DataSource。

## 创建一个新的 DataSource

要创建一个新的 `DataSource` 实例，必须通过调用 `new DataSource` 来初始化构造函数，并赋值给一个全局变量，供应用中使用：

```typescript
import { DataSource } from "typeorm"

const AppDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "test",
    password: "test",
    database: "test",
})

try {
    await AppDataSource.initialize()
    console.log("数据源已初始化！")
} catch (error) {
    console.error("初始化数据源时出错", error)
}
```

通过 `export` 导出 `AppDataSource` 是一个好主意，因为你将在整个应用中使用这个实例。

`DataSource` 接受 `DataSourceOptions`，具体选项会根据你使用的数据库类型而不同。
对于不同的数据库类型，可以指定不同的选项。

你的应用可以定义任意多个数据源，例如：

```typescript
import { DataSource } from "typeorm"

const MysqlDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "test",
    password: "test",
    database: "test",
    entities: [__dirname + "/entities/**/*{.js,.ts}"],
})

const PostgresDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "test",
    password: "test",
    database: "test",
    entities: [__dirname + "/entities/**/*{.js,.ts}"],
})
```

## 如何使用 DataSource？

设置好 `DataSource` 后，你可以在应用的任何地方使用它，例如：

```typescript
import { AppDataSource } from "./app-data-source"
import { User } from "../entity/User"

export class UserController {
    @Get("/users")
    getAll() {
        return AppDataSource.manager.find(User)
    }
}
```

利用 `DataSource` 实例，你可以使用实体执行数据库操作，
特别是通过 `.manager` 和 `.getRepository()` 属性。
更多关于它们的信息请参考[实体管理器](../working-with-entity-manager/1-working-with-entity-manager.md)和[仓库](../working-with-entity-manager/2-working-with-repository.md)文档。