# 使用 CLI

## 安装 CLI

### 如果实体文件是 JavaScript

如果你有本地的 typeorm 版本，确保它与我们将要安装的全局版本匹配。

你可以通过 `npm i -g typeorm` 全局安装 typeorm。
如果你不想安装它，也可以选择每次用命令时使用 `npx typeorm <参数>`。

### 如果实体文件是 TypeScript

此 CLI 工具是用 JavaScript 编写的，并在 node 上运行。如果你的实体文件是 TypeScript，你需要在使用 CLI 前将它们转译为 JavaScript。如果你只使用 JavaScript，可以跳过此部分。

你可以在项目中设置 ts-node 以简化操作，如下：

安装 ts-node：

```shell
npm install ts-node --save-dev
```

在 package.json 的 scripts 部分添加 typeorm 命令：

```json
"scripts": {
    ...
    "typeorm": "typeorm-ts-node-commonjs"
}
```

对于 ESM 项目，改为添加：

```json
"scripts": {
    ...
    "typeorm": "typeorm-ts-node-esm"
}
```

如果你想加载更多模块，比如 [module-alias](https://github.com/ilearnio/module-alias)，可以添加更多 `--require my-module-supporting-register`

然后你可以这样运行命令：

```shell
npm run typeorm migration:run -- -d path-to-datasource-config
```

### 如何阅读文档？

为了减少文档的冗长，以下章节使用全局安装的 typeorm CLI。根据你安装 CLI 的方式，你可以将命令开头的 `typeorm` 替换为 `npx typeorm` 或 `npm run typeorm`。

## 初始化一个新的 TypeORM 项目

你可以创建一个预先配置好的新项目：

```shell
typeorm init
```

它会创建一个包含 TypeORM 基础所需的全部文件：

- .gitignore
- package.json
- README.md
- tsconfig.json
- src/entity/User.ts
- src/index.ts

然后你可以运行 `npm install` 安装所有依赖。
接着通过运行 `npm start` 启动你的应用程序。

所有文件均生成在当前目录。
如果你想在特定目录生成，可以使用 `--name`：

```shell
typeorm init --name my-project
```

如果你想指定特定数据库，可以使用 `--database`：

```shell
typeorm init --database mssql
```

生成基于 ESM 的项目可以使用 `--module esm`：

```shell
typeorm init --name my-project --module esm
```

你也可以生成带有 Express 的基础项目：

```shell
typeorm init --name my-project --express
```

如果你使用 docker，可以生成 `docker-compose.yml` 文件：

```shell
typeorm init --docker
```

`typeorm init` 是设置 TypeORM 项目最简单快捷的方式。

## 创建新实体

你可以使用 CLI 创建新实体：

```shell
typeorm entity:create path-to-entity-dir/entity
```

更多关于 [实体](../entity/1-entities.md) 的内容。

## 创建新的订阅者

你可以使用 CLI 新建订阅者：

```shell
typeorm subscriber:create path-to-subscriber-dir/subscriber
```

更多关于 [订阅者](./4-listeners-and-subscribers.md) 的内容。

## 管理迁移

- `typeorm migration:create` - [创建](../migrations/03-creating.md) 空迁移
- `typeorm migration:generate` - [生成](../migrations/04-generating.md) 迁移，比较实体与当前数据库结构
- `typeorm migration:run` - [执行](../migrations/05-executing.md) 所有迁移
- `typeorm migration:revert` - [回滚](../migrations/06-reverting.md) 上一次迁移
- `typeorm migration:show` - [列出](../migrations/07-status.md) 所有迁移及其执行状态

更多关于 [迁移](../migrations/01-why.md) 的内容。

## 同步数据库模式

同步数据库架构使用：

```shell
typeorm schema:sync
```

在生产环境运行此命令时需谨慎——
如果不谨慎使用，schema sync 可能导致数据丢失。
务必先检查要运行哪些 SQL 查询，再在生产环境执行。

## 记录同步数据库模式的查询但不实际执行

查看 `schema:sync` 将执行哪些 SQL 查询使用：

```shell
typeorm schema:log
```

## 删除数据库模式

完全删除数据库架构使用：

```shell
typeorm schema:drop -- -d path-to-datasource-config
```

在生产环境使用此命令需十分小心，因为它会彻底删除数据库中的数据。

## 执行任意 SQL 查询

你可以直接在数据库中执行任何 SQL 查询：

```shell
typeorm query "SELECT * FROM USERS"
```

## 清除缓存

如果你使用了 `QueryBuilder` 缓存，有时需要清空缓存中的所有内容。
你可以使用以下命令完成：

```shell
typeorm cache:clear
```

## 查看版本

你可以通过运行以下命令查看已安装的 typeorm 版本（包括本地和全局）：

```shell
typeorm version
```