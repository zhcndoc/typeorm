# 查找选项

## 基本选项

所有仓库和管理器的 `.find*` 方法都接受特殊选项，您可以使用它们进行查询，而无需使用 `QueryBuilder`：

- `select` - 指定必须选择主对象的哪些属性

```typescript
userRepository.find({
    select: {
        firstName: true,
        lastName: true,
    },
})
```

将执行以下查询：

```sql
SELECT "firstName", "lastName" FROM "user"
```

- `relations` - 需要与主实体一起加载的关联关系。子关联关系也可以加载（`join` 和 `leftJoinAndSelect` 的简写）

```typescript
userRepository.find({
    relations: {
        profile: true,
        photos: true,
        videos: true,
    },
})
userRepository.find({
    relations: {
        profile: true,
        photos: true,
        videos: {
            videoAttributes: true,
        },
    },
})
```

将执行以下查询：

```sql
SELECT * FROM "user"
LEFT JOIN "profile" ON "profile"."id" = "user"."profileId"
LEFT JOIN "photos" ON "photos"."id" = "user"."photoId"
LEFT JOIN "videos" ON "videos"."id" = "user"."videoId"

SELECT * FROM "user"
LEFT JOIN "profile" ON "profile"."id" = "user"."profileId"
LEFT JOIN "photos" ON "photos"."id" = "user"."photoId"
LEFT JOIN "videos" ON "videos"."id" = "user"."videoId"
LEFT JOIN "video_attributes" ON "video_attributes"."id" = "videos"."video_attributesId"
```

- `where` - 实体应根据的简单条件进行查询。

```typescript
userRepository.find({
    where: {
        firstName: "Timber",
        lastName: "Saw",
    },
})
```

将执行以下查询：

```sql
SELECT * FROM "user"
WHERE "firstName" = 'Timber' AND "lastName" = 'Saw'
```

查询嵌入式实体中的列应遵循其定义的层级结构。例如：

```typescript
userRepository.find({
    relations: {
        project: true,
    },
    where: {
        project: {
            name: "TypeORM",
            initials: "TORM",
        },
    },
})
```

将执行以下查询：

```sql
SELECT * FROM "user"
LEFT JOIN "project" ON "project"."id" = "user"."projectId"
WHERE "project"."name" = 'TypeORM' AND "project"."initials" = 'TORM'
```

使用 OR 运算符查询：

```typescript
userRepository.find({
    where: [
        { firstName: "Timber", lastName: "Saw" },
        { firstName: "Stan", lastName: "Lee" },
    ],
})
```

将执行以下查询：

```sql
SELECT * FROM "user" WHERE ("firstName" = 'Timber' AND "lastName" = 'Saw') OR ("firstName" = 'Stan' AND "lastName" = 'Lee')
```

- `order` - 选择顺序。

```typescript
userRepository.find({
    order: {
        name: "ASC",
        id: "DESC",
    },
})
```

将执行以下查询：

```sql
SELECT * FROM "user"
ORDER BY "name" ASC, "id" DESC
```

- `withDeleted` - 包括通过 `softDelete` 或 `softRemove` 软删除的实体，例如，其 `@DeleteDateColumn` 列已设置。默认情况下，不包括软删除的实体。

```typescript
userRepository.find({
    withDeleted: true,
})
```

返回多个实体的 `find*` 方法（`find`, `findBy`, `findAndCount`, `findAndCountBy`）还接受以下选项：

- `skip` - 偏移量（分页）从何处开始取实体。

```typescript
userRepository.find({
    skip: 5,
})
```

执行以下查询：

```sql
SELECT * FROM "user"
OFFSET 5
```

- `take` - 限制（分页） - 应取的最大实体数量。

```typescript
userRepository.find({
    take: 10,
})
```

将执行以下查询：

```sql
SELECT * FROM "user"
LIMIT 10
```

\*\* `skip` 和 `take` 应配合使用

\*\* 如果您使用 MSSQL，并想使用 `take` 或 `limit`，需要同时指定 `order`，否则会收到以下错误：`'Invalid usage of the option NEXT in the FETCH statement.'`

```typescript
userRepository.find({
    order: {
        columnName: "ASC",
    },
    skip: 0,
    take: 10,
})
```

将执行以下查询：

```sql
SELECT * FROM "user"
ORDER BY "columnName" ASC
LIMIT 10 OFFSET 0
```

- `cache` - 启用或禁用查询结果缓存。详情及配置见 [缓存](../query-builder/6-caching.md)。

```typescript
userRepository.find({
    cache: true,
})
```

- `lock` - 为查询启用锁机制。仅可用于 `findOne` 和 `findOneBy` 方法。
  `lock` 是一个对象，可以定义为：

```ts
{ mode: "optimistic", version: number | Date }
```

或者

```ts
{
    mode: "pessimistic_read" |
        "pessimistic_write" |
        "dirty_read" |
        /*
            "pessimistic_partial_write" 和 "pessimistic_write_or_fail" 已废弃，
            将在未来版本移除。

            请使用 onLocked 替代。
         */
        "pessimistic_partial_write" |
        "pessimistic_write_or_fail" |
        "for_no_key_update" |
        "for_key_share",

    tables: string[],
    onLocked: "nowait" | "skip_locked"
}
```

