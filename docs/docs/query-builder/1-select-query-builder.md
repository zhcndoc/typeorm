# 使用查询构建器进行选择

## 什么是 QueryBuilder？

`QueryBuilder` 是 TypeORM 最强大的功能之一——  
它允许你使用优雅且方便的语法构建 SQL 查询，  
执行查询并自动转换为实体。

一个简单的 `QueryBuilder` 示例：

```typescript
const firstUser = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.id = :id", { id: 1 })
    .getOne()
```

它生成了如下的 SQL 查询：

```sql
SELECT
    user.id as userId,
    user.firstName as userFirstName,
    user.lastName as userLastName
FROM users user
WHERE user.id = 1
```

并返回一个 `User` 实例：

```javascript
User {
    id: 1,
    firstName: "Timber",
    lastName: "Saw"
}
```

## 使用 `QueryBuilder` 时的重要注意事项

使用 `QueryBuilder` 时，你需要为 `WHERE` 表达式中的参数指定唯一名称。**以下写法不可行**：

```typescript
const result = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.linkedSheep", "linkedSheep")
    .leftJoinAndSelect("user.linkedCow", "linkedCow")
    .where("user.linkedSheep = :id", { id: sheepId })
    .andWhere("user.linkedCow = :id", { id: cowId })
```

... 但这样写就可以：

```typescript
const result = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.linkedSheep", "linkedSheep")
    .leftJoinAndSelect("user.linkedCow", "linkedCow")
    .where("user.linkedSheep = :sheepId", { sheepId })
    .andWhere("user.linkedCow = :cowId", { cowId })
```

注意我们给 `:sheepId` 和 `:cowId` 指定了不同的名称，而不是两次使用 `:id`。

## 如何创建和使用 QueryBuilder？

可以通过多种方式创建 `QueryBuilder`：

- 使用 DataSource：

    ```typescript
    const user = await dataSource
        .createQueryBuilder()
        .select("user")
        .from(User, "user")
        .where("user.id = :id", { id: 1 })
        .getOne()
    ```

- 使用实体管理器：

    ```typescript
    const user = await dataSource.manager
        .createQueryBuilder(User, "user")
        .where("user.id = :id", { id: 1 })
        .getOne()
    ```

- 使用仓库：

    ```typescript
    const user = await dataSource
        .getRepository(User)
        .createQueryBuilder("user")
        .where("user.id = :id", { id: 1 })
        .getOne()
    ```

共有 5 种不同类型的 `QueryBuilder`：

- `SelectQueryBuilder` —— 用于构建和执行 `SELECT` 查询。例如：

    ```typescript
    const user = await dataSource
        .createQueryBuilder()
        .select("user")
        .from(User, "user")
        .where("user.id = :id", { id: 1 })
        .getOne()
    ```

- `InsertQueryBuilder` —— 用于构建和执行 `INSERT` 查询。例如：

    ```typescript
    await dataSource
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([
            { firstName: "Timber", lastName: "Saw" },
            { firstName: "Phantom", lastName: "Lancer" },
        ])
        .execute()
    ```

- `UpdateQueryBuilder` —— 用于构建和执行 `UPDATE` 查询。例如：

    ```typescript
    await dataSource
        .createQueryBuilder()
        .update(User)
        .set({ firstName: "Timber", lastName: "Saw" })
        .where("id = :id", { id: 1 })
        .execute()
    ```

- `DeleteQueryBuilder` —— 用于构建和执行 `DELETE` 查询。例如：

    ```typescript
    await dataSource
        .createQueryBuilder()
        .delete()
        .from(User)
        .where("id = :id", { id: 1 })
        .execute()
    ```

- `RelationQueryBuilder` —— 用于构建和执行关系相关操作 [待定]。例如：

    ```typescript
    await dataSource
        .createQueryBuilder()
        .relation(User, "photos")
        .of(id)
        .loadMany()
    ```

你可以在任何类型的 QueryBuilder 中切换到其它类型，切换后会得到一个新的 QueryBuilder 实例（与其它方法不同）。

## 使用 `QueryBuilder` 获取值

若只想从数据库获取单条结果，比如根据 id 或名称获取用户，需使用 `getOne`：

```typescript
const timber = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.id = :id OR user.name = :name", { id: 1, name: "Timber" })
    .getOne()
```

