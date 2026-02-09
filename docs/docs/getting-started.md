# 快速开始

TypeORM 是一个可以在 Node.js、浏览器、Cordova、Ionic、React Native、NativeScript、Expo 和 Electron 平台上运行的 [ORM](https://en.wikipedia.org/wiki/Object-relational_mapping)，
并且可用于 TypeScript 和 JavaScript (ES2021)。

它的目标是始终支持最新的 JavaScript 特性，并提供额外功能，
帮助你开发任何使用数据库的应用——从只有少数表的小型应用到具有多个数据库的大型企业应用。

TypeORM 支持的数据库比任何其他 JS/TS ORM 都多：[Google Spanner](./drivers/google-spanner.md)、[Microsoft SqlServer](./drivers/microsoft-sqlserver.md)、[MongoDB](./drivers/mongodb.md)、[MySQL/MariaDB](./drivers/mysql.md)、[Oracle](./drivers/oracle.md)、[Postgres](./drivers/postgres.md)、[SAP HANA](./drivers/sap.md) 和 [SQLite](./drivers/sqlite.md)，以及派生数据库和不同驱动。

TypeORM 支持 [Active Record](./guides/1-active-record-data-mapper.md#what-is-the-active-record-pattern) 和 [Data Mapper](./guides/1-active-record-data-mapper.md#what-is-the-data-mapper-pattern) 模式，
这与目前所有其他 JavaScript ORM 不同，
这意味着你可以以最高效的方式编写高质量、松耦合、可扩展、可维护的应用。

TypeORM 受到其他 ORM 的影响，如 [Hibernate](http://hibernate.org/orm/)、
[Doctrine](http://www.doctrine-project.org/) 和 [Entity Framework](https://www.asp.net/entity-framework)。

## 功能

- 同时支持 [DataMapper](./guides/1-active-record-data-mapper.md#what-is-the-data-mapper-pattern) 和 [ActiveRecord](./guides/1-active-record-data-mapper.md#what-is-the-active-record-pattern)（任选其一）。
- 实体和列。
- 数据库特定的列类型。
- 实体管理器。
- 仓库和自定义仓库。
- 干净的对象关系模型。
- 关联（关系）。
- 急切加载和延迟加载关系。
- 单向、双向和自引用关系。
- 支持多重继承模式。
- 级联操作。
- 索引。
- 事务。
- 支持自动生成的 [迁移](/docs/migrations/why)。
- 连接池。
- 复制。
- 使用多个数据库实例。
- 支持多种数据库类型。
- 跨数据库和跨 schema 查询。
- 优雅语法、灵活强大的查询构建器 (QueryBuilder)。
- 左连接和内连接。
- 支持基于连接的正确分页。
- 查询缓存。
- 流式原始结果。
- 日志记录。
- 监听器和订阅器（钩子）。
- 支持闭包表模式。
- 在模型中或单独配置文件中声明 schema。
- 支持 MySQL / MariaDB / Postgres / CockroachDB / SQLite / Microsoft SQL Server / Oracle / SAP Hana / sql.js。
- 支持 MongoDB NoSQL 数据库。
- 适用于 Node.js / 浏览器 / Ionic / Cordova / React Native / NativeScript / Expo / Electron 平台。
- 支持 TypeScript 和 JavaScript。
- 支持 ESM 和 CommonJS。
- 生成的代码高效、灵活、干净且易维护。
- 遵循所有最佳实践。
- CLI。

等等……

使用 TypeORM，你的模型看起来像这样：

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    age: number
}
```

你的领域逻辑看起来像这样：

```typescript
const userRepository = AppDataSource.getRepository(User)

const user = new User()
user.firstName = "Timber"
user.lastName = "Saw"
user.age = 25
await userRepository.save(user)

const allUsers = await userRepository.find()
const firstUser = await userRepository.findOneBy({
    id: 1,
}) // 根据id查找
const timber = await userRepository.findOneBy({
    firstName: "Timber",
    lastName: "Saw",
}) // 根据firstName和lastName查找

await userRepository.remove(timber)
```

或者，如果你更喜欢使用 `ActiveRecord` 实现，也可以这样写：

```typescript
import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from "typeorm"

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    age: number
}
```

对应的领域逻辑是：

```typescript
const user = new User()
user.firstName = "Timber"
user.lastName = "Saw"
user.age = 25
await user.save()

const allUsers = await User.find()
const firstUser = await User.findOneBy({
    id: 1,
})
const timber = await User.findOneBy({
    firstName: "Timber",
    lastName: "Saw",
})

await timber.remove()
```

## 安装

1. 安装 npm 包：

    `npm install typeorm`

2. 你需要安装 `reflect-metadata` shim：

    `npm install reflect-metadata`

    并在应用的全局地方（例如 `app.ts`）导入：

    `import "reflect-metadata"`

3. 你可能还需要安装 Node 类型定义：

    `npm install @types/node --save-dev`

4. 安装数据库驱动：参见各种驱动的安装说明，[mongodb](./drivers/mongodb.md#installation)、[mssql](./drivers/microsoft-sqlserver.md#installation)、[mysql/mariadb](./drivers/mysql.md#installation)、[oracle](./drivers/oracle.md#installation)、[postgres](./drivers/postgres.md#installation)、[sap](./drivers/sap.md#installation)、[spanner](./drivers/google-spanner.md#installation)、[sqlite](./drivers/sqlite.md#installation)。

### TypeScript 配置

确保你使用的 TypeScript 版本为 **4.5** 或更高，并且在 `tsconfig.json` 中启用了以下配置：

```json
"emitDecoratorMetadata": true,
"experimentalDecorators": true,
```

## 快速开始

使用 TypeORM 的 CLI 命令生成启动项目是最快速的方式。
快速开始只适用于 Node.js 应用。
如果使用其他平台，请参考[分步指南](#step-by-step-guide)。

使用 CLI 创建新项目，运行：

```shell
npx typeorm init --name MyProject --database postgres
```

其中 `name` 是你的项目名称，`database` 是你使用的数据库。
数据库可选值为：`mysql`、`mariadb`、`postgres`、`cockroachdb`、`sqlite`、`mssql`、`sap`、`spanner`、`oracle`、`mongodb`、
`cordova`、`react-native`、`expo`、`nativescript`。

该命令将在 `MyProject` 目录生成以下文件：

```text
MyProject
├── src                   // 放置 TypeScript 代码的目录
│   ├── entities          // 存放实体（数据库模型）
│   │   └── User.ts       // 示例实体
│   ├── migrations        // 迁移文件目录
│   ├── data-source.ts    // 数据源及连接配置
│   └── index.ts          // 应用入口
├── .gitignore            // 标准 gitignore 文件
├── package.json          // Node 模块依赖
├── README.md             // 简单的说明文件
└── tsconfig.json         // TypeScript 编译器选项
```

> 你也可以在已有的 Node 项目中运行 `typeorm init`，但请注意，可能会覆盖某些现有文件。

接下来安装新项目依赖：

```shell
cd MyProject
npm install
```

依赖安装完成后，编辑 `data-source.ts` 文件，添加你自己的数据库连接配置：

```ts
export const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "test",
    password: "test",
    database: "test",
    synchronize: true,
    logging: true,
    entities: [Post, Category],
    subscribers: [],
    migrations: [],
})
```

通常你只需配置 `host`、`username`、`password`、`database`，可能还需要 `port`。

配置完成并安装所有依赖后，运行应用：

```shell
npm start
```

这样，你的应用应当成功运行并插入新用户到数据库。
你可以继续开发此项目，集成更多模块，创建更多实体。

> 你可以运行命令 `npx typeorm init --name MyProject --database postgres --module esm` 来生成 ESM 项目。

> 运行命令 `npx typeorm init --name MyProject --database mysql --express` 可以生成带 express 的高级项目。

> 运行命令 `npx typeorm init --name MyProject --database postgres --docker` 可以生成 docker-compose 文件。

## 分步指南

你对 ORM 有什么期待？
首先，你期待它帮你创建数据库表，
并且在查找/插入/更新/删除数据时，不必写大量难维护的 SQL 查询。
本指南将演示如何从零开始配置 TypeORM，实现 ORM 的这些期待。

### 创建模型

数据库操作从创建表开始。
如何让 TypeORM 创建数据库表？
答案是：通过模型。
你的应用中的模型即数据库中的表。

例如，有个 `Photo` 模型：

```typescript
export class Photo {
    id: number
    name: string
    description: string
    filename: string
    views: number
    isPublished: boolean
}
```

你想将照片保存到数据库。
要存储数据，首先需要数据库表，
而数据库表由模型创建生成。
不是所有模型，而是被定义为 _实体_ 的模型。

### 创建实体

_实体_ 是被 `@Entity` 装饰器标记的模型。
这样的模型会被创建为数据库表。
在 TypeORM 中，你随时操作实体。
你可以加载、插入、更新、删除并执行其他操作。

让我们的 `Photo` 模型变成实体：

```typescript
import { Entity } from "typeorm"

@Entity()
export class Photo {
    id: number
    name: string
    description: string
    filename: string
    views: number
    isPublished: boolean
}
```

现在，`Photo` 实体会对应创建数据库表，你可以在应用任意地方操作它。
表创建了，但表怎么能没有列呢？
我们需要为数据表创建若干列。

### 添加表列

给实体的属性添加 `@Column` 装饰器，即可将其变成数据库列：

```typescript
import { Entity, Column } from "typeorm"

@Entity()
export class Photo {
    @Column()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    filename: string

    @Column()
    views: number

    @Column()
    isPublished: boolean
}
```

这样，`photo` 表中会添加 `id`、`name`、`description`、`filename`、`views` 和 `isPublished` 列。
列的数据库类型根据属性类型推断，
比如 `number` 会映射为 `integer`，`string` 会变成 `varchar`，`boolean` 会变成 `bool` 等。
但你可在 `@Column` 装饰器中显式指定数据库支持的任意列类型。

我们生成了数据库表及列，但有一条必须的规则：
每个数据库表都必须有主键列。

### 创建主键列

每个实体**必须**至少有一个主键列。
这是强制要求，无法规避。
要设置表的主键列，使用 `@PrimaryColumn` 装饰器：

```typescript
import { Entity, Column, PrimaryColumn } from "typeorm"

@Entity()
export class Photo {
    @PrimaryColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    filename: string

    @Column()
    views: number

    @Column()
    isPublished: boolean
}
```

### 创建自动生成的主键列

若你希望 id 列为自增类型（自增长 / 序列 / 序列号 / 生成身份列），
请将 `@PrimaryColumn` 改为 `@PrimaryGeneratedColumn`：

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @Column()
    filename: string

    @Column()
    views: number

    @Column()
    isPublished: boolean
}
```

### 列数据类型

接下来，让我们设置正确的数据类型。
默认情况下，字符串映射为 `varchar(255)` （具体根据数据库而定），
数字映射为整数类型。
但我们不想让所有字符串都限制为 255 长度，也不想所有数字都用整数。
可以指定更合适的数据类型：

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        length: 100,
    })
    name: string

    @Column("text")
    description: string

    @Column()
    filename: string

    @Column("double")
    views: number

    @Column()
    isPublished: boolean
}
```

数据库列类型是数据库特定的。
你可以指定数据库支持的任意列类型。
更多详情请查看[这里](./entity/1-entities.md#column-types)。

### 创建新的 `DataSource`

实体创建后，建立 `index.ts` 文件，配置 `DataSource`：

```typescript
import "reflect-metadata"
import { DataSource } from "typeorm"
import { Photo } from "./entity/Photo"

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "root",
    password: "admin",
    database: "test",
    entities: [Photo],
    synchronize: true,
    logging: false,
})

