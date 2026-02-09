# MongoDB

## MongoDB 支持

TypeORM 具有基本的 MongoDB 支持。  
TypeORM 大部分功能是针对关系型数据库的，  
本页包含所有 MongoDB 特定的功能文档。

## 安装

```shell
npm install mongodb
```

## 数据源选项

- `url` - 连接 URL，执行连接操作的地址。请注意，其他数据源选项会覆盖 URL 中设置的参数。

- `host` - 数据库主机。

- `port` - 数据库主机端口。MongoDB 默认端口为 `27017`。

- `username` - 数据库用户名（替代 `auth.user`）。

- `password` - 数据库密码（替代 `auth.password`）。

- `database` - 数据库名称。

- `poolSize` - 设置每个服务器或代理连接的最大连接池大小。

- `tls` - 使用 TLS/SSL 连接（需要支持 ssl 的 mongod 服务器，2.4 或更高版本）。默认：`false`。

- `tlsAllowInvalidCertificates` - 指定当服务器的 TLS 证书无效时驱动程序是否生成错误。默认：`false`。

- `tlsCAFile` - 指定本地 .pem 文件的位置，该文件包含来自证书颁发机构的根证书链。

- `tlsCertificateKeyFile` - 指定本地 .pem 文件的位置，该文件包含客户端的 TLS/SSL 证书和密钥。

- `tlsCertificateKeyFilePassword` - 指定解密 `tlsCertificateKeyFile` 的密码。

- `keepAlive` - 启动 TCP 套接字 keepAlive 前等待的毫秒数。默认：`30000`。

- `connectTimeoutMS` - TCP 连接超时时间设置。默认：`30000`。

- `socketTimeoutMS` - TCP 套接字超时时间设置。默认：`360000`。

- `replicaSet` - 要连接的副本集名称。

- `authSource` - 如果数据库认证依赖于其他数据库名称。

- `writeConcern` - 写关注设置。

- `forceServerObjectId` - 强制服务器分配 \_id 值而非驱动程序分配。默认：`false`。

- `serializeFunctions` - 序列化对象上的函数。默认：`false`。

- `ignoreUndefined` - 指定 BSON 序列化器是否忽略未定义字段。默认：`false`。

- `raw` - 返回文档结果为原始 BSON 缓冲区。默认：`false`。

- `promoteLongs` - 如果 Long 值在 53 位解析范围内，提升为数字。默认：`true`。

- `promoteBuffers` - 将二进制 BSON 值提升为原生 Node 缓冲区。默认：`false`。

- `promoteValues` - 尽可能提升 BSON 值为原生类型，设置为 false 则只接收包装类型。默认：`true`。

- `readPreference` - 偏好的读偏好。  
    - `ReadPreference.PRIMARY`  
    - `ReadPreference.PRIMARY_PREFERRED`  
    - `ReadPreference.SECONDARY`  
    - `ReadPreference.SECONDARY_PREFERRED`  
    - `ReadPreference.NEAREST`

- `pkFactory` - 生成自定义 \_id 键的主键工厂对象。

- `readConcern` - 指定集合的读关注。（仅支持 MongoDB 3.2 或更高版本）

- `maxStalenessSeconds` - 为副本集二级读取指定最大延迟秒数，最小值为 90 秒。

- `appName` - 创建此 MongoClient 实例的应用程序名称。MongoDB 3.4 及更新版本会在建立每个连接时将此值打印到服务器日志，也会记录在慢查询日志和概要分析集合中。

- `authMechanism` - 设置 MongoDB 用于连接认证的认证机制。

- `directConnection` - 指定是否强制将所有操作发送到指定主机。