`getOneOrFail` 也获取单条结果，但无结果时会抛出 `EntityNotFoundError`：

```typescript
const timber = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.id = :id OR user.name = :name", { id: 1, name: "Timber" })
    .getOneOrFail()
```

若想获取多条结果，比如获得所有用户，使用 `getMany`：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .getMany()
```

`SelectQueryBuilder` 返回两种类型的结果：**实体** 或 **原始结果**。  
通常你会选择从数据库中选出真实的实体，如用户，使用 `getOne` 或 `getMany`。  
但有时你只需选取特定数据，比如用户照片总数的 _和_。这类数据不是实体，称为原始数据，可用 `getRawOne` 和 `getRawMany` 获取。例如：

```typescript
const { sum } = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select("SUM(user.photosCount)", "sum")
    .where("user.id = :id", { id: 1 })
    .getRawOne()
```

```typescript
const photosSums = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select("user.id")
    .addSelect("SUM(user.photosCount)", "sum")
    .groupBy("user.id")
    .getRawMany()

// 结果示例：[{ id: 1, sum: 25 }, { id: 2, sum: 13 }, ...]
```

## 获取计数

可以使用 `getCount()` 获取查询返回的行数（数字形式），而非实体：

```typescript
const count = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.name = :name", { name: "Timber" })
    .getCount()
```

生成的 SQL 查询如下：

```sql
SELECT count(*) FROM users user WHERE user.name = 'Timber'
```

## 什么是别名？

我们写了 `createQueryBuilder("user")`，那 `"user"` 是什么？  
它只是普通的 SQL 别名。除选中字段时，我们在各处都使用别名。

`createQueryBuilder("user")` 等价于：

```typescript
createQueryBuilder().select("user").from(User, "user")
```

生成如下 SQL：

```sql
SELECT ... FROM users user
```

这里 `users` 是表名，`user` 是我们给表指定的别名，之后的查询中都会用它：

```typescript
createQueryBuilder()
    .select("user")
    .from(User, "user")
    .where("user.name = :name", { name: "Timber" })