// 初始化连接数据库、注册实体并同步数据库架构
try {
    await AppDataSource.initialize()
} catch (error) {
    console.log(error)
}
```

本示例使用 Postgres，不过你可以使用其他支持的数据库。
使用其他数据库，修改 `type` 选项为相应数据库类型：
`mysql`、`mariadb`、`postgres`、`cockroachdb`、`sqlite`、`mssql`、`oracle`、`sap`、`spanner`、`cordova`、`nativescript`、`react-native`、`expo` 或 `mongodb`。
还请确认使用自己的 `host`、`port`、`username`、`password` 和 `database` 配置。

我们将 Photo 实体加入此数据源的实体列表，
每个连接中你使用的实体都必须注册。

开启 `synchronize` 确保每次运行应用都会同步实体与数据库。

### 运行应用

运行 `index.ts`，将初始化数据库连接并创建 `photo` 表：

```text
+-------------+--------------+----------------------------+
|                         photo                           |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(100) |                            |
| description | text         |                            |
| filename    | varchar(255) |                            |
| views       | int          |                            |
| isPublished | boolean      |                            |
+-------------+--------------+----------------------------+
```

### 创建并插入照片数据

创建新照片并保存到数据库：

```typescript
import { Photo } from "./entity/Photo"
import { AppDataSource } from "./index"

