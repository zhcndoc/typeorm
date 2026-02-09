# 关联关系

## 什么是关联关系？

关联关系帮助你轻松处理相关的实体。  
关联关系有几种类型：

- 使用 `@OneToOne` 的 [一对一](./2-one-to-one-relations.md)  
- 使用 `@ManyToOne` 的 [多对一](./3-many-to-one-one-to-many-relations.md)  
- 使用 `@OneToMany` 的 [一对多](./3-many-to-one-one-to-many-relations.md)  
- 使用 `@ManyToMany` 的 [多对多](./4-many-to-many-relations.md)  

## 关联选项

你可以为关联关系指定以下几个选项：

- `eager: boolean`（默认值：`false`） - 设置为 `true` 时，使用 `find*` 方法或此实体的 `QueryBuilder` 查询时，关联总是会和主实体一起加载。  
- `cascade: boolean | ("insert" | "update")[]`（默认值：`false`） - 设置为 `true` 时，相关联对象会自动插入和更新到数据库。你也可以指定一个 [cascade 选项数组](#cascade-选项)。  
- `onDelete: "RESTRICT"|"CASCADE"|"SET NULL"` （默认值：`RESTRICT`）- 指定当引用对象被删除时，外键应如何处理。  
- `nullable: boolean`（默认值：`true`） - 表示此关联的列是否可以为 null，默认允许为 null。  
- `orphanedRowAction: "nullify" | "delete" | "soft-delete" | "disable"`（默认值：`disable`） - 当启用级联保存父实体，但数据库中还存在未关联的子实体时，控制这些子实体该如何处理。  
  - _delete_ 会将这些子实体从数据库删除。  
  - _soft-delete_ 会将子实体标记为软删除。  
  - _nullify_ 会移除关联键。  
  - _disable_ 会保持关联，删除时需使用子实体自己的仓库方法。

## 级联操作示例

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm"
import { Question } from "./Question"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToMany((type) => Question, (question) => question.categories)
    questions: Question[]
}
```

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
} from "typeorm"
import { Category } from "./Category"

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    text: string

    @ManyToMany((type) => Category, (category) => category.questions, {
        cascade: true,
    })
    @JoinTable()
    categories: Category[]
}
```

```typescript
const category1 = new Category()
category1.name = "ORMs"

const category2 = new Category()
category2.name = "Programming"

const question = new Question()
question.title = "如何提问？"
question.text = "我可以在哪里提问 TypeORM 相关的问题？"
question.categories = [category1, category2]
await dataSource.manager.save(question)
```

如你所见，在这个示例中我们没有调用 `category1` 和 `category2` 的 `save` 方法。  
它们会被自动插入，因为我们将 `cascade` 设置为了 `true`。

请牢记——强大的功能伴随着强大的责任。  
级联操作看起来是处理关联的简便方式，  
但也可能导致数据库存入了意料之外的对象，进而引入 BUG 和安全隐患。  
另外，级联存储对象会使得代码中存入数据库的行为不够显式。

### 级联选项

`cascade` 可以设置为 `boolean` 类型或表示级联操作的选项数组 `("insert" | "update" | "remove" | "soft-remove" | "recover")[]`。

默认值为 `false`，表示不启用级联。  
设置 `cascade: true` 会启用全部级联操作。你也可以通过传入数组指定具体选项。

例如：

```typescript
@Entity(Post)
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    text: string

    // categories 上启用全部级联操作
    @ManyToMany((type) => PostCategory, {
        cascade: true,
    })
    @JoinTable()
    categories: PostCategory[]

    // 只级联插入：如果给此关联设置了新的 PostDetails 实例，保存 Post 时将自动插入到数据库
    @ManyToMany((type) => PostDetails, (details) => details.posts, {
        cascade: ["insert"],
    })
    @JoinTable()
    details: PostDetails[]

    // 只级联更新：如果对现有 PostImage 做了修改，保存 Post 时会自动更新数据库
    @ManyToMany((type) => PostImage, (image) => image.posts, {
        cascade: ["update"],
    })
    @JoinTable()
    images: PostImage[]

    // 级联插入和更新：有新的 PostInformation 实例或更新现有的，会自动插入或更新
    @ManyToMany((type) => PostInformation, (information) => information.posts, {
        cascade: ["insert", "update"],
    })
    @JoinTable()
    informations: PostInformation[]
}
```

## `@JoinColumn` 选项

`@JoinColumn` 不仅定义了哪一侧包含带有外键的连接列，  
还允许自定义连接列名和被引用的列名。

设置 `@JoinColumn` 时，默认会在数据库中创建一个名为 `属性名 + 被引用列名` 的列。  
例如：

```typescript
@ManyToOne(type => Category)
@JoinColumn() // 对 @ManyToOne 可选，但 @OneToOne 必须
category: Category;
```

上述代码会在数据库中创建名为 `categoryId` 的列。  
如果想自定义数据库中的列名，可以指定 join 列名：

```typescript
@ManyToOne(type => Category)
@JoinColumn({ name: "cat_id" })
category: Category;
```

连接列总是引用其他列（使用外键）。  
默认情况下，关联总是引用被关联实体的主列。  
如果想使用关联实体的其他列建立关联，可以指定：

```typescript
@ManyToOne(type => Category)
@JoinColumn({ referencedColumnName: "name" })
category: Category;
```

关联现在指向 `Category` 实体的 `name` 列，而非 `id`。  
对应关系的列名将变为 `categoryName`。

你也可以连接多个列。需要注意的是多列关系默认不会引用关联实体主列，必须明确指定被引用的列：

```typescript
@ManyToOne(type => Category)
@JoinColumn([
    { name: "category_id", referencedColumnName: "id" },
    { name: "locale_id", referencedColumnName: "locale_id" }
])
category: Category;
```

## `@JoinTable` 选项

`@JoinTable` 用于多对多关系，描述“连接表”的列。  
连接表是 TypeORM 自动创建的特殊单独表，包含指向相关实体的列。  
你可以使用 `@JoinColumn` 修改连接表的列名和对应引用列名，  
同时也可以自定义生成的连接表名称。

```typescript
@ManyToMany(type => Category)
@JoinTable({
    name: "question_categories", // 连接表名称
    joinColumn: {
        name: "question",
        referencedColumnName: "id"
    },
    inverseJoinColumn: {
        name: "category",
        referencedColumnName: "id"
    }
})
categories: Category[];
```

如果目标表有复合主键，必须传入属性数组给 `@JoinTable`。