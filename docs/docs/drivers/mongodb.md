# MongoDB

## MongoDB 支持

TypeORM 提供基础的 MongoDB 支持（Node.js 驱动 **v7 或更高版本**）。

TypeORM 大部分功能是针对关系型数据库的，本页包含所有 MongoDB 特定的功能文档。

## 安装

```shell
npm install mongodb
```

## 数据源选项

- `appName` - 创建此 MongoClient 实例的应用程序名称。MongoDB 会在建立每个连接时将此值打印到服务器日志，也会记录在慢查询日志和概要分析集合中。

- `authMechanism` - 设置 MongoDB 用于连接认证的认证机制。

- `authSource` - 指定与用户凭据关联的数据库名称。

- `autoEncryption` - 可选地启用使用中的自动加密。

- `checkServerIdentity` - 验证证书 `cert` 是否颁发给 `hostname`。

- `compressors` - 一个数组或逗号分隔的字符串，指定用于启用客户端与 mongod/mongos 实例间网络压缩的压缩器。

- `connectTimeoutMS` - 尝试连接超时的毫秒数。默认值：`30000`。

- `database` - 数据库名称。

- `directConnection` - 允许驱动程序强制使用包含单个主机的连接字符串，采用单一拓扑类型。

- `driver` - 驱动程序对象，默认值为 `require("mongodb")`。

- `family` - IP 协议族。

- `forceServerObjectId` - 强制服务器分配 \_id 值而非驱动程序分配。默认：`false`。

- `host` - 数据库主机。

- `hostReplicaSet` - 数据库主机副本集。

- `ignoreUndefined` - 指定 BSON 序列化器是否忽略未定义字段。默认：`false`。

- `localThresholdMS` - 选择多个合适 MongoDB 实例时的延迟窗口大小（单位：毫秒）。

- `maxStalenessSeconds` - 指定二级副本允许的最大读取延迟时间（秒），超过此时间客户端将停止使用该节点进行读取操作。最小值为 90 秒。

- `minPoolSize` - 连接池中的最小连接数。

- `monitorCommands` - 为该客户端启用命令监控。

- `noDelay` - TCP 连接禁用延迟。

- `password` - 数据库密码。

- `pkFactory` - 用于生成自定义 \_id 键的主键工厂对象。

- `poolSize` - 连接池中最大连接数，映射至 MongoDB 驱动的 `maxPoolSize` 选项。

- `port` - 数据库主机端口，MongoDB 默认端口为 `27017`。

- `promoteBuffers` - 将二进制 BSON 值提升为原生 Node 缓冲区。默认：`false`。

- `promoteLongs` - 如果 Long 值在 53 位解析范围内，提升为数字。默认值：`true`。

- `promoteValues` - 尽可能将 BSON 值提升为原生类型，若设为 false，则仅接收包装类型。默认值：`true`。

- `proxyHost` - 配置用于创建 TCP 连接的 Socks5 代理主机。

- `proxyPassword` - 当代理需要用户名/密码认证时，配置 Socks5 代理密码。

- `proxyPort` - 配置用于创建 TCP 连接的 Socks5 代理端口。

- `proxyUsername` - 当代理需要用户名/密码认证时，配置 Socks5 代理用户名。

- `raw` - 返回文档结果为原始 BSON 缓冲区。默认值：`false`。

- `readConcern` - 指定集合的读关注级别。

- `readPreference` - 偏好的读偏好。  
    - `ReadPreference.PRIMARY`  
    - `ReadPreference.PRIMARY_PREFERRED`  
    - `ReadPreference.SECONDARY`  
    - `ReadPreference.SECONDARY_PREFERRED`  
    - `ReadPreference.NEAREST`

- `readPreferenceTags` - 以逗号分隔的冒号分隔的键值对形式指定标签文档。

- `replicaSet` - 如果 mongod 是副本集成员，指定副本集的名称。

- `retryWrites` - 启用可重试写操作。

- `serializeFunctions` - 序列化对象上的函数。默认值：`false`。

- `socketTimeoutMS` - 在 socket 上尝试发送或接收的超时时间（毫秒）。默认值：`360000`。

- `tls` - 启用或禁用连接的 TLS/SSL。默认值：`false`。

- `tlsAllowInvalidCertificates` - 绕过对 mongod/mongos 实例所提供证书的验证。默认值：`false`。

- `tlsCAFile` - 指定本地 .pem 文件的位置，该文件包含来自证书颁发机构的根证书链。

- `tlsCertificateKeyFile` - 指定本地 .pem 文件的位置，该文件包含客户端的 TLS/SSL 证书和私钥。

- `tlsCertificateKeyFilePassword` - 指定解密 `tlsCertificateKeyFile` 的密码。

- `url` - 执行连接操作的连接 URL。请注意，其他数据源选项会覆盖 URL 中设置的参数。

- `username` - 数据库用户名。

- `writeConcern` - MongoDB 写关注，用于描述对写操作请求的确认级别。

额外选项可添加到 `extra` 对象中，将直接传递给客户端库。详见 `mongodb` 文档中的 [Connection Options](https://mongodb-node.netlify.app/docs/drivers/node/current/connect/connection-options/)。

## 定义实体和列

定义实体和列几乎与关系数据库中相同，  
主要区别是必须使用 `@ObjectIdColumn`  
而非 `@PrimaryColumn` 或 `@PrimaryGeneratedColumn`。

简单实体示例：

```typescript
import { ObjectId } from "mongodb"
import { Entity, ObjectIdColumn, Column } from "typeorm"

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
import { ObjectId } from "mongodb"
import { Entity, ObjectIdColumn, Column } from "typeorm"

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
import { ObjectId } from "mongodb"
import { Entity, ObjectIdColumn, Column } from "typeorm"

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

await myDataSource.manager.save(user)
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

在集合中创建多个索引，索引规范定义见 [createIndexes](http://docs.mongodb.org/manual/reference/command/createIndexes/)。

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

### `updateMany`

根据筛选条件更新多个文档。

### `updateOne`

根据筛选条件更新单个文档。