const photo = new Photo()
photo.name = "Me and Bears"
photo.description = "I am near polar bears"
photo.filename = "photo-with-bears.jpg"
photo.views = 1
photo.isPublished = true

await AppDataSource.manager.save(photo)
console.log("照片已保存，照片ID为", photo.id)
```

保存后，实体获得自动生成的 id。
`save` 方法返回的是传入对象的实例本身，不是副本，id 属性被修改后返回。

### 使用实体管理器 Entity Manager

刚才创建并保存了新照片，
我们用的是 `EntityManager` 进行操作。
EntityManager 可操作应用中任何实体。
例如加载所有保存的照片：

```typescript
import { Photo } from "./entity/Photo"
import { AppDataSource } from "./index"

const savedPhotos = await AppDataSource.manager.find(Photo)
console.log("数据库中所有照片：", savedPhotos)
```

`savedPhotos` 是包含数据库数据的 Photo 对象数组。

了解更多关于 [EntityManager](./working-with-entity-manager/1-working-with-entity-manager.md)。

### 使用仓库 Repositories

让我们改用 `Repository` 代替 `EntityManager`。
每个实体均有自己的仓库，管理该实体所有操作。
当频繁操作实体时，仓库更便捷：

```typescript
import { Photo } from "./entity/Photo"
import { AppDataSource } from "./index"

