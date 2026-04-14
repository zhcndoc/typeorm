# 关联关系

## 什么是关联关系？

关联关系帮助你轻松处理相关的实体。  
关联关系有几种类型：

- 使用 `@OneToOne` 的 [一对一](./2-one-to-one-relations.md)  
- 使用 `@ManyToOne` 的 [多对一](./3-many-to-one-one-to-many-relations.md)  
- 使用 `@OneToOne` 的 [一对多](./3-many-to-one-one-to-many-relations.md)  
- 使用 `@ManyToMany` 的 [多对多](./4-many-to-many-relations.md)  

## 关联选项

你可以为关联关系指定以下几个选项：

- `eager: boolean` (default: `false`) - 如果设置为 `true`，在使用 `find*` 方法或对该实体使用 `QueryBuilder` 时，关系将始终随主实体一起加载
- `cascade: boolean | ("insert" | "update")[]` (default: `false`) - 如果设置为 `true`，相关对象将在数据库中插入和更新。你也可以指定一个 [级联选项数组](#cascade-options)。
- `onDelete: "RESTRICT"|"CASCADE"|"SET NULL"` (default: `RESTRICT`) - 指定当被引用对象被删除时外键的行为
- `deferrable: "INITIALLY DEFERRED"|"INITIALLY IMMEDIATE"` - 如果设置，外键约束将是可延迟的（例如在提交时验证）。对于多对多关系，这将同时应用于联接表的两个外键。PostgreSQL、better-sqlite3 和 SAP HANA 支持此功能。
- `nullable: boolean` (default: `true`) - 表示此关系的列是否可为空。默认可为空。对于 `ManyToOne` 和拥有 `OneToOne` 关系，设置 `nullable: false` 也会导致 TypeORM 在加载关系时使用 `INNER JOIN` 而不是 `LEFT JOIN`，因为相关实体一定存在。
- `orphanedRowAction: "nullify" | "delete" | "soft-delete" | "disable"` (default: `nullify`) - 当保存父实体（启用了级联）而没有仍在数据库中的子实体时，控制将发生什么。
    - _nullify_ 将移除关系键。如果外键列不可为空，则会删除孤立行，因为它不能被设置为 `null`。
    - _delete_ 将从数据库中删除这些子实体。
    - _soft-delete_ 将标记子实体为软删除。
    - _disable_ 将保持关系完整。要删除，必须使用它们自己的存储库。

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

    // 启用 `cascade` 且 `PostCategory` 尚未插入时，保存 Post 会将两个实体都级联插入到数据库
    @ManyToMany((type) => PostCategory, {
        cascade: true,
    })
    @JoinTable()
    categories: PostCategory[]

    // 设置 `cascade` 为 ["insert"] 时，如果给此关联设置了新的 `PostDetail` 实例，保存 Post 时将自动插入到数据库
    @ManyToMany((type) => PostDetails, (details) => details.posts, {
        cascade: ["insert"],
    })
    @JoinTable()
    details: PostDetails[]

    // 设置 `cascade` 为 ["update"] 时，如果修改了现有的 `PostImage`，保存 Post 时会自动更新数据库
    @ManyToMany((type) => PostImage, (image) => image.posts, {
        cascade: ["update"],
    })
    @JoinTable()
    images: PostImage[]

    // 设置 `cascade` 为 ["insert", "update"] 时，添加新的 `PostInformation` 实例或修改现有实例都会自动插入或更新
    @ManyToMany((type) => PostInformation, (information) => information.posts, {
        cascade: ["insert", "update"],
    })
    @JoinTable()
    informations: PostInformation[]
}
```

:::note Cascade remove
当使用 `cascade: ["remove"]` 或 `cascade: true` 时，调用 `manager.remove(entity)` 也会删除该实体上已加载的相关实体。TypeORM 仅遍历对象上已加载的关系——如果关系未加载，其子实体不会被级联删除。确保在删除前加载关系：

```typescript
const post = await manager.findOne(Post, {
    where: { id: 1 },
    relations: { categories: true },
})
await manager.remove(post) // categories 也会被删除
```

:::

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

> **注意：** 当使用复合 `@JoinColumn` 或 `@JoinTable` 时，TypeORM 会自动对外键列进行排序，以匹配被引用实体的主键顺序。这确保了与 MySQL、MSSQL 和 SAP HANA 等数据库的兼容性，这些数据库要求外键列按索引顺序引用主键列。

## `@JoinTable` 选项

`@JoinTable` 用于多对多关系，描述"连接表"的列。  
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
