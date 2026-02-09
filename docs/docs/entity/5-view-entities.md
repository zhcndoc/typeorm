# 视图实体

## 什么是 ViewEntity？

视图实体是映射到数据库视图的类。  
你可以通过定义一个新类并用 `@ViewEntity()` 标记它来创建视图实体：

`@ViewEntity()` 接受以下选项：

- `name` - 视图名称。如果未指定，则视图名称由实体类名生成。  
- `database` - 选定数据库服务器中的数据库名称。  
- `schema` - 架构名称。  
- `expression` - 视图定义。**必需参数**。  
- `dependsOn` - 当前视图依赖的其他视图列表。如果你的视图在定义时使用了另一个视图，可以将其添加到这里，以便 [迁移](../migrations/01-why.md) 能以正确顺序生成。

`expression` 可以是根据使用的数据库（以下示例为 Postgres）的转义列和表的字符串：

```typescript
@ViewEntity({
    expression: `
        SELECT "post"."id" AS "id", "post"."name" AS "name", "category"."name" AS "categoryName"
        FROM "post" "post"
        LEFT JOIN "category" "category" ON "post"."categoryId" = "category"."id"
    `
})
```

或者是QueryBuilder的实例：

```typescript
@ViewEntity({
    expression: (dataSource: DataSource) => dataSource
        .createQueryBuilder()
        .select("post.id", "id")
        .addSelect("post.name", "name")
        .addSelect("category.name", "categoryName")
        .from(Post, "post")
        .leftJoin(Category, "category", "category.id = post.categoryId")
})
```

**注意：** 由于驱动限制，不支持参数绑定。请使用字面量参数代替。

```typescript
@ViewEntity({
    expression: (dataSource: DataSource) => dataSource
        .createQueryBuilder()
        .select("post.id", "id")
        .addSelect("post.name", "name")
        .addSelect("category.name", "categoryName")
        .from(Post, "post")
        .leftJoin(Category, "category", "category.id = post.categoryId")
        .where("category.name = :name", { name: "Cars" })  // <-- 这是错误的
        .where("category.name = 'Cars'")                   // <-- 这是正确的
})
```

每个视图实体必须在数据源配置中注册：

```typescript
import { DataSource } from "typeorm"
import { UserView } from "./entities/UserView"

const dataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "test",
    password: "test",
    database: "test",
    entities: [UserView],
})
```

## 视图实体的列

为了将视图中的数据映射到正确的实体列，必须使用 `@ViewColumn()` 装饰器标记实体列，并且在查询的 SELECT 语句中将这些列指定为别名。

使用字符串表达式定义的示例：

```typescript
import { ViewEntity, ViewColumn } from "typeorm"

@ViewEntity({
    expression: `
        SELECT "post"."id" AS "id", "post"."name" AS "name", "category"."name" AS "categoryName"
        FROM "post" "post"
        LEFT JOIN "category" "category" ON "post"."categoryId" = "category"."id"
    `,
})
export class PostCategory {
    @ViewColumn()
    id: number

    @ViewColumn()
    name: string

    @ViewColumn()
    categoryName: string
}
```

使用 QueryBuilder 的示例：

```typescript
import { ViewEntity, ViewColumn } from "typeorm"

@ViewEntity({
    expression: (dataSource: DataSource) =>
        dataSource
            .createQueryBuilder()
            .select("post.id", "id")
            .addSelect("post.name", "name")
            .addSelect("category.name", "categoryName")
            .from(Post, "post")
            .leftJoin(Category, "category", "category.id = post.categoryId"),
})
export class PostCategory {
    @ViewColumn()
    id: number

    @ViewColumn()
    name: string

    @ViewColumn()
    categoryName: string
}
```

## 视图列选项

视图列选项定义了视图实体列的额外选项，类似于常规实体的 [列选项](./1-entities.md#column-options)。

你可以在 `@ViewColumn` 中指定视图列选项：

```typescript
@ViewColumn({
    name: "postName",
    // ...
})
name: string;
```

`ViewColumnOptions` 中的可用选项列表：

- `name: string` - 数据库视图中的列名。  
- `transformer: { from(value: DatabaseType): EntityType, to(value: EntityType): DatabaseType }` - 用于从数据库支持的任意类型 `DatabaseType` 反序列化为实体类型 `EntityType`。也支持变换器数组，读取时按相反顺序应用。注意，因为数据库视图是只读的，`transformer.to(value)` 永远不会被使用。

## 物化视图索引

如果使用 `PostgreSQL`，支持为物化视图创建索引。

```typescript
@ViewEntity({
    materialized: true,
    expression: (dataSource: DataSource) =>
        dataSource
            .createQueryBuilder()
            .select("post.id", "id")
            .addSelect("post.name", "name")
            .addSelect("category.name", "categoryName")
            .from(Post, "post")
            .leftJoin(Category, "category", "category.id = post.categoryId"),
})
export class PostCategory {
    @ViewColumn()
    id: number

    @Index()
    @ViewColumn()
    name: string

    @Index("catname-idx")
    @ViewColumn()
    categoryName: string
}
```

但是，目前物化视图的索引只支持唯一索引(`unique`)选项，其他索引选项将被忽略。

```typescript
@Index("name-idx", { unique: true })
@ViewColumn()
name: string
```

## 完整示例

让我们创建两个实体以及包含从这些实体聚合数据的视图：

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string
}
```

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm"
import { Category } from "./Category"

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    categoryId: number

    @ManyToOne(() => Category)
    @JoinColumn({ name: "categoryId" })
    category: Category
}
```

```typescript
import { ViewEntity, ViewColumn, DataSource } from "typeorm"

@ViewEntity({
    expression: (dataSource: DataSource) =>
        dataSource
            .createQueryBuilder()
            .select("post.id", "id")
            .addSelect("post.name", "name")
            .addSelect("category.name", "categoryName")
            .from(Post, "post")
            .leftJoin(Category, "category", "category.id = post.categoryId"),
})
export class PostCategory {
    @ViewColumn()
    id: number

    @ViewColumn()
    name: string

    @ViewColumn()
    categoryName: string
}
```

然后向这些表填充数据，并从 PostCategory 视图请求所有数据：

```typescript
import { Category } from "./entities/Category"
import { Post } from "./entities/Post"
import { PostCategory } from "./entities/PostCategory"

const category1 = new Category()
category1.name = "Cars"
await dataSource.manager.save(category1)

const category2 = new Category()
category2.name = "Airplanes"
await dataSource.manager.save(category2)

const post1 = new Post()
post1.name = "About BMW"
post1.categoryId = category1.id
await dataSource.manager.save(post1)

const post2 = new Post()
post2.name = "About Boeing"
post2.categoryId = category2.id
await dataSource.manager.save(post2)

const postCategories = await dataSource.manager.find(PostCategory)
const postCategory = await dataSource.manager.findOneBy(PostCategory, { id: 1 })
```

`postCategories` 中的结果将是：

```javascript
[ PostCategory { id: 1, name: 'About BMW', categoryName: 'Cars' },
  PostCategory { id: 2, name: 'About Boeing', categoryName: 'Airplanes' } ]
```

而 `postCategory` 是：

```javascript
PostCategory { id: 1, name: 'About BMW', categoryName: 'Cars' }
```