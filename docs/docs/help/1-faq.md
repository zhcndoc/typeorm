# 常见问题解答

## 如何更新数据库模式？

TypeORM 的主要职责之一是保持数据库表与实体同步。
有两种方式可以实现：

- 在数据源选项中使用 `synchronize: true`：

    ```typescript
    import { DataSource } from "typeorm"

    const myDataSource = new DataSource({
        // ...
        synchronize: true,
    })
    ```

    该选项会在每次运行此代码时自动将数据库表与给定实体同步。
    该选项非常适合开发环境，但在生产环境中通常不建议启用。

- 使用命令行工具，手动执行模式同步：

    ```shell
    typeorm schema:sync
    ```

    此命令将执行模式同步。

模式同步非常快速。
如果你考虑在开发时因为性能问题禁用 synchronize 选项，
请先检查它的执行速度。

## 如何更改数据库中的列名？

默认情况下，列名是从属性名生成的。
你可以通过指定 `name` 列选项来轻松更改：

```typescript
@Column({ name: "is_active" })
isActive: boolean;
```

## 如何将默认值设置为某个函数，例如 `NOW()`？

`default` 列选项支持函数。
如果你传入一个返回字符串的函数，
将直接使用该字符串作为默认值，不会对其进行转义。
例如：

```typescript
@Column({ default: () => "NOW()" })
date: Date;
```

## 如何进行验证？

验证不是 TypeORM 的一部分，因为验证是一个独立的过程，
并不直接关联 TypeORM 的职责。
如果需要使用验证，可以使用 [class-validator](https://github.com/pleerock/class-validator) —— 它与 TypeORM 完美配合。

## 关系中的“拥有方”是什么意思？为什么需要使用 `@JoinColumn` 和 `@JoinTable`？

从 `one-to-one` 关系开始。
假设有两个实体：`User` 和 `Photo`：

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToOne()
    photo: Photo
}
```

```typescript
@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string

    @OneToOne()
    user: User
}
```

这个例子中没有 `@JoinColumn`，这是不正确的。
为什么？因为为了实现真正的关联，我们需要在数据库中创建一个列。
需要在 `photo` 表中创建 `userId` 列，或者在 `user` 表中创建 `photoId` 列。
但是应该创建哪个列呢 - `userId` 还是 `photoId`？
TypeORM 无法自动决定。
要做出决定，必须在其中一方使用 `@JoinColumn`。
如果你在 `Photo` 中使用 `@JoinColumn`，则会在 `photo` 表中创建 `userId` 列。
如果在 `User` 中使用 `@JoinColumn`，则会在 `user` 表中创建 `photoId` 列。
带有 `@JoinColumn` 的一方被称为“拥有方（owner side）”。
另一方没有 `@JoinColumn`，称为“反向方（inverse，非拥有方）”。

在 `@ManyToMany` 关系中也是类似的。使用 `@JoinTable` 来标识关系的拥有方。

在 `@ManyToOne` 或 `@OneToMany` 关系中，不需要 `@JoinColumn`，
因为两个装饰器本质不同，带有 `@ManyToOne` 装饰器的表会自动拥有关联列。

`@JoinColumn` 和 `@JoinTable` 装饰器也可用于指定额外的
连接列或连接表的设置，比如连接列名或连接表名。

## 如何在多对多（关联）表中添加额外列？

无法在由多对多关系自动创建的表中添加额外列。
你需要创建一个单独的实体，并通过两个多对一关系与目标实体关联
（效果等同于创建一个多对多表），
然后在该实体中添加额外列。详情请参阅[多对多关系](../relations/4-many-to-many-relations.md#many-to-many-relations-with-custom-properties)。

## 如何处理 TypeScript 编译器的 outDir 选项？

使用 `outDir` 编译选项时，别忘了将应用使用的资源和静态文件复制到输出目录，
否则需要确保这些资源的路径设置正确。

还有一点很重要：当你删除或移动实体时，输出目录中的旧实体文件不会被自动删除。
例如，你创建了一个 `Post` 实体并重命名为 `Blog`，
项目中不再存在 `Post.ts`，但 `Post.js` 文件依然留在输出目录里。
当 TypeORM 读取输出目录中的实体时，会同时看到 `Post` 和 `Blog` 两个实体，
这可能导致错误。
因此，启用 `outDir` 时，建议在删除或移动实体后删除输出目录并重新编译项目。

## 如何在 ts-node 中使用 TypeORM？

你可以使用 [ts-node](https://github.com/TypeStrong/ts-node) 防止每次都编译文件。
使用 ts-node 时，可以在数据源配置中指定 `ts` 实体：

```typescript
{
    entities: [__dirname + "/entities/**/*{.js,.ts}"],
    subscribers: [__dirname + "/subscribers/**/*{.js,.ts}"]
}
```

另外，如果你将 JavaScript 文件编译到和 TypeScript 文件同一目录，
请务必使用 `outDir` 选项以避免
[这个问题](https://github.com/TypeStrong/ts-node/issues/432)。

如果想使用 ts-node CLI，可以这样执行 TypeORM：

```shell
npx typeorm-ts-node-commonjs schema:sync
```

对于 ESM 项目，使用：

```shell
npx typeorm-ts-node-esm schema:sync
```

## 如何为后端使用 Webpack？

Webpack 可能会因缺失某些 require 语句（如 TypeORM 支持的所有驱动）而产生警告。
为抑制这些未用驱动的警告，你需要编辑 webpack 配置：

```javascript
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');

