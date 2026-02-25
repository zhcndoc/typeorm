# 装饰器参考

## 实体装饰器

#### `@Entity`

将你的模型标记为实体。实体是被转换为数据库表的类。  
你可以在实体中指定表名：

```typescript
@Entity("users")
export class User {}
```

这段代码会创建一个名为 "users" 的数据库表。

你也可以指定一些额外的实体选项：

- `name` - 表名。如果未指定，则表名从实体类名生成。  
- `database` - 所选数据库服务器中的数据库名。  
- `schema` - 模式名称。  
- `engine` - 创建表时设置的数据库引擎（仅部分数据库支持）。  
- `synchronize` - 标记为 `false` 的实体会被跳过模式更新。  
- `orderBy` - 指定实体的默认排序，当使用 `find` 操作和 `QueryBuilder` 时适用。  

示例：

```typescript
@Entity({
    name: "users",
    engine: "MyISAM",
    database: "example_dev",
    schema: "schema_with_best_tables",
    comment: "This is users table",
    synchronize: false,
    orderBy: {
        name: "ASC",
        id: "DESC",
    },
})
export class User {}
```

了解更多关于[实体](../entity/1-entities.md)。

#### `@ViewEntity`

视图实体是映射到数据库视图的类。

`@ViewEntity()` 接受如下选项：

- `name` - 视图名称。如果未指定，则视图名称从实体类名生成。  
- `database` - 所选数据库服务器中的数据库名。  
- `schema` - 模式名称。  
- `expression` - 视图定义。**必填参数**。  

`expression` 可以是一个包含适当转义列和表的字符串，取决于使用的数据库（示例中为 Postgres）：

```typescript
@ViewEntity({
    expression: `
        SELECT "post"."id" "id", "post"."name" AS "name", "category"."name" AS "categoryName"
        FROM "post" "post"
        LEFT JOIN "category" "category" ON "post"."categoryId" = "category"."id"
    `,
})
export class PostCategory {}
```

或者是一个 QueryBuilder 实例：

```typescript
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
export class PostCategory {}
```

**注意:** 由于驱动限制，不支持参数绑定。请使用字面量参数。

```typescript
@ViewEntity({
    expression: (dataSource: DataSource) =>
        dataSource
            .createQueryBuilder()
            .select("post.id", "id")
            .addSelect("post.name", "name")
            .addSelect("category.name", "categoryName")
            .from(Post, "post")
            .leftJoin(Category, "category", "category.id = post.categoryId")
            .where("category.name = :name", { name: "Cars" }) // <-- 错误写法
            .where("category.name = 'Cars'"), // <-- 正确写法
})
export class PostCategory {}
```

了解更多关于[视图实体](../entity/5-view-entities.md)。

## 列装饰器

#### `@Column`

将实体中的属性标记为表列。  
示例：

```typescript
@Entity("users")
export class User {
    @Column({ primary: true })
    id: number

    @Column({ type: "varchar", length: 200, unique: true })
    firstName: string

    @Column({ nullable: true })
    lastName: string

    @Column({ default: false })
    isActive: boolean
}
```

`@Column` 接受多个可用选项：