const photo = new Photo()
photo.name = "Me and Bears"
photo.description = "I am near polar bears"
photo.filename = "photo-with-bears.jpg"
photo.views = 1
photo.isPublished = true

const photoRepository = AppDataSource.getRepository(Photo)

await photoRepository.save(photo)
console.log("照片已保存")

const savedPhotos = await photoRepository.find()
console.log("数据库中所有照片：", savedPhotos)
```

更多关于仓库内容见[这里](./working-with-entity-manager/2-working-with-repository.md)。

### 从数据库加载数据

尝试更多读取操作：

```typescript
import { Photo } from "./entity/Photo"
import { AppDataSource } from "./index"

const photoRepository = AppDataSource.getRepository(Photo)
const allPhotos = await photoRepository.find()
console.log("数据库中所有照片：", allPhotos)

const firstPhoto = await photoRepository.findOneBy({
    id: 1,
})
console.log("数据库中第一张照片：", firstPhoto)

const meAndBearsPhoto = await photoRepository.findOneBy({
    name: "Me and Bears",
})
console.log("数据库中'Me and Bears'照片：", meAndBearsPhoto)

const allViewedPhotos = await photoRepository.findBy({ views: 1 })
console.log("所有浏览次数为1的照片：", allViewedPhotos)

const allPublishedPhotos = await photoRepository.findBy({ isPublished: true })
console.log("所有已发布照片：", allPublishedPhotos)

const [photos, photosCount] = await photoRepository.findAndCount()
console.log("所有照片：", photos)
console.log("照片数量：", photosCount)
```

### 更新数据库

加载单条照片数据，更新后保存：

```typescript
import { Photo } from "./entity/Photo"
import { AppDataSource } from "./index"