```

产生 SQL：

```sql
SELECT ... FROM users user WHERE user.name = 'Timber'
```

一个 QueryBuilder 不只限于一个别名，可以有多个。  
每个 `SELECT` 可有自己的别名，  
你可以从多张表查询，每张表各自带别名，  
可以连接多张表，且都各有别名。  
使用别名就是访问你选中的表或数据。

## 使用参数避免 SQL 注入

我们用了 `where("user.name = :name", { name: "Timber" })`。  
这里 `{ name: "Timber" }` 是参数，用于防止 SQL 注入。  
我们本可以写成 `where("user.name = '" + name + "')"`，  
但这不安全，会导致 SQL 注入风险。  
安全做法是：

```typescript
where("user.name = :name", { name: "Timber" })
```

`:name` 是参数名，值在对象里指定。

等同于：

```typescript
where("user.name = :name")
.setParameter("name", "Timber")
```

注意：不要在同一查询中用同名参数赋予不同值，否则它们会被覆盖。

还可以传数组，变成 SQL 中的列表，使用特殊展开语法：

```typescript
.where("user.name IN (:...names)", { names: [ "Timber", "Crystal", "Lina" ] })
```

转换为:

```sql
WHERE user.name IN ('Timber', 'Crystal', 'Lina')
```

## 添加 `WHERE` 表达式

添加 `WHERE` 很简单：

```typescript
createQueryBuilder("user").where("user.name = :name", { name: "Timber" })
```

生成：

```sql
SELECT ... FROM users user WHERE user.name = 'Timber'
```

可以往已有的 `WHERE` 用 `AND`：

```typescript
createQueryBuilder("user")
    .where("user.firstName = :firstName", { firstName: "Timber" })
    .andWhere("user.lastName = :lastName", { lastName: "Saw" })
```

生成：

```sql
SELECT ... FROM users user WHERE user.firstName = 'Timber' AND user.lastName = 'Saw'
```

也可以用 `OR`：

```typescript
createQueryBuilder("user")
    .where("user.firstName = :firstName", { firstName: "Timber" })
    .orWhere("user.lastName = :lastName", { lastName: "Saw" })
```

生成：

```sql
SELECT ... FROM users user WHERE user.firstName = 'Timber' OR user.lastName = 'Saw'
```

可以用 `IN` 查询：

```typescript
createQueryBuilder("user").where("user.id IN (:...ids)", { ids: [1, 2, 3, 4] })
```

生成：

```sql
SELECT ... FROM users user WHERE user.id IN (1, 2, 3, 4)
```

可以用 `Brackets` 组合复杂的 `WHERE`：

```typescript
createQueryBuilder("user")
    .where("user.registered = :registered", { registered: true })
    .andWhere(
        new Brackets((qb) => {
            qb.where("user.firstName = :firstName", {
                firstName: "Timber",
            }).orWhere("user.lastName = :lastName", { lastName: "Saw" })
        }),
    )
```

生成：

```sql
SELECT ... FROM users user WHERE user.registered = true AND (user.firstName = 'Timber' OR user.lastName = 'Saw')
```

用 `NotBrackets` 加入带否定的复杂条件：

```typescript
createQueryBuilder("user")
    .where("user.registered = :registered", { registered: true })
    .andWhere(
        new NotBrackets((qb) => {
            qb.where("user.firstName = :firstName", {
                firstName: "Timber",
            }).orWhere("user.lastName = :lastName", { lastName: "Saw" })
        }),
    )
```

生成：

```sql
SELECT ... FROM users user WHERE user.registered = true AND NOT((user.firstName = 'Timber' OR user.lastName = 'Saw'))
```

你能根据需要随意组合 `AND`、`OR`。  
注意，调用多次 `.where` 会覆盖之前的条件。

提示：`orWhere` 与复杂的 `AND`、`OR` 表达式配合时要小心，它们默认没有优先级，需要自行构造合适的字符串避免歧义。

## 添加 `HAVING` 表达式

添加 `HAVING` 同样简单：

```typescript
createQueryBuilder("user").having("user.name = :name", { name: "Timber" })
```

生产：

```sql
SELECT ... FROM users user HAVING user.name = 'Timber'
```

可以添加 `AND`：

```typescript
createQueryBuilder("user")
    .having("user.firstName = :firstName", { firstName: "Timber" })
    .andHaving("user.lastName = :lastName", { lastName: "Saw" })
```

生成：

```sql
SELECT ... FROM users user HAVING user.firstName = 'Timber' AND user.lastName = 'Saw'
```

添加 `OR`：

```typescript
createQueryBuilder("user")
    .having("user.firstName = :firstName", { firstName: "Timber" })
    .orHaving("user.lastName = :lastName", { lastName: "Saw" })
```

生成：

```sql
SELECT ... FROM users user HAVING user.firstName = 'Timber' OR user.lastName = 'Saw'
```

同样地，多次 `.having` 会覆盖之前条件。

## 添加 `ORDER BY` 表达式

简单添加排序：

```typescript
createQueryBuilder("user").orderBy("user.id")
```

生成：

```sql
SELECT ... FROM users user ORDER BY user.id
```

可以指定升降序：

```typescript
createQueryBuilder("user").orderBy("user.id", "DESC")

createQueryBuilder("user").orderBy("user.id", "ASC")
```

添加多个排序条件：

```typescript
createQueryBuilder("user").orderBy("user.name").addOrderBy("user.id")
```

或者用对象形式：

```typescript
createQueryBuilder("user").orderBy({
    "user.name": "ASC",
    "user.id": "DESC",
})
```

再次调用 `.orderBy` 会覆盖之前的排序。

## 添加 `DISTINCT ON` 表达式（仅限 Postgres）

同时使用 distinct-on 和 order-by 时，distinct-on 中的字段必须匹配最左侧的 order-by 字段。  
如果 distinct-on 没有 order-by，结果的第一行是不可预测的。

语法示例如：

```typescript
createQueryBuilder("user").distinctOn(["user.id"]).orderBy("user.id")
```

生成：

```sql
SELECT DISTINCT ON (user.id) ... FROM users user ORDER BY user.id
```

## 添加 `GROUP BY` 表达式

简单添加分组：

```typescript
createQueryBuilder("user").groupBy("user.id")
```

生成：

```sql
SELECT ... FROM users user GROUP BY user.id
```

添加更多分组条件用 `addGroupBy`：

```typescript
createQueryBuilder("user").groupBy("user.name").addGroupBy("user.id")
```

再次调用 `.groupBy` 会覆盖之前所有分组。

## 添加 `LIMIT` 表达式

简单限制数量：

```typescript
createQueryBuilder("user").limit(10)
```

生成：

```sql
SELECT ... FROM users user LIMIT 10
```

不同数据库的查询会不同。  
注意：对于复杂查询（有连接或子查询），`LIMIT` 可能表现不如预期。  
分页推荐使用 `take`。

## 添加 `OFFSET` 表达式

跳过多少行：

```typescript
createQueryBuilder("user").offset(10)
```

生成：

```sql
SELECT ... FROM users user OFFSET 10
```

注意同 `LIMIT`，复杂查询时 `OFFSET` 可能不准，分页建议使用 `skip`。

## 连接关系

假设如下实体：

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToMany((type) => Photo, (photo) => photo.user)
    photos: Photo[]
}
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { User } from "./User"

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string

    @ManyToOne((type) => User, (user) => user.photos)
    user: User
}
```

现在你想加载用户 "Timber"及其所有照片：

```typescript
const user = await createQueryBuilder("user")
    .leftJoinAndSelect("user.photos", "photo")
    .where("user.name = :name", { name: "Timber" })
    .getOne()
```

结果为：

```typescript
{
    id: 1,
    name: "Timber",
    photos: [{
        id: 1,
        url: "me-with-chakram.jpg"
    }, {
        id: 2,
        url: "me-with-trees.jpg"
    }]
}
```

`leftJoinAndSelect` 会自动加载 Timber 的所有照片。  
第一个参数是关联名称，第二个是关联表的别名，可在查询中使用。  
比如查询未被移除的照片：

```typescript
const user = await createQueryBuilder("user")
    .leftJoinAndSelect("user.photos", "photo")
    .where("user.name = :name", { name: "Timber" })
    .andWhere("photo.isRemoved = :isRemoved", { isRemoved: false })
    .getOne()
```

生成：

```sql
SELECT user.*, photo.* FROM users user
    LEFT JOIN photos photo ON photo.user = user.id
    WHERE user.name = 'Timber' AND photo.isRemoved = FALSE
```

你也可以把条件写到连接语句：

```typescript
const user = await createQueryBuilder("user")
    .leftJoinAndSelect("user.photos", "photo", "photo.isRemoved = :isRemoved", {
        isRemoved: false,
    })
    .where("user.name = :name", { name: "Timber" })
    .getOne()
```

生成：

```sql
SELECT user.*, photo.* FROM users user
    LEFT JOIN photos photo ON photo.user = user.id AND photo.isRemoved = FALSE
    WHERE user.name = 'Timber'
```

## 内连接和左连接

如果想用 `INNER JOIN` 而非 `LEFT JOIN`，用 `innerJoinAndSelect`：

```typescript
const user = await createQueryBuilder("user")
    .innerJoinAndSelect(
        "user.photos",
        "photo",
        "photo.isRemoved = :isRemoved",
        { isRemoved: false },
    )
    .where("user.name = :name", { name: "Timber" })
    .getOne()
```

生成：

```sql
SELECT user.*, photo.* FROM users user
    INNER JOIN photos photo ON photo.user = user.id AND photo.isRemoved = FALSE
    WHERE user.name = 'Timber'
```

`INNER JOIN` 不返回没有照片的用户，`LEFT JOIN` 会返回。

更详尽的连接介绍可参考 [SQL 文档](https://msdn.microsoft.com/en-us/library/zt8wzxy4.aspx)。

## 无选择的连接

你也可以连接数据但不选取：

```typescript
const user = await createQueryBuilder("user")
    .innerJoin("user.photos", "photo")
    .where("user.name = :name", { name: "Timber" })
    .getOne()
```

结果是：

```sql
SELECT user.* FROM users user
    INNER JOIN photos photo ON photo.user = user.id
    WHERE user.name = 'Timber'
```

这样只会选中用户，不返回照片。

## 连接任意实体或表

不仅能连接关联实体，也能连接无关联的实体或表，例如：

```typescript
const user = await createQueryBuilder("user")
    .leftJoinAndSelect(Photo, "photo", "photo.userId = user.id")
    .getMany()
```

或者：

```typescript
const user = await createQueryBuilder("user")
    .leftJoinAndSelect("photos", "photo", "photo.userId = user.id")
    .getMany()
```

## 连接并映射功能

给 `User` 实体加个 `profilePhoto` 属性，并用 `QueryBuilder` 把数据映射进来：

```typescript
export class User {
    /// ...
    profilePhoto: Photo
}
```

```typescript
const user = await createQueryBuilder("user")
    .leftJoinAndMapOne(
        "user.profilePhoto",
        "user.photos",
        "photo",
        "photo.isForProfile = TRUE",
    )
    .where("user.name = :name", { name: "Timber" })
    .getOne()
```

它会加载 Timber 的头像照片并赋值到 `user.profilePhoto`。  
若要加载并映射单个实体，使用 `leftJoinAndMapOne`；  
加载多个实体，使用 `leftJoinAndMapMany`。

## 获取生成的查询

有时想看 `QueryBuilder` 生成的 SQL 查询，可用 `getSql`：

```typescript
const sql = createQueryBuilder("user")
    .where("user.firstName = :firstName", { firstName: "Timber" })
    .orWhere("user.lastName = :lastName", { lastName: "Saw" })
    .getSql()
```

调试时可用 `printSql`：

```typescript
const users = await createQueryBuilder("user")
    .where("user.firstName = :firstName", { firstName: "Timber" })
    .orWhere("user.lastName = :lastName", { lastName: "Saw" })
    .printSql()
    .getMany()
```

查询结果会返回用户，同时打印 SQL 到控制台。

## 获取原始结果

`SelectQueryBuilder` 返回两种结果：**实体**和**原始结果**。  
一般用 `getOne` 和 `getMany` 获取实体，但偶尔想获取特定数据（如用户照片总数的和），称作原始数据，使用 `getRawOne` 和 `getRawMany`。示例：

```typescript
const { sum } = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select("SUM(user.photosCount)", "sum")
    .where("user.id = :id", { id: 1 })
    .getRawOne()
```

```typescript
const photosSums = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select("user.id")
    .addSelect("SUM(user.photosCount)", "sum")
    .groupBy("user.id")
    .getRawMany()

// 结果示例：[{ id: 1, sum: 25 }, { id: 2, sum: 13 }, ...]
```

## 流式获取数据

可以用 `stream` 返回数据流，返回的是原始数据，需手动转换为实体：

```typescript
const stream = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.id = :id", { id: 1 })
    .stream()
```

## 使用分页

开发应用时，经常需要分页功能，比如分页控件或无限滚动。

获取前 10 个用户及照片：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.photos", "photo")
    .take(10)
    .getMany()
```

跳过前 10 个用户：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.photos", "photo")
    .skip(10)
    .getMany()
```

组合跳过 5 个，取 10 个：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.photos", "photo")
    .skip(5)
    .take(10)
    .getMany()
```

`take` 和 `skip` 虽然看似 `limit` 和 `offset`，但更安全，避免复杂查询（连接、子查询）中可能出现的问题。

## 设定锁

QueryBuilder 支持乐观锁和悲观锁。

### 锁模式

以下是支持的锁模式及对应 SQL 语句（不支持用空格表示，不支持时会抛出错误）：

```text
|                 | pessimistic_read                  | pessimistic_write       | dirty_read    | pessimistic_partial_write (已弃用，使用 onLocked 代替)          | pessimistic_write_or_fail (已弃用，使用 onLocked 代替)            | for_no_key_update   | for_key_share |
| --------------- | --------------------------------- | ----------------------- | ------------- | -------------------------------------------------------------- | -------------------------------------------------------------- | ------------------- | ------------- |
| MySQL           | FOR SHARE (8+)/LOCK IN SHARE MODE | FOR UPDATE              | (无)          | FOR UPDATE SKIP LOCKED                                         | FOR UPDATE NOWAIT                                              |                     |               |
| Postgres        | FOR SHARE                         | FOR UPDATE              | (无)          | FOR UPDATE SKIP LOCKED                                         | FOR UPDATE NOWAIT                                              | FOR NO KEY UPDATE   | FOR KEY SHARE |
| Oracle          | FOR UPDATE                        | FOR UPDATE              | (无)          |                                                                |                                                                |                     |               |
| SQL Server      | WITH (HOLDLOCK, ROWLOCK)          | WITH (UPDLOCK, ROWLOCK) | WITH (NOLOCK) |                                                                |                                                                |                     |               |
| AuroraDataApi   | LOCK IN SHARE MODE                | FOR UPDATE              | (无)          |                                                                |                                                                |                     |               |
| CockroachDB     |                                  | FOR UPDATE              | (无)          |                                                                | FOR UPDATE NOWAIT                                              | FOR NO KEY UPDATE   |               |
```

使用悲观读锁：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .setLock("pessimistic_read")
    .getMany()
```

使用悲观写锁：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .setLock("pessimistic_write")
    .getMany()
```

使用脏读锁：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .setLock("dirty_read")
    .getMany()
```

使用乐观锁：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .setLock("optimistic", existUser.version)
    .getMany()
```

乐观锁配合 `@Version` 和 `@UpdatedDate` 装饰器使用。

### 锁定表

还可锁定表：

```typescript
const users = await dataSource
    .getRepository(Post)
    .createQueryBuilder("post")
    .leftJoin("post.author", "user")
    .setLock("pessimistic_write", undefined, ["post"])
    .getMany()
```

如果传入锁定表参数，`FOR UPDATE OF` 子句只会锁定指定表。

### `setOnLocked`

控制行被锁时的行为，默认数据库会等待锁释放。

不等待：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .setLock("pessimistic_write")
    .setOnLocked("nowait")
    .getMany()
```

跳过被锁定的行：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .setLock("pessimistic_write")
    .setOnLocked("skip_locked")
    .getMany()
```

数据库对 `setOnLocked` 支持（基于锁模式）：

- Postgres: `pessimistic_read`, `pessimistic_write`, `for_no_key_update`, `for_key_share`  
- MySQL 8+: `pessimistic_read`, `pessimistic_write`  
- MySQL < 8, MariaDB: `pessimistic_write`  
- CockroachDB: `pessimistic_write`（仅 `nowait`）

## 使用自定义索引

仅 MySQL 支持，提供索引名：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .useIndex("my_index") // 索引名
    .getMany()
```

## 最大执行时间

可限制查询执行最大时间，避免服务器卡顿：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .maxExecutionTime(1000) // 毫秒
    .getMany()
```

## 部分选择

只选部分实体属性：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select(["user.id", "user.name"])
    .getMany()
```

只选 `id` 和 `name`。

## 使用子查询

轻松构造子查询，支持 `FROM`、`WHERE`、`JOIN`。

示例：

```typescript
const qb = await dataSource.getRepository(Post).createQueryBuilder("post")

const posts = qb
    .where(
        "post.title IN " +
            qb
                .subQuery()
                .select("user.name")
                .from(User, "user")
                .where("user.registered = :registered")
                .getQuery(),
    )
    .setParameter("registered", true)
    .getMany()
```

更优雅写法：

```typescript
const posts = await dataSource
    .getRepository(Post)
    .createQueryBuilder("post")
    .where((qb) => {
        const subQuery = qb
            .subQuery()
            .select("user.name")
            .from(User, "user")
            .where("user.registered = :registered")
            .getQuery()
        return "post.title IN " + subQuery
    })
    .setParameter("registered", true)
    .getMany()
```

也可先创建子查询 QueryBuilder，再用其 SQL：

```typescript
const userQb = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select("user.name")
    .where("user.registered = :registered", { registered: true })

const posts = await dataSource
    .getRepository(Post)
    .createQueryBuilder("post")
    .where("post.title IN (" + userQb.getQuery() + ")")
    .setParameters(userQb.getParameters())
    .getMany()
```

在 `FROM` 中用子查询：

```typescript
const userQb = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select("user.name", "name")
    .where("user.registered = :registered", { registered: true })

const posts = await dataSource
    .createQueryBuilder()
    .select("user.name", "name")
    .from("(" + userQb.getQuery() + ")", "user")
    .setParameters(userQb.getParameters())
    .getRawMany()
```

或更优雅：

```typescript
const posts = await dataSource
    .createQueryBuilder()
    .select("user.name", "name")
    .from((subQuery) => {
        return subQuery
            .select("user.name", "name")
            .from(User, "user")
            .where("user.registered = :registered", { registered: true })
    }, "user")
    .getRawMany()
```

想作为“第二个 FROM”，用 `addFrom`。

子查询也能在 `SELECT` 中：

```typescript
const posts = await dataSource
    .createQueryBuilder()
    .select("post.id", "id")
    .addSelect((subQuery) => {
        return subQuery.select("user.name", "name").from(User, "user").limit(1)
    }, "name")
    .from(Post, "post")
    .getRawMany()
```

## 隐藏列

实体中若某列有 `select: false`，查询时默认不返回该列。

如：

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column({ select: false })
    password: string
}
```

用普通查询时 `password` 不会返回。  
用以下写法，可返回 `password`：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder()
    .select("user.id", "id")
    .addSelect("user.password")
    .getMany()
```

## 查询已删除的行

实体若使用 `@DeleteDateColumn` 表示软删除，默认查询不会返回被软删除的行。

示例：

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    DeleteDateColumn,
} from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @DeleteDateColumn()
    deletedAt?: Date
}
```

用普通查询不会返回软删除的行。  
加入 `withDeleted` 可查询所有，包括已删除的：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder()
    .select("user.id", "id")
    .withDeleted()
    .getMany()
```