module.exports = {
    ...
    plugins: [
        // 忽略不想使用的驱动。这是所有驱动的完整列表——想用哪个就移除对应的屏蔽。
        new FilterWarningsPlugin({
            exclude: [/mongodb/, /mssql/, /mysql2/, /oracledb/, /pg/, /pg-native/, /pg-query-stream/, /react-native-sqlite-storage/, /redis/, /sqlite3/, /sql.js/, /typeorm-aurora-data-api-driver/]
        })
    ]
};
```

### 打包迁移文件

Webpack 默认会把所有东西打包成一个文件。
如果项目中有迁移文件，须在发布后执行，它们不能被全部打包进单一文件。
为确保所有 [迁移文件](../migrations/01-why.md) 能被 TypeORM 识别和执行，需要对迁移文件单独使用“对象语法”配置 `entry`。

```javascript
const { globSync } = require("node:fs")
const path = require("node:path")

module.exports = {
    // ... 你的webpack配置 ...
    // 动态生成 { [name]: sourceFileName } 键值对用于 entry 选项
    // 将 `src/db/migrations` 改为你迁移文件夹的相对路径
    entry: globSync(path.resolve("src/db/migrations/*.ts")).reduce(
        (entries, filename) => {
            const migrationName = path.basename(filename, ".ts")
            return Object.assign({}, entries, {
                [migrationName]: filename,
            })
        },
        {},
    ),
    resolve: {
        // 假设所有迁移文件都是 TypeScript
        extensions: [".ts"],
    },
    output: {
        // 改成你想放置编译后迁移文件的路径
        path: __dirname + "/dist/db/migrations",
        // 重点是使用 UMD（通用模块定义）格式
        libraryTarget: "umd",
        filename: "[name].js",
    },
}
```

此外，自 Webpack 4 起，使用 `mode: 'production'` 时，会默认开启代码优化，包括混淆压缩，这会破坏
[迁移文件](../migrations/01-why.md)，因为 TypeORM 依赖迁移文件名来判断执行状态。
你可以通过配置停用最小化：

```javascript
module.exports = {
    // ... 其他配置 ...
    optimization: {
        minimize: false,
    },
}
```

或者，如果你使用 `UglifyJsPlugin`，可以让它保留类名和函数名：

```javascript
const UglifyJsPlugin = require("uglifyjs-webpack-plugin")

module.exports = {
    // ... 其他配置 ...
    optimization: {
        minimizer: [
            new UglifyJsPlugin({
                uglifyOptions: {
                    keep_classnames: true,
                    keep_fnames: true,
                },
            }),
        ],
    },
}
```

最后，确保你的数据源配置包含了编译后的迁移文件路径：

```javascript
// TypeORM 配置
module.exports = {
    // ...
    migrations: [__dirname + "/migrations/**/*{.js,.ts}"],
}
```

## 如何在 ESM 项目中使用 TypeORM？

确保在项目的 `package.json` 中添加 `"type": "module"`，这样 TypeORM 才会使用 `import(...)` 语法导入文件。

为避免循环依赖问题，实体中关系属性的类型定义请使用 `Relation` 包装类型：

```typescript
@Entity()
export class User {
    @OneToOne(() => Profile, (profile) => profile.user)
    profile: Relation<Profile>
}
```

这样可以防止属性类型在编译后的代码元数据中被保存，从而避免循环依赖。

由于关系类型已经通过 `@OneToOne` 装饰器定义，TypeScript 附加保存的类型元数据变得没有必要。

> 重要提示：不要在非关系列类型上使用 `Relation`