const photoRepository = AppDataSource.getRepository(Photo)
const photoToUpdate = await photoRepository.findOneBy({
    id: 1,
})
photoToUpdate.name = "我、朋友和北极熊"
await photoRepository.save(photoToUpdate)
```

id 为 1 的照片将在数据库中更新。

### 从数据库删除数据

删除照片：

```typescript
import { Photo } from "./entity/Photo"
import { AppDataSource } from "./index"

const photoRepository = AppDataSource.getRepository(Photo)
const photoToRemove = await photoRepository.findOneBy({
    id: 1,
})
await photoRepository.remove(photoToRemove)
```

id 为 1 的照片将从数据库删除。

### 创建一对一关系

创建与另一类一对一关系。
在 `PhotoMetadata.ts` 文件创建新的类，这个类存储照片附加元信息：

```typescript
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
} from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class PhotoMetadata {
    @PrimaryGeneratedColumn()
    id: number

    @Column("int")
    height: number

    @Column("int")
    width: number

    @Column()
    orientation: string

    @Column()
    compressed: boolean

    @Column()
    comment: string

    @OneToOne(() => Photo)
    @JoinColumn()
    photo: Photo
}
```

我们使用了新的 `@OneToOne` 装饰器，建立两个实体间一对一关系。
`@JoinColumn` 表示此实体拥有关系。
关系可为单向或双向，
只有一方持有关系。
拥有关系的一方必须使用 `@JoinColumn`。

运行应用，会看到新建的表，其中包含指向照片的外键列：

```text
+-------------+--------------+----------------------------+
|                     photo_metadata                      |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| height      | int          |                            |
| width       | int          |                            |
| comment     | varchar(255) |                            |
| compressed  | boolean      |                            |
| orientation | varchar(255) |                            |
| photoId     | int          | FOREIGN KEY                |
+-------------+--------------+----------------------------+
```

### 保存一对一关联

保存照片及其元数据并关联：

```typescript
import { Photo } from "./entity/Photo"
import { PhotoMetadata } from "./entity/PhotoMetadata"

// 创建照片
const photo = new Photo()
photo.name = "Me and Bears"
photo.description = "I am near polar bears"
photo.filename = "photo-with-bears.jpg"
photo.views = 1
photo.isPublished = true

// 创建照片元数据
const metadata = new PhotoMetadata()
metadata.height = 640
metadata.width = 480
metadata.compressed = true
metadata.comment = "cybershoot"
metadata.orientation = "portrait"
metadata.photo = photo // 建立关联

// 获取实体仓库
const photoRepository = AppDataSource.getRepository(Photo)
const metadataRepository = AppDataSource.getRepository(PhotoMetadata)

// 先保存照片
await photoRepository.save(photo)

// 照片保存后，保存元数据
await metadataRepository.save(metadata)

console.log(
    "元数据已保存，且数据库中成功创建了元数据和照片的关联",
)
```

### 关系的反向方向

关系可为单向或双向。
当前 PhotoMetadata 和 Photo 关系为单向。
关系拥有者是 PhotoMetadata，Photo 不知道 PhotoMetadata。
这导致难以从 Photo 访问 PhotoMetadata。
解决办法是添加反向关系，使关系双向。
修改实体如下：

```typescript
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
} from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class PhotoMetadata {
    /* ... 其他列 ... */

    @OneToOne(() => Photo, (photo) => photo.metadata)
    @JoinColumn()
    photo: Photo
}
```

```typescript
import { Entity, Column, PrimaryGeneratedColumn, OneToOne } from "typeorm"
import { PhotoMetadata } from "./PhotoMetadata"

@Entity()
export class Photo {
    /* ... 其他列 ... */