## 公共表表达式

`QueryBuilder` 支持 [公共表表达式](https://en.wikipedia.org/wiki/Hierarchical_and_recursive_queries_in_SQL#Common_table_expression)，前提是数据库版本支持。Oracle 仍不支持。

```typescript
const users = await connection
    .getRepository(User)
    .createQueryBuilder("user")
    .select("user.id", "id")
    .addCommonTableExpression(
        `
      SELECT "userId" FROM "post"
    `,
        "post_users_ids",
    )
    .where(`user.id IN (SELECT "userId" FROM 'post_users_ids')`)
    .getMany()
```

Postgres 中，`InsertQueryBuilder` 或 `UpdateQueryBuilder` 的结果可以用于公共表表达式：

```typescript
const insertQueryBuilder = connection
    .getRepository(User)
    .createQueryBuilder()
    .insert({
        name: "John Smith",
    })
    .returning(["id"])

const users = await connection
    .getRepository(User)
    .createQueryBuilder("user")
    .addCommonTableExpression(insertQueryBuilder, "insert_results")
    .where(`user.id IN (SELECT "id" FROM 'insert_results')`)
    .getMany()
```

## 时间旅行查询

[时间旅行查询](https://www.cockroachlabs.com/blog/time-travel-queries-select-witty_subtitle-the_future/)目前仅支持 `CockroachDB`。

```typescript
const repository = connection.getRepository(Account)

// 创建账户
const account = new Account()
account.name = "John Smith"
account.balance = 100
await repository.save(account)

// 1 小时后更新余额
account.balance = 200
await repository.save(account)

// 输出 { name: "John Smith", balance: "200" }
console.log(account)

// 加载回溯 1 小时之前的账户状态
account = await repository
    .createQueryBuilder("account")
    .timeTravelQuery(`'-1h'`)
    .getOneOrFail()

// 输出 { name: "John Smith", balance: "100" }
console.log(account)
```

`timeTravelQuery()` 默认使用 `follower_read_timestamp()`，无参数时生效。  
更多支持的时间戳参数及信息请参阅  
[CockroachDB 文档](https://www.cockroachlabs.com/docs/stable/as-of-system-time.html)。

## 调试

可调用 `getQuery()` 或 `getQueryAndParameters()` 获取生成的 SQL。

仅查询语句：

```typescript
const sql = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.id = :id", { id: 1 })
    .getQuery()
```

结果：

```sql
SELECT `user`.`id` as `userId`, `user`.`firstName` as `userFirstName`, `user`.`lastName` as `userLastName` FROM `users` `user` WHERE `user`.`id` = ?
```

获取查询和参数数组：

```typescript
const queryAndParams = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .where("user.id = :id", { id: 1 })
    .getQueryAndParameters()
```

结果：

```typescript
;[
    "SELECT `user`.`id` as `userId`, `user`.`firstName` as `userFirstName`, `user`.`lastName` as `userLastName` FROM `users` `user` WHERE `user`.`id` = ?",
    [1],
]
```