额外选项可添加到 `extra` 对象中，将直接传递给客户端库。详见 `mongodb` 文档中的 [Connection Options](https://mongodb-node.netlify.app/docs/drivers/node/current/connect/connection-options/)。

## 定义实体和列

定义实体和列几乎与关系数据库中相同，  
主要区别是必须使用 `@ObjectIdColumn`  
而非 `@PrimaryColumn` 或 `@PrimaryGeneratedColumn`。

简单实体示例：

```typescript
import { Entity, ObjectId, ObjectIdColumn, Column } from "typeorm"

@Entity()
export class User {
    @ObjectIdColumn()
    _id: ObjectId

    @Column()
    firstName: string

    @Column()
    lastName: string
}
```

以下是启动应用的方式：

```typescript
import { DataSource } from "typeorm"

const myDataSource = new DataSource({
    type: "mongodb",
    host: "localhost",
    port: 27017,
    database: "test",
})
```

## 定义子文档（嵌入文档）

由于 MongoDB 支持对象内部嵌套对象（或文档内嵌文档），  
TypeORM 中也可以这么做：

```typescript
import { Entity, ObjectId, ObjectIdColumn, Column } from "typeorm"

export class Profile {
    @Column()
    about: string

    @Column()
    education: string

    @Column()
    career: string
}
```

```typescript
import { Entity, ObjectId, ObjectIdColumn, Column } from "typeorm"

export class Photo {
    @Column()
    url: string

    @Column()
    description: string

    @Column()
    size: number

    constructor(url: string, description: string, size: number) {
        this.url = url
        this.description = description
        this.size = size
    }
}
```

```typescript
import { Entity, ObjectId, ObjectIdColumn, Column } from "typeorm"

@Entity()
export class User {
    @ObjectIdColumn()
    id: ObjectId

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column((type) => Profile)
    profile: Profile

    @Column((type) => Photo)
    photos: Photo[]
}
```

如果你保存这个实体：

```typescript
import { getMongoManager } from "typeorm"

const user = new User()
user.firstName = "Timber"
user.lastName = "Saw"
user.profile = new Profile()
user.profile.about = "About Trees and Me"
user.profile.education = "Tree School"
user.profile.career = "Lumberjack"
user.photos = [
    new Photo("me-and-trees.jpg", "Me and Trees", 100),
    new Photo("me-and-chakram.jpg", "Me and Chakram", 200),
]

const manager = getMongoManager()
await manager.save(user)
```

以下文档将被保存到数据库：

```json
{
    "firstName": "Timber",
    "lastName": "Saw",
    "profile": {
        "about": "About Trees and Me",
        "education": "Tree School",
        "career": "Lumberjack"
    },
    "photos": [
        {
            "url": "me-and-trees.jpg",
            "description": "Me and Trees",
            "size": 100
        },
        {
            "url": "me-and-chakram.jpg",
            "description": "Me and Chakram",
            "size": 200
        }
    ]
}
```

## 使用 `MongoEntityManager` 和 `MongoRepository`

你可以使用 `EntityManager` 中的大多数方法（关系型数据库特定的方法，如 `query` 和 `transaction` 除外）。  
例如：

```typescript
const timber = await myDataSource.manager.findOneBy(User, {
    firstName: "Timber",
    lastName: "Saw",
})
```

MongoDB 还有一个独立的 `MongoEntityManager`，它继承自 `EntityManager`。

```typescript
const timber = await myDataSource.manager.findOneBy(User, {
    firstName: "Timber",
    lastName: "Saw",
})
```

另一独立类型是扩展了 `Repository` 的 `MongoRepository`：

```typescript
const timber = await myDataSource.getMongoRepository(User).findOneBy({
    firstName: "Timber",
    lastName: "Saw",
})
```

使用 `find()` 的高级选项：

相等查询：

```typescript
const timber = await myDataSource.getMongoRepository(User).find({
    where: {
        firstName: { $eq: "Timber" },
    },
})
```

小于查询：

```typescript
const timber = await myDataSource.getMongoRepository(User).find({
    where: {
        age: { $lt: 60 },
    },
})
```

包含查询：

```typescript
const timber = await myDataSource.getMongoRepository(User).find({
    where: {
        firstName: { $in: ["Timber", "Zhang"] },
    },
})
```

不包含查询：

```typescript
const timber = await myDataSource.getMongoRepository(User).find({
    where: {
        firstName: { $not: { $in: ["Timber", "Zhang"] } },
    },
})
```

或查询：

```typescript
const timber = await myDataSource.getMongoRepository(User).find({
    where: {
        $or: [{ firstName: "Timber" }, { firstName: "Zhang" }],
    },
})
```

子文档查询

```typescript
const users = await myDataSource.getMongoRepository(User).find({
    where: {
        "profile.education": { $eq: "Tree School" },
    },
})
```

数组子文档查询

```typescript
// 查询照片大小小于 500 的用户
const users = await myDataSource.getMongoRepository(User).find({
    where: {
        "photos.size": { $lt: 500 },
    },
})
```

`MongoEntityManager` 和 `MongoRepository` 都包含大量有用的 MongoDB 特定方法：

### `createCursor`

为查询创建游标，用于迭代 MongoDB 返回的结果。

### `createEntityCursor`

为查询创建游标，用于迭代 MongoDB 返回的结果。  
此游标会将结果转换为实体模型的修改版本。

### `aggregate`

针对集合执行聚合框架管道。

### `bulkWrite`

执行批量写入操作（无需流式 API）。

### `count`

统计数据库中匹配查询的文档数量。

### `countDocuments`

统计数据库中匹配查询的文档数量。

### `createCollectionIndex`

在数据库集合上创建索引。

### `createCollectionIndexes`

在集合中创建多个索引，此方法仅支持 MongoDB 2.6 或更高版本。  
旧版本 MongoDB 会抛出“不支持命令”错误。  
索引规范参见 [createIndexes](http://docs.mongodb.org/manual/reference/command/createIndexes/)。

### `deleteMany`

删除多个文档。

### `deleteOne`

删除单个文档。

### `distinct`

返回集合中某个字段的唯一值列表。

### `dropCollectionIndex`

从集合删除一个索引。

### `dropCollectionIndexes`

从集合删除所有索引。

### `findOneAndDelete`

查找并删除一个文档，属于原子操作，执行期间需要写锁。

### `findOneAndReplace`

查找并替换一个文档，属于原子操作，执行期间需要写锁。

### `findOneAndUpdate`

查找并更新一个文档，属于原子操作，执行期间需要写锁。

### `geoHaystackSearch`

使用集合的 geo haystack 索引执行地理搜索。

### `geoNear`

执行 geoNear 命令在集合中搜索项目。

### `group`

在集合上执行 group 命令。

### `collectionIndexes`

获取集合的所有索引。

### `collectionIndexExists`

检查集合中是否存在某个索引。

### `collectionIndexInformation`

获取集合的索引信息。

### `initializeOrderedBulkOp`

初始化“顺序”批量写操作；操作按添加顺序串行执行，且每次类型切换都会新建操作。

### `initializeUnorderedBulkOp`

初始化“非顺序”批量写操作；所有操作缓冲成插入/更新/删除命令，执行顺序不定。

### `insertMany`

插入多个文档。

### `insertOne`

插入单个文档。

### `isCapped`

判断集合是否为固定集合（capped collection）。

### `listCollectionIndexes`

获取集合的所有索引信息列表。

### `parallelCollectionScan`

返回多个并行游标以并行读取集合全部数据。返回结果无序保证。

### `reIndex`

对集合所有索引进行重建。警告：reIndex 是阻塞操作（索引前台重建），大型集合执行缓慢。

### `rename`

重命名已有集合。

### `replaceOne`

替换单个文档。

### `stats`

获取集合的所有统计信息。

### `updateMany`

根据筛选条件更新多个文档。

### `updateOne`

根据筛选条件更新单个文档。