    @OneToOne(() => PhotoMetadata, (photoMetadata) => photoMetadata.photo)
    metadata: PhotoMetadata
}
```

`photo => photo.metadata` 是返回关系反向属性名的函数。
这里表明 Photo 类的 `metadata` 属性保存其 PhotoMetadata。
你也可直接传字符串如 `"metadata"` 给 `@OneToOne`。
使用函数形式有助于重构。

`@JoinColumn` 装饰器只能用在关系一侧，装饰所在为关系拥有者，数据库中此侧会存外键列。

### ESM 项目中的关系

在 TypeScript ESM 项目中，应使用 `Relation` 包装类型声明关系属性，
以避免循环依赖。示例：

```typescript
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    JoinColumn,
    Relation,
} from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class PhotoMetadata {
    /* ... 其他列 ... */

    @OneToOne(() => Photo, (photo) => photo.metadata)
    @JoinColumn()
    photo: Relation<Photo>
}
```

```typescript
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToOne,
    Relation,
} from "typeorm"
import { PhotoMetadata } from "./PhotoMetadata"

@Entity()
export class Photo {
    /* ... 其他列 ... */

    @OneToOne(() => PhotoMetadata, (photoMetadata) => photoMetadata.photo)
    metadata: Relation<PhotoMetadata>
}
```

### 加载相关联的对象

加载照片及其元数据，可用 `find*` 方法或 `QueryBuilder`。
先用 `find*` ，传递 `FindOneOptions` / `FindManyOptions`：

```typescript
import { Photo } from "./entity/Photo"
import { PhotoMetadata } from "./entity/PhotoMetadata"
import { AppDataSource } from "./index"

const photoRepository = AppDataSource.getRepository(Photo)
const photos = await photoRepository.find({
    relations: {
        metadata: true,
    },
})
```

如此，photos 中每个照片都包含其元数据。
更多查找选项请看[文档](./working-with-entity-manager/3-find-options.md)。

如果查询复杂，建议用 `QueryBuilder`：

```typescript
import { Photo } from "./entity/Photo"
import { PhotoMetadata } from "./entity/PhotoMetadata"
import { AppDataSource } from "./index"

const photos = await AppDataSource.getRepository(Photo)
    .createQueryBuilder("photo")
    .innerJoinAndSelect("photo.metadata", "metadata")
    .getMany()
```

`QueryBuilder` 允许构造复杂 SQL 查询。
示例中 `"photo"` 和 `"metadata"` 是查询别名。

### 使用级联自动保存关联对象

可以给关系加 cascade 选项，实现保存主对象时自动保存关联对象。
修改 Photo 实体中的 `@OneToOne`：

```typescript
export class Photo {
    // ... 其他列

    @OneToOne(() => PhotoMetadata, (metadata) => metadata.photo, {
        cascade: true,
    })
    metadata: PhotoMetadata
}
```

开启 cascade 后，保存一个 Photo 对象时，关联的 metadata 会自动保存。

示例：

```typescript
import { AppDataSource } from "./index"

// 创建照片对象
const photo = new Photo()
photo.name = "Me and Bears"
photo.description = "I am near polar bears"
photo.filename = "photo-with-bears.jpg"
photo.isPublished = true

// 创建元数据对象
const metadata = new PhotoMetadata()
metadata.height = 640
metadata.width = 480
metadata.compressed = true
metadata.comment = "cybershoot"
metadata.orientation = "portrait"

photo.metadata = metadata // 关联

const photoRepository = AppDataSource.getRepository(Photo)

// 保存照片时同时保存元数据
await photoRepository.save(photo)

console.log("照片与照片元数据均已保存。")
```

注意，此处将 metadata 设置给 photo 的 `metadata` 属性，而不是反过来。
cascade 仅对拥有方生效。

### 创建多对一 / 一对多关系

创建多对一/一对多关系。
假设照片有一个作者，作者可有多张照片。
新建 `Author`：

```typescript
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    OneToMany,
} from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class Author {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToMany(() => Photo, (photo) => photo.author) // 注意这里，Photo 类稍后添加 author 属性
    photos: Photo[]
}
```

`Author` 是关系反向端。
`OneToMany` 总是关系反向，必须配合 `ManyToOne` 存在。

添加关系拥有方到 `Photo`：

```typescript
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm"
import { Author } from "./Author"

@Entity()
export class Photo {
    /* ... 其他列 ... */

