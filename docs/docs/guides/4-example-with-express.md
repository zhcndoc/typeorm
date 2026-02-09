# 使用 TypeORM 与 Express 的示例

## 初始设置

让我们创建一个名为“user”的简单应用程序，它在数据库中存储用户，
并允许我们创建、更新、删除以及获取所有用户列表，也可以通过 id 获取单个用户，
通过 Web API 来实现。

首先，创建一个名为“user”的目录：

```shell
mkdir user
```

然后切换到该目录并创建一个新项目：

```shell
cd user
npm init
```

完成初始化过程，填写所有必需的应用程序信息。

现在我们需要安装并设置 TypeScript 编译器。先安装它：

```shell
npm i typescript --save-dev
```

接着创建一个 `tsconfig.json` 文件，里面包含应用编译和运行所需的配置。
用你喜欢的编辑器创建它，并写入以下配置：

```json
{
    "compilerOptions": {
        "lib": ["es5", "es6", "dom"],
        "target": "es5",
        "module": "commonjs",
        "moduleResolution": "node",
        "emitDecoratorMetadata": true,
        "experimentalDecorators": true
    }
}
```

现在让我们创建主应用端点——在 `src` 目录下创建 `app.ts`：

```shell
mkdir src
cd src
touch app.ts
```

在其中添加一个简单的 `console.log`：

```typescript
console.log("Application is up and running")
```

现在是运行应用程序的时候了。
要运行它，你需要先编译 TypeScript 项目：

```shell
tsc
```

编译完成后，你应该会在 `src` 目录下生成一个 `app.js` 文件。
你可以使用以下命令运行它：

```shell
node src/app.js
```

运行应用后，你的控制台应该会看到“Application is up and running”消息。

每次更改代码后都必须重新编译。
你也可以配置监听器或安装 [ts-node](https://github.com/TypeStrong/ts-node) 以避免每次手动编译。

## 向应用添加 Express

让我们给应用添加 Express。
首先安装所需包：

```shell
npm install express
npm install @types/express --save-dev
```

- `express` 是 Express 引擎本身，允许我们创建 Web API
- `@types/express` 提供使用 Express 时的类型信息

编辑 `src/app.ts` 文件，添加与 Express 相关的逻辑：

```typescript
import * as express from "express"
import { Request, Response } from "express"

// 创建并设置 Express 应用
const app = express()
app.use(express.json())

// 注册路由
app.get("/users", function (req: Request, res: Response) {
    // 这里写获取所有用户的逻辑
})

app.get("/users/:id", function (req: Request, res: Response) {
    // 这里写根据 id 获取用户的逻辑
})

app.post("/users", function (req: Request, res: Response) {
    // 这里写保存用户的逻辑
})

app.put("/users/:id", function (req: Request, res: Response) {
    // 这里写根据给定用户 id 更新用户的逻辑
})

app.delete("/users/:id", function (req: Request, res: Response) {
    // 这里写根据给定用户 id 删除用户的逻辑
})

// 启动 Express 服务器
app.listen(3000)
```

现在你可以编译并运行项目。
你应该已经启动了一个带有工作路由的 Express 服务器。
不过，这些路由目前还不会返回任何内容。

## 向应用添加 TypeORM

最后，我们给应用添加 TypeORM。
在此示例中，我们使用 `mysql` 驱动。
其他数据库驱动的设置过程类似。

先安装所需包：

```shell
npm install typeorm reflect-metadata mysql
```

- `typeorm` 是 TypeORM 库本身
- `reflect-metadata` 是装饰器正常工作的依赖，记得在 TypeORM 代码之前导入它
- `mysql` 是底层数据库驱动，如果你使用其它数据库，需安装相应的包

创建 `app-data-source.ts`，配置初始数据库连接选项：

```ts
import { DataSource } from "typeorm"

export const myDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "test",
    password: "test",
    database: "test",
    entities: [__dirname + "/entities/**/*{.js,.ts}"],
    logging: true,
    synchronize: true,
})
```

按需配置各选项。
更多选项详情请见 [这里](../data-source/2-data-source-options.md)。

在 `entities` 目录下创建 `user.entity.ts` 实体：

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string
}
```

修改 `src/app.ts` 文件，建立数据库连接并开始使用 `myDataSource`：

```typescript
import "reflect-metadata"

import * as express from "express"
import { Request, Response } from "express"
import { User } from "./entities/User"
import { myDataSource } from "./app-data-source.ts"

// 建立数据库连接
try {
    await myDataSource.initialize()
    console.log("Data Source has been initialized!")
} catch (error) {
    console.error("Error during Data Source initialization:", error)
}

// 创建并设置 Express 应用
const app = express()
app.use(express.json())

// 注册路由
app.get("/users", async function (req: Request, res: Response) {
    const users = await myDataSource.getRepository(User).find()
    res.json(users)
})

app.get("/users/:id", async function (req: Request, res: Response) {
    const results = await myDataSource.getRepository(User).findOneBy({
        id: req.params.id,
    })
    return res.send(results)
})

app.post("/users", async function (req: Request, res: Response) {
    const user = await myDataSource.getRepository(User).create(req.body)
    const results = await myDataSource.getRepository(User).save(user)
    return res.send(results)
})

app.put("/users/:id", async function (req: Request, res: Response) {
    const user = await myDataSource.getRepository(User).findOneBy({
        id: req.params.id,
    })
    myDataSource.getRepository(User).merge(user, req.body)
    const results = await myDataSource.getRepository(User).save(user)
    return res.send(results)
})

app.delete("/users/:id", async function (req: Request, res: Response) {
    const results = await myDataSource.getRepository(User).delete(req.params.id)
    return res.send(results)
})

// 启动 Express 服务器
app.listen(3000)
```

现在，你应该有一个连接到 MySQL 数据库的基本 Express 应用正在运行。