例如：

```typescript
userRepository.findOne({
    where: {
        id: 1,
    },
    lock: { mode: "optimistic", version: 1 },
})
```

更多信息见 [锁模式](../query-builder/1-select-query-builder.md#lock-modes)

查找选项完整示例：

```typescript
userRepository.find({
    select: {
        firstName: true,
        lastName: true,
    },
    relations: {
        profile: true,
        photos: true,
        videos: true,
    },
    where: {
        firstName: "Timber",
        lastName: "Saw",
        profile: {
            userName: "tshaw",
        },
    },
    order: {
        name: "ASC",
        id: "DESC",
    },
    skip: 5,
    take: 10,
    cache: true,
})
```

无参数查找：

```ts
userRepository.find()
```

将执行以下查询：

```sql
SELECT * FROM "user"
```

## 高级选项

TypeORM 提供许多内置操作符，可用于创建更复杂的比较：

- `Not`

```ts
import { Not } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    title: Not("About #1"),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "title" != 'About #1'
```

- `LessThan`

```ts
import { LessThan } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    likes: LessThan(10),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "likes" < 10
```

- `LessThanOrEqual`

```ts
import { LessThanOrEqual } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    likes: LessThanOrEqual(10),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "likes" <= 10
```

- `MoreThan`

```ts
import { MoreThan } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    likes: MoreThan(10),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "likes" > 10
```

- `MoreThanOrEqual`

```ts
import { MoreThanOrEqual } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    likes: MoreThanOrEqual(10),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "likes" >= 10
```

- `Equal`

```ts
import { Equal } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    title: Equal("About #2"),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "title" = 'About #2'
```

- `Like`

```ts
import { Like } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    title: Like("%out #%"),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "title" LIKE '%out #%'
```

- `ILike`

```ts
import { ILike } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    title: ILike("%out #%"),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "title" ILIKE '%out #%'
```

- `Between`

```ts
import { Between } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    likes: Between(1, 10),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "likes" BETWEEN 1 AND 10
```

- `In`

```ts
import { In } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    title: In(["About #2", "About #3"]),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "title" IN ('About #2','About #3')
```

- `Any`

```ts
import { Any } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    title: Any(["About #2", "About #3"]),
})
```

将执行以下查询（Postgres 语法）：

```sql
SELECT * FROM "post" WHERE "title" = ANY(['About #2','About #3'])
```

- `IsNull`

```ts
import { IsNull } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    title: IsNull(),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "title" IS NULL
```

- `ArrayContains`

```ts
import { ArrayContains } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    categories: ArrayContains(["TypeScript"]),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "categories" @> '{TypeScript}'
```

- `ArrayContainedBy`

```ts
import { ArrayContainedBy } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    categories: ArrayContainedBy(["TypeScript"]),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "categories" <@ '{TypeScript}'
```

- `ArrayOverlap`

```ts
import { ArrayOverlap } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    categories: ArrayOverlap(["TypeScript"]),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "categories" && '{TypeScript}'
```

- `JsonContains`（仅 PostgreSQL/CockroachDB）

```ts
import { JsonContains } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    metadata: JsonContains({ author: { name: "John" } }),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "metadata" ::jsonb @> '{"author":{"name":"John"}}'
```

- `Raw`

```ts
import { Raw } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    likes: Raw("dislikes - 4"),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "likes" = "dislikes" - 4
```

最简单的情况是，原始查询直接插入在等号后面。
但您也可以通过函数完全重写比较逻辑。

```ts
import { Raw } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    currentDate: Raw((alias) => `${alias} > NOW()`),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "currentDate" > NOW()
```

如果需要提供用户输入，请不要直接在查询中包含用户输入，这可能带来 SQL 注入风险。
而应使用 `Raw` 函数的第二个参数，提供用于绑定查询的参数列表。

```ts
import { Raw } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    currentDate: Raw((alias) => `${alias} > :date`, { date: "2020-10-06" }),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "currentDate" > '2020-10-06'
```

如果需要提供数组类型的用户输入，可以使用特殊表达式语法将其绑定为 SQL 语句中的值列表：

```ts
import { Raw } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    title: Raw((alias) => `${alias} IN (:...titles)`, {
        titles: [
            "Go To Statement Considered Harmful",
            "Structured Programming",
        ],
    }),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "title" IN ('Go To Statement Considered Harmful', 'Structured Programming')
```

## 组合高级选项

您也可以将这些操作符组合使用：

- `Not`

```ts
import { Not, MoreThan, Equal } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    likes: Not(MoreThan(10)),
    title: Not(Equal("About #2")),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE NOT("likes" > 10) AND NOT("title" = 'About #2')
```

- `Or`

```ts
import { Or, Equal, ILike } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    title: Or(Equal("About #2"), ILike("About%")),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE "title" = 'About #2' OR "title" ILIKE 'About%'
```

- `And`

```ts
import { And, Not, Equal, ILike } from "typeorm"

const loadedPosts = await dataSource.getRepository(Post).findBy({
    title: And(Not(Equal("About #2")), ILike("%About%")),
})
```

将执行以下查询：

```sql
SELECT * FROM "post" WHERE NOT("title" = 'About #2') AND "title" ILIKE '%About%'
```