    @ManyToOne(() => Author, (author) => author.photos)
    author: Author
}
```

在多对一/一对多中，拥有关系是多对一端，
即持有 `ManyToOne` 的类会保存关联对象的 id。

运行应用后，ORM 会创建 `author` 表：

```text
+-------------+--------------+----------------------------+
|                          author                         |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(255) |                            |
+-------------+--------------+----------------------------+
```

还会在 `photo` 表添加 `authorId` 外键列：

```text
+-------------+--------------+----------------------------+
|                         photo                           |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(255) |                            |
| description | varchar(255) |                            |
| filename    | varchar(255) |                            |
| isPublished | boolean      |                            |
| authorId    | int          | FOREIGN KEY                |
+-------------+--------------+----------------------------+
```

### 创建多对多关系

假设照片可属于多个相册，且相册可含多张照片。
创建 `Album`：

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
} from "typeorm"

@Entity()
export class Album {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToMany(() => Photo, (photo) => photo.albums)
    @JoinTable()
    photos: Photo[]
}
```

`@JoinTable` 标记该端为关系拥有侧。

在 `Photo` 类添加关系反向：

```typescript
export class Photo {
    // ... 其他列

    @ManyToMany(() => Album, (album) => album.photos)
    albums: Album[]
}
```

运行后，会自动生成中间关联表 **album_photos_photo_albums**：

```text
+-------------+--------------+----------------------------+
|                album_photos_photo_albums                |
+-------------+--------------+----------------------------+
| album_id    | int          | PRIMARY KEY FOREIGN KEY    |
| photo_id    | int          | PRIMARY KEY FOREIGN KEY    |
+-------------+--------------+----------------------------+
```

记得在连接配置中注册 `Album` 实体：

```typescript
const options: DataSourceOptions = {
    // ... 其他选项
    entities: [Photo, PhotoMetadata, Author, Album],
}
```

插入相册和照片示例：

```typescript
import { AppDataSource } from "./index"

// 创建几个相册
const album1 = new Album()
album1.name = "Bears"
await AppDataSource.manager.save(album1)

const album2 = new Album()
album2.name = "Me"
await AppDataSource.manager.save(album2)

// 创建照片
const photo = new Photo()
photo.name = "Me and Bears"
photo.description = "I am near polar bears"
photo.filename = "photo-with-bears.jpg"
photo.views = 1
photo.isPublished = true
photo.albums = [album1, album2]
await AppDataSource.manager.save(photo)

// 载入照片及关联的相册
const loadedPhoto = await AppDataSource.getRepository(Photo).findOne({
    where: {
        id: 1,
    },
    relations: {
        albums: true,
    },
})
```

`loadedPhoto` 类似于：

```typescript
{
    id: 1,
    name: "Me and Bears",
    description: "I am near polar bears",
    filename: "photo-with-bears.jpg",
    albums: [{
        id: 1,
        name: "Bears"
    }, {
        id: 2,
        name: "Me"
    }]
}
```

### 使用 QueryBuilder

你可以用 QueryBuilder 构造几乎任意复杂的 SQL 查询。

示例：

```typescript
const photos = await AppDataSource.getRepository(Photo)
    .createQueryBuilder("photo") // "photo" 是别名，必须指定
    .innerJoinAndSelect("photo.metadata", "metadata")
    .leftJoinAndSelect("photo.albums", "album")
    .where("photo.isPublished = true")
    .andWhere("(photo.name = :photoName OR photo.name = :bearName)")
    .orderBy("photo.id", "DESC")
    .skip(5)
    .take(10)
    .setParameters({ photoName: "My", bearName: "Mishka" })
    .getMany()
```

该查询选取所有已发布且名称为 "My" 或 "Mishka" 的照片，
分页从第 5 条到第 15 条，
结果按 id 降序排列，
照片的元数据做内连接，相册做左连接。

你将经常使用 QueryBuilder，详见[文档](./query-builder/1-select-query-builder.md)。

## 示例