- `type: ColumnType` - 列类型。详见[支持的列类型](../entity/1-entities.md#column-types)。  
- `name: string` - 数据库表中的列名。默认由属性名生成，可手动设定。  
- `length: string|number` - 列类型长度。例如 `varchar(150)`，指定列类型和长度。  
- `width: number` - 列类型的显示宽度，仅用于 [MySQL 整数类型](https://dev.mysql.com/doc/refman/5.7/en/integer-types.html)。在新版本 MySQL 中已弃用，将在未来版本 TypeORM 中移除。  
- `onUpdate: string` - `ON UPDATE` 触发器，仅用于 [MySQL](https://dev.mysql.com/doc/refman/5.7/en/timestamp-initialization.html)。  
- `nullable: boolean` - 是否允许该列为 `NULL`，默认 `false`。  
- `update: boolean` - 是否允许通过 "save" 操作更新该列，默认 `true`。若为 `false` ，只能插入时写入字段。  
- `insert: boolean` - 插入时是否设置该列值，默认 `true`。  
- `select: boolean` - 查询时是否默认包含该列，默认 `true`，设为 `false` 时列数据不会在标准查询结果返回。  
- `default: string` - 数据库级别的 `DEFAULT` 值。  
- `primary: boolean` - 将该列标记为主键。等同于 `@PrimaryColumn`。  
- `unique: boolean` - 设置唯一约束，默认 `false`。  
- `comment: string` - 列注释，不是所有数据库均支持。  
- `precision: number` - 小数精度，适用于 decimal 类型，最大存储数字位数。  
- `scale: number` - 小数标度，decimal 类型小数点右边的位数，不能超过 precision。  
- `zerofill: boolean` - MySQL 数字列添加 `ZEROFILL` 属性。启用时 MySQL 自动加上 `UNSIGNED`。在新版本 MySQL 中弃用，将在未来版本 TypeORM 移除。建议改用字符串列和 MySQL 的 `LPAD` 函数。  
- `unsigned: boolean` - MySQL 数字列添加 `UNSIGNED` 属性。  
- `charset: string` - 列字符集，并非所有数据库支持。  
- `collation: string` - 列排序规则。  
- `enum: string[]|AnyEnum` - 用于枚举列类型，指定允许的枚举值列表，可以是字符串数组或枚举类。  
- `enumName: string` - 生成枚举类型的名称。未指定时 TypeORM 会根据实体与列名生成。若在不同表使用同一枚举类型时须指定。  
- `primaryKeyConstraintName: string` - 主键约束名称，不指定则根据表名及列名生成。  
- `asExpression: string` - 生成列表达式，仅支持 [MySQL](https://dev.mysql.com/doc/refman/5.7/en/create-table-generated-columns.html) 和 [Postgres](https://www.postgresql.org/docs/12/ddl-generated-columns.html)。  
- `generatedType: "VIRTUAL"|"STORED"` - 生成列类型，仅使用于 [MySQL](https://dev.mysql.com/doc/refman/5.7/en/create-table-generated-columns.html) 和 [Postgres（仅支持“STORED”）](https://www.postgresql.org/docs/12/ddl-generated-columns.html)。  
- `hstoreType: "object"|"string"` - Postgres `HSTORE` 列的返回类型，字符串或对象。仅 Postgres 支持。  
- `array: boolean` - 用于 Postgres 和 CockroachDB 的数组类型列（例如 int[]）。  
- `transformer: ValueTransformer|ValueTransformer[]` - 用于读写时转换列值的转换器，可为单个或数组，应用顺序为实体到数据库值为自然顺序，反之为倒序。  
- `spatialFeatureType: string` - 可选空间列约束类型（`Point`、`Polygon`、`LineString`、`Geometry`）。未指定默认为 `Geometry`。仅 PostgreSQL 和 CockroachDB 支持。  
- `srid: number` - 空间参考 ID，用作空间列约束，默认 `0`。标准地理坐标对应 [EPSG 4326](http://spatialreference.org/ref/epsg/wgs-84/)。仅 PostgreSQL 和 CockroachDB 支持。  

了解更多关于[实体列](../entity/1-entities.md#entity-columns)。

#### `@PrimaryColumn`

将实体属性标记为主键列。  
功能同 `@Column`，但默认 `primary` 选项为 `true`。

示例：

```typescript
@Entity()
export class User {
    @PrimaryColumn()
    id: number
}
```

`@PrimaryColumn()` 支持自定义主键约束名称：

```typescript
@Entity()
export class User {
    @PrimaryColumn({ primaryKeyConstraintName: "pk_user_id" })
    id: number
}
```

> 注意：多主键时，`primaryKeyConstraintName` 必须对所有主键列相同。

了解更多关于[实体列](../entity/1-entities.md#entity-columns)。

#### `@PrimaryGeneratedColumn`

将实体属性标记为由数据库自动生成的主键列。  
创建的列为主键，值会自动生成。示例：

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number
}
```

支持自定义主键约束名称：

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn({ primaryKeyConstraintName: "pk_user_id" })
    id: number
}
```

有四种生成策略：

- `increment` - 使用 AUTO_INCREMENT / SERIAL / SEQUENCE（依数据库而异）生成递增数字。  
- `identity` - 仅支持 [PostgreSQL 10+](https://www.postgresql.org/docs/13/sql-createtable.html)，生成符合 SQL 标准的 IDENTITY 列。  
- `uuid` - 生成唯一的 `uuid` 字符串。  
- `rowid` - 仅支持 [CockroachDB](https://www.cockroachlabs.com/docs/stable/serial.html)，自动使用 `unique_rowid()` 生成值，该函数基于时间戳和执行节点 ID 生成 64 位整数。  
  > 注意：`rowid` 类型字段必须为 `string` 类型。  

默认生成策略为 `increment`，更改策略请将其作为装饰器第一个参数传入：

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string
}
```

了解更多关于[实体列](../entity/1-entities.md#entity-columns)。

#### `@ObjectIdColumn`

将属性标记为 MongoDB 的 ObjectId。  
该装饰器专用于 MongoDB，每个实体必须有一个 ObjectId 列。  
示例：

```typescript
@Entity()
export class User {
    @ObjectIdColumn()
    id: ObjectId
}
```

了解更多关于[MongoDB](../drivers/mongodb.md)。

#### `@CreateDateColumn`

特殊列，自动设为实体插入时间。  
无需手动赋值，会自动设置。  
示例：

```typescript
@Entity()
export class User {
    @CreateDateColumn()
    createdDate: Date
}
```

#### `@UpdateDateColumn`

特殊列，自动设为实体更新时间。  
每次调用实体管理器或仓库的 `save` 时自动更新，无需手动赋值。  

该列在发生更新冲突的 `upsert` 操作时也会自动更新。

```typescript
@Entity()
export class User {
    @UpdateDateColumn()
    updatedDate: Date
}
```

#### `@DeleteDateColumn`

特殊列，自动设置为实体软删除时间。  
每次调用实体管理器或仓库的软删除操作时自动设置，无需手动赋值。  

TypeORM 的软删除功能利用全局作用域只查询“未删除”的实体。  
若实体带有 `@DeleteDateColumn`，默认作用域即为“未删除”。

```typescript
@Entity()
export class User {
    @DeleteDateColumn()
    deletedDate: Date
}
```

#### `@VersionColumn`

特殊列，实体版本号（递增数值），每次调用实体管理器或仓库的 `save` 时自动更新，无需赋值。  

该列在发生更新冲突的 `upsert` 操作时也自动更新。

```typescript
@Entity()
export class User {
    @VersionColumn()
    version: number
}
```

#### `@Generated`

将列标记为生成值。示例：

```typescript
@Entity()
export class User {
    @Column()
    @Generated("uuid")
    uuid: string
}
```

值只会在插入到数据库之前生成一次。

#### `@VirtualColumn`

特殊列，永远不会保存到数据库，表现为只读属性。  
每次用实体管理器调用 `find` 或 `findOne` 时，值会基于装饰器内的查询函数重新计算。`alias` 参数是底层查询的实体别名。  

示例：

```typescript
@Entity({ name: "companies", alias: "COMP" })
export class Company extends BaseEntity {
    @PrimaryColumn("varchar", { length: 50 })
    name: string

    @VirtualColumn({
        query: (alias) =>
            `SELECT COUNT("name") FROM "employees" WHERE "companyName" = ${alias}.name`,
    })
    totalEmployeesCount: number

    @OneToMany((type) => Employee, (employee) => employee.company)
    employees: Employee[]
}

@Entity({ name: "employees" })
export class Employee extends BaseEntity {
    @PrimaryColumn("varchar", { length: 50 })
    name: string

    @ManyToOne((type) => Company, (company) => company.employees)
    company: Company
}
```

## 关联装饰器

#### `@OneToOne`

一对一关系，例如 `User` 和 `Profile`。  
用户只能有一个资料，资料也只属于一个用户。示例：

```typescript
import { Entity, OneToOne, JoinColumn } from "typeorm"
import { Profile } from "./Profile"

@Entity()
export class User {
    @OneToOne((type) => Profile, (profile) => profile.user)
    @JoinColumn()
    profile: Profile
}
```

了解更多关于[一对一关系](../relations/2-one-to-one-relations.md)。

#### `@ManyToOne`

多对一 / 一对多关系，例如 `User` 和 `Photo`。  
一个用户可以有多张照片，但每张照片只属于一个用户。示例：

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

了解更多关于[多对一 / 一对多关系](../relations/3-many-to-one-one-to-many-relations.md)。

#### `@OneToMany`

多对一 / 一对多关系，例如 `User` 和 `Photo`。  
一个用户可以有多张照片，但每张照片只属于一个用户。示例：

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

了解更多关于[多对一 / 一对多关系](../relations/3-many-to-one-one-to-many-relations.md)。

#### `@ManyToMany`

多对多关系，例如 `Question` 和 `Category`。  
一个问题可以有多个分类，一个分类也可以包含多个问题。示例：

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

    @ManyToMany((type) => Category)
    @JoinTable()
    categories: Category[]
}
```

了解更多关于[多对多关系](../relations/4-many-to-many-relations.md)。

#### `@JoinColumn`

定义关联关系中存放外键的那一方的连接列，允许自定义连接列名、引用列名和外键名称。示例：

```typescript
@Entity()
export class Post {
    @ManyToOne((type) => Category)
    @JoinColumn({
        name: "cat_id",
        referencedColumnName: "name",
        foreignKeyConstraintName: "fk_cat_id",
    })
    category: Category
}
```

#### `@JoinTable`

用于 `many-to-many` 关系，描述“联结”表的连接列。  
“联结表”是由 TypeORM 自动创建的特殊独立表，列引用相关实体。  
你可以通过 `name` 改变联结表名，通过 `joinColumn` 和 `inverseJoinColumn` 自定义联结表内列名、引用列名和外键名称。  
也可以设置 `synchronize: false` 跳过架构更新（和 `@Entity` 相同机制）。  

示例：

```typescript
@Entity()
export class Post {
    @ManyToMany((type) => Category)
    @JoinTable({
        name: "question_categories",
        joinColumn: {
            name: "question",
            referencedColumnName: "id",
            foreignKeyConstraintName: "fk_question_categories_questionId",
        },
        inverseJoinColumn: {
            name: "category",
            referencedColumnName: "id",
            foreignKeyConstraintName: "fk_question_categories_categoryId",
        },
        synchronize: false,
    })
    categories: Category[]
}
```

如果目标表是复合主键，则必须向 `@JoinTable` 传入属性数组。

#### `@RelationId`

加载特定关联的 id （或 ids）到属性。  
例如 `Post` 实体中有关联 `category`，你可以用新属性并加上 `@RelationId` 获取分类 id。示例：

```typescript
@Entity()
export class Post {
    @ManyToOne((type) => Category)
    category: Category

    @RelationId((post: Post) => post.category) // 需要指定目标关联
    categoryId: number
}
```

此功能适用于所有关系类型，包括 `many-to-many`：

```typescript
@Entity()
export class Post {
    @ManyToMany((type) => Category)
    categories: Category[]

    @RelationId((post: Post) => post.categories)
    categoryIds: number[]
}
```

关联 id 仅用于表示。更改该值不会影响真正的关联数据。

## 订阅者和监听器装饰器

#### `@AfterLoad`

可定义实体中的任意命名方法，使用 `@AfterLoad` 标记。每次通过 `QueryBuilder` 或仓库/管理器的 `find` 方法加载实体时，该方法都会被调用。  
示例：

```typescript
@Entity()
export class Post {
    @AfterLoad()
    updateCounters() {
        if (this.likesCount === undefined) this.likesCount = 0
    }
}
```

了解更多关于[监听器](../advanced-topics/4-listeners-and-subscribers.md)。

#### `@BeforeInsert`

定义实体中的任意命名方法，并用 `@BeforeInsert` 标记。  
当实体通过仓库或管理器的 `save` 插入前调用该方法。示例：

```typescript
@Entity()
export class Post {
    @BeforeInsert()
    updateDates() {
        this.createdDate = new Date()
    }
}
```

了解更多关于[监听器](../advanced-topics/4-listeners-and-subscribers.md)。

#### `@AfterInsert`

定义实体中的任意命名方法，并用 `@AfterInsert` 标记。  
实体插入后通过仓库或管理器的 `save` 调用该方法。示例：

```typescript
@Entity()
export class Post {
    @AfterInsert()
    resetCounters() {
        this.counters = 0
    }
}
```

了解更多关于[监听器](../advanced-topics/4-listeners-and-subscribers.md)。

#### `@BeforeUpdate`

定义实体中的任意命名方法，并用 `@BeforeUpdate` 标记。  
当实体通过仓库或管理器的 `save` 更新前调用该方法。示例：

```typescript
@Entity()
export class Post {
    @BeforeUpdate()
    updateDates() {
        this.updatedDate = new Date()
    }
}
```

了解更多关于[监听器](../advanced-topics/4-listeners-and-subscribers.md)。

#### `@AfterUpdate`

定义实体中的任意命名方法，并用 `@AfterUpdate` 标记。  
实体更新后通过仓库或管理器的 `save` 调用该方法。示例：

```typescript
@Entity()
export class Post {
    @AfterUpdate()
    updateCounters() {
        this.counter = 0
    }
}
```

了解更多关于[监听器](../advanced-topics/4-listeners-and-subscribers.md)。

#### `@BeforeRemove`

定义实体中的任意命名方法，并用 `@BeforeRemove` 标记。  
实体通过仓库或管理器的 `remove` 删除前调用该方法。示例：

```typescript
@Entity()
export class Post {
    @BeforeRemove()
    updateStatus() {
        this.status = "removed"
    }
}
```

了解更多关于[监听器](../advanced-topics/4-listeners-and-subscribers.md)。

#### `@AfterRemove`

定义实体中的任意命名方法，并用 `@AfterRemove` 标记。  
实体通过仓库或管理器的 `remove` 删除后调用该方法。示例：

```typescript
@Entity()
export class Post {
    @AfterRemove()
    updateStatus() {
        this.status = "removed"
    }
}
```

了解更多关于[监听器](../advanced-topics/4-listeners-and-subscribers.md)。

#### `@BeforeSoftRemove`

定义实体中的任意命名方法，并用 `@BeforeSoftRemove` 标记。  
实体通过仓库或管理器的 `softRemove` 软删除前调用该方法。示例：

```typescript
@Entity()
export class Post {
    @BeforeSoftRemove()
    updateStatus() {
        this.status = "soft-removed"
    }
}
```

了解更多关于[监听器](../advanced-topics/4-listeners-and-subscribers.md)。

#### `@AfterSoftRemove`

定义实体中的任意命名方法，并用 `@AfterSoftRemove` 标记。  
实体通过仓库或管理器的 `softRemove` 软删除后调用该方法。示例：

```typescript
@Entity()
export class Post {
    @AfterSoftRemove()
    updateStatus() {
        this.status = "soft-removed"
    }
}
```

了解更多关于[监听器](../advanced-topics/4-listeners-and-subscribers.md)。

#### `@BeforeRecover`

定义实体中的任意命名方法，并用 `@BeforeRecover` 标记。  
实体通过仓库或管理器的 `recover` 恢复前调用该方法。示例：

```typescript
@Entity()
export class Post {
    @BeforeRecover()
    updateStatus() {
        this.status = "recovered"
    }
}
```

了解更多关于[监听器](../advanced-topics/4-listeners-and-subscribers.md)。

#### `@AfterRecover`

定义实体中的任意命名方法，并用 `@AfterRecover` 标记。  
实体通过仓库或管理器的 `recover` 恢复后调用该方法。示例：

```typescript
@Entity()
export class Post {
    @AfterRecover()
    updateStatus() {
        this.status = "recovered"
    }
}
```

了解更多关于[监听器](../advanced-topics/4-listeners-and-subscribers.md)。

#### `@EventSubscriber`

标记类为事件订阅者，可监听特定实体事件或所有实体事件。  
事件由 `QueryBuilder` 以及仓库/管理器方法触发。示例：

```typescript
@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Post> {
    /**
     * 指定此订阅者仅监听 Post 事件。
     */
    listenTo() {
        return Post
    }

    /**
     * 在插入 Post 前调用。
     */
    beforeInsert(event: InsertEvent<Post>) {
        console.log(`BEFORE POST INSERTED: `, event.entity)
    }
}
```

你可以实现 `EntitySubscriberInterface` 中的任意方法。  

若想监听所有实体事件，可省略 `listenTo` 方法，并使用 `any`：

```typescript
@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface {
    /**
     * 在实体插入前调用。
     */
    beforeInsert(event: InsertEvent<any>) {
        console.log(`BEFORE ENTITY INSERTED: `, event.entity)
    }
}
```

了解更多关于[订阅者](../advanced-topics/4-listeners-and-subscribers.md)。

## 其他装饰器

#### `@Index`

该装饰器允许你为一个或多个列创建数据库索引，或标记为唯一。  
既可以应用于列，也可以应用于实体。  

当仅需单列索引时，应用于列；当需多列索引时，应用于实体。  

示例：

```typescript
@Entity()
export class User {
    @Index()
    @Column()
    firstName: string

    @Index({ unique: true })
    @Column()
    lastName: string
}
```

```typescript
@Entity()
@Index(["firstName", "lastName"])
@Index(["lastName", "middleName"])
@Index(["firstName", "lastName", "middleName"], { unique: true })
export class User {
    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    middleName: string
}
```

了解更多关于[索引](../advanced-topics/3-indices.md)。

#### `@Unique`

该装饰器允许你为某个或某些列创建唯一约束。  
仅能应用于实体。  
需指定实体字段名（非数据库列名）作为参数。

示例：

```typescript
@Entity()
@Unique(["firstName"])
@Unique(["lastName", "middleName"])
@Unique("UQ_NAMES", ["firstName", "lastName", "middleName"])
export class User {
    @Column({ name: "first_name" })
    firstName: string

    @Column({ name: "last_name" })
    lastName: string

    @Column({ name: "middle_name" })
    middleName: string
}
```

> 注意：MySQL 将唯一约束存储为唯一索引。

#### `@Check`

该装饰器允许你为某个或某些列创建数据库检查约束。  
仅能应用于实体。

示例：

```typescript
@Entity()
@Check(`"firstName" <> 'John' AND "lastName" <> 'Doe'`)
@Check(`"age" > 18`)
export class User {
    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    age: number
}
```

> 注意：MySQL 不支持检查约束。

#### `@Exclusion`

该装饰器允许你为某个或某些列创建数据库排除约束。  
仅能应用于实体。

示例：

```typescript
@Entity()
@Exclusion(`USING gist ("room" WITH =, tsrange("from", "to") WITH &&)`)
export class RoomBooking {
    @Column()
    room: string

    @Column()
    from: Date

    @Column()
    to: Date
}
```

> 注意：仅 PostgreSQL 支持排除约束。

#### `@ForeignKey`

该装饰器允许你为某个或某些列创建数据库外键。  
既可以应用于列，也可以应用于实体。  
单列外键时应用于列；多列外键时应用于实体。  

> 注意：**不要与关联装饰器一起使用。** 外键会自动为你通过关联装饰器（例如 `@ManyToOne`、`@OneToOne` 等）定义的关系生成。  
> 该 `@ForeignKey` 装饰器仅用于当你不想定义等价实体关系时创建数据库外键。

示例：

```typescript
@Entity("orders")
@ForeignKey(() => City, ["cityId", "countryCode"], ["id", "countryCode"])
export class Order {
    @PrimaryColumn()
    id: number

    @Column("uuid", { name: "user_uuid" })
    @ForeignKey<User>("User", "uuid", { name: "FK_user_uuid" })
    userUuid: string

    @Column({ length: 2 })
    @ForeignKey(() => Country, "code")
    countryCode: string

    @Column()
    @ForeignKey("cities")
    cityId: number

    @Column()
    dispatchCountryCode: string

    @ManyToOne(() => Country)
    dispatchCountry: Country

    @Column()
    dispatchCityId: number

    @ManyToOne(() => City)
    dispatchCity: City
}
```

```typescript
@Entity("cities")
@Unique(["id", "countryCode"])
export class City {
    @PrimaryColumn()
    id: number

    @Column({ length: 2 })
    @ForeignKey("countries", { onDelete: "CASCADE", onUpdate: "CASCADE" })
    countryCode: string

    @Column()
    name: string
}
```

```typescript
@Entity("countries")
export class Country {
    @PrimaryColumn({ length: 2 })
    code: string

    @Column()
    name: string
}
```

```typescript
@Entity("users")
export class User {
    @PrimaryColumn({ name: "ref" })
    id: number

    @Column("uuid", { unique: true })
    uuid: string
}
```