请查看 [sample](https://github.com/typeorm/typeorm/tree/master/sample) 目录获取使用示例。

下面是几个可供克隆并启动的仓库：

- [TypeScript 版 TypeORM 示例](https://github.com/typeorm/typescript-example)
- [JavaScript 版 TypeORM 示例](https://github.com/typeorm/javascript-example)
- [JavaScript + Babel 版示例](https://github.com/typeorm/babel-example)
- [TypeScript + SystemJS 浏览器示例](https://github.com/typeorm/browser-example)
- [TypeScript + React 浏览器示例](https://github.com/ItayGarin/typeorm-react-swc)
- [Express + TypeORM 示例](https://github.com/typeorm/typescript-express-example)
- [Koa + TypeORM 示例](https://github.com/typeorm/typescript-koa-example)
- [MongoDB + TypeORM 示例](https://github.com/typeorm/mongo-typescript-example)
- [Cordova + TypeORM 示例](https://github.com/typeorm/cordova-example)
- [Ionic + TypeORM 示例](https://github.com/typeorm/ionic-example)
- [React Native + TypeORM 示例](https://github.com/typeorm/react-native-example)
- [Nativescript-Vue + TypeORM 示例](https://github.com/typeorm/nativescript-vue-typeorm-sample)
- [Nativescript-Angular + TypeORM 示例](https://github.com/betov18x/nativescript-angular-typeorm-example)
- [Electron + JavaScript + TypeORM 示例](https://github.com/typeorm/electron-javascript-example)
- [Electron + TypeScript + TypeORM 示例](https://github.com/typeorm/electron-typescript-example)

## 扩展

这里有一些简化 TypeORM 工作及与其他模块集成的扩展：

- 与 [TypeDI](https://github.com/pleerock/typedi) 集成的 [TypeORM 扩展](https://github.com/typeorm/typeorm-typedi-extensions)
- 与 [routing-controllers](https://github.com/pleerock/routing-controllers) 集成的 [TypeORM 扩展](https://github.com/typeorm/typeorm-routing-controllers-extensions)
- 根据现有数据库生成模型 - [typeorm-model-generator](https://github.com/Kononnable/typeorm-model-generator)
- 夹具加载器 - [typeorm-fixtures-cli](https://github.com/RobinCK/typeorm-fixtures)
- ER图生成器 - [typeorm-uml](https://github.com/eugene-manuilov/typeorm-uml/)
- 另一款 ER 图生成器 - [erdia](https://www.npmjs.com/package/erdia/)
- 创建、删除和填充数据库 - [typeorm-extension](https://github.com/tada5hi/typeorm-extension)
- 生成迁移/实体后自动更新 `data-source.ts` - [typeorm-codebase-sync](https://www.npmjs.com/package/typeorm-codebase-sync)
- 方便操作 relations - [typeorm-relations](https://npmjs.com/package/typeorm-relations)
- 根据 GraphQL 查询自动生成 relations - [typeorm-relations-graphql](https://npmjs.com/package/typeorm-relations-graphql)

## 贡献

了解贡献指南请看 [贡献说明](https://github.com/typeorm/typeorm/blob/master/CONTRIBUTING.md)；
开发环境搭建请看 [开发者文档](https://github.com/typeorm/typeorm/blob/master/DEVELOPER.md)。

此项目感谢所有贡献者：

<a href="https://github.com/typeorm/typeorm/graphs/contributors"><img src="https://opencollective.com/typeorm/contributors.svg?width=890&showBtn=false" /></a>

## 赞助者

开源工作繁重并消耗时间，如果你想投资 TypeORM 的未来，可以成为赞助者，使核心团队能投入更多时间改进和增加新功能。[成为赞助者](https://opencollective.com/typeorm)

<a href="https://opencollective.com/typeorm" target="_blank"><img src="https://opencollective.com/typeorm/tiers/sponsor.svg?width=890"/></a>

## 金牌赞助者

成为金牌赞助者，获得我们核心贡献者的高级技术支持。[成为金牌赞助者](https://opencollective.com/typeorm)

<a href="https://opencollective.com/typeorm" target="_blank"><img src="https://opencollective.com/typeorm/tiers/gold-sponsor.svg?width=890"/></a>