# 实体

## 什么是实体？

实体是映射到数据库表的类（使用 MongoDB 时映射到集合）。
你可以通过定义一个新类并用 `@Entity()` 标记它来创建实体：

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
    isActive: boolean
}
```

这将创建以下数据库表：

```text
+-------------+--------------+----------------------------+
|                          user                           |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| firstName   | varchar(255) |                            |
| lastName    | varchar(255) |                            |
| isActive    | boolean      |                            |
+-------------+--------------+----------------------------+
```

基本实体由列和关系组成。
每个实体**必须**有一个主列（如果使用 MongoDB，则必须有 ObjectId 列）。

每个实体必须在你的数据源选项中注册：

```typescript
import { DataSource } from "typeorm"
import { User } from "./entities/User"

const myDataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "test",
    password: "test",
    database: "test",
    entities: [User],
})
```

或者你可以指定包含所有实体的整个目录，所有实体都会被加载：

```typescript
import { DataSource } from "typeorm"

const dataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "test",
    password: "test",
    database: "test",
    entities: [__dirname + "/entities/**/*{.js,.ts}"],
})
```

如果你想为 `User` 实体使用替代的表名，可以在 `@Entity` 上指定：`@Entity("my_users")`。
如果你想为应用中的所有数据库表设置统一前缀，可以在数据源选项中指定 `entityPrefix`。

使用实体构造函数时，其参数**必须是可选的**。因为 ORM 在从数据库加载时会创建实体类的实例，所以它无法识别你的构造函数参数。

更多关于 `@Entity` 参数的信息请参阅 [装饰器参考](../help/3-decorator-reference.md)。

## 实体列

因为数据库表由列组成，你的实体也必须由列组成。
你在实体类属性上用 `@Column` 标记的每个属性都会映射为数据库表中的列。

### 主列

每个实体必须至少有一个主列。
主列有几种类型：

- `@PrimaryColumn()` 创建一个主列，它可以接受任何类型的值。你可以指定列的类型。如果不指定类型，会从属性类型推断。下面示例将创建一个类型为 `int` 的 id，你必须在保存前手动赋值。

```typescript
import { Entity, PrimaryColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryColumn()
    id: number
}
```

- `@PrimaryGeneratedColumn()` 创建一个主列，值会自动生成一个自增值。它会创建一个带自增（auto-increment）/序列（serial）/自增列（identity）属性的 `int` 列（具体取决于数据库和配置）。你不必在保存前手动赋值，值会自动生成。

```typescript
import { Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number
}
```

- `@PrimaryGeneratedColumn("uuid")` 创建一个主列，值会自动生成一个 `uuid`。Uuid 是一个唯一的字符串 ID。你不必在保存前手动赋值，值会自动生成。

```typescript
import { Entity, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string
}
```

你也可以拥有复合主列：

```typescript
import { Entity, PrimaryColumn } from "typeorm"

@Entity()
export class User {
    @PrimaryColumn()
    firstName: string

    @PrimaryColumn()
    lastName: string
}
```

当你使用 `save` 保存实体时，ORM 总是试图在数据库中查找具有给定实体 ID（或多个 ID）的实体。
如果找到了 ID，对应行会被更新。
如果没有找到对应 ID 的行，则会插入新行。

你可以使用 `manager.findOneBy` 或 `repository.findOneBy` 通过 ID 查找实体。示例：

```typescript
// 使用单主键 ID 查找
const person = await dataSource.manager.findOneBy(Person, { id: 1 })
const person = await dataSource.getRepository(Person).findOneBy({ id: 1 })

// 使用复合主键 ID 查找
const user = await dataSource.manager.findOneBy(User, {
    firstName: "Timber",
    lastName: "Saw",
})
const user = await dataSource.getRepository(User).findOneBy({
    firstName: "Timber",
    lastName: "Saw",
})
```

### 特殊列

有几种特殊列类型带有额外功能：

- `@CreateDateColumn` 是一个特殊列，会自动设置为实体的插入时间。
  你无需设定该列，它会自动设置。

- `@UpdateDateColumn` 是一个特殊列，会自动设置为实体的更新时间，
  每次你调用实体管理器或仓库的 `save`，或者在更新发生时的 `upsert` 操作时都会自动更新。
  你无需设定该列，它会自动设置。

- `@DeleteDateColumn` 是一个特殊列，每次你调用软删除操作时，自动设置为实体的删除时间。你无需设定该列，它会自动设置。如果设置了 `@DeleteDateColumn`，默认查询范围为“未删除”数据。

- `@VersionColumn` 是一个特殊列，每次你调用实体管理器或仓库的 `save`，或者在更新操作的 `upsert` 中自动递增实体版本号（数字）。
  你无需设定该列，它会自动设置。

## 列类型

TypeORM 支持所有最常用的数据库支持的列类型。
列类型是数据库类型特定的，这使得你的数据库结构更灵活。

你可以在 `@Column` 的第一个参数指定列类型，
也可以在 `@Column` 的列选项中指定，例如：

```typescript
@Column("int")
```

或者

```typescript
@Column({ type: "int" })
```

如果你想指定额外的类型参数，可以通过列选项来设定。
例如：

```typescript
@Column("varchar", { length: 200 })
```

> 关于 `bigint` 类型的说明：`bigint` 类型用于 SQL 数据库中，它无法映射到常规的 `number` 类型，而是映射到字符串类型。

### `enum` 列类型

`enum` 类型被 `postgres` 和 `mysql` 支持。有多种可能的列定义：

使用 TypeScript 枚举：

```typescript
export enum UserRole {
    ADMIN = "admin",
    EDITOR = "editor",
    GHOST = "ghost",
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: "enum",
        enum: UserRole,
        default: UserRole.GHOST,
    })
    role: UserRole
}
```

> 注意：支持字符串、数字和异构枚举。

使用枚举值数组：

```typescript
export type UserRoleType = "admin" | "editor" | "ghost",

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        type: "enum",
        enum: ["admin", "editor", "ghost"],
        default: "ghost"
    })
    role: UserRoleType
}
```

### `simple-array` 列类型

有一种特殊的列类型叫 `simple-array`，它可以将原始数组值存储到单个字符串列中。
所有值用逗号分隔。例如：

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column("simple-array")
    names: string[]
}
```

```typescript
const user = new User()
user.names = ["Alexander", "Alex", "Sasha", "Shurik"]
```

会作为单个数据库列存储为 `Alexander,Alex,Sasha,Shurik`。
从数据库加载数据时，`names` 会以数组形式返回，
如同你保存时的样子。

注意你**不能**在值中包含逗号。

### `simple-json` 列类型

有一种特殊列类型叫 `simple-json`，可以存储任何通过 `JSON.stringify` 序列化的值。
当你数据库不支持 `json` 类型但又想方便地存储和读取对象时，非常有用。
例如：

```typescript
@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column("simple-json")
    profile: { name: string; nickname: string }
}
```

```typescript
const user = new User()
user.profile = { name: "John", nickname: "Malkovich" }
```

会以单个数据库列存为 `{"name":"John","nickname":"Malkovich"}`。
从数据库加载时会通过 `JSON.parse` 返回你的对象/数组/原始值。

### 生成列

你可以用 `@Generated` 装饰器创建生成列。例如：

```typescript
@Entity()
export class User {
    @PrimaryColumn()
    id: number

    @Column()
    @Generated("uuid")
    uuid: string
}
```

`uuid` 会自动生成并存储到数据库。

除了 `"uuid"`，还有 `"increment"`、`"identity"`（仅限 Postgres 10+）和 `"rowid"`（仅限 CockroachDB）生成类型，但是不同数据库对这些生成类型有限制（例如有些数据库只能有一个自增列，或者必须是主键）。

### 向量列

在 MariaDB/MySQL、Microsoft SQL Server、PostgreSQL（通过 [`pgvector`](https://github.com/pgvector/pgvector) 扩展）和 SAP HANA Cloud 中支持向量列，可以存储和查询向量嵌入，用于相似度搜索和机器学习应用。

TypeORM 支持跨数据库的 `vector` 和 `halfvec` 列类型：

- `vector` - 存储为 4 字节浮点数（单精度）
    - MariaDB/MySQL：原生 `vector` 类型
    - Microsoft SQL Server：原生 `vector` 类型
    - PostgreSQL：`vector` 类型，通过 `pgvector` 扩展提供
    - SAP HANA Cloud：`real_vector` 类型的别名
- `halfvec` - 存储为 2 字节浮点数（半精度），提升内存效率
    - PostgreSQL：`halfvec` 类型，通过 `pgvector` 扩展提供
    - SAP HANA Cloud：`half_vector` 类型的别名

你可以通过 `length` 选项指定向量纬度：

```typescript
@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    // 未指定维度的向量
    @Column("vector")
    embedding: number[] | Buffer

    // 3 维向量：vector(3)
    @Column("vector", { length: 3 })
    embedding_3d: number[] | Buffer

    // 4 维半精度向量：halfvec(4)（仅支持 PostgreSQL 和 SAP HANA）
    @Column("halfvec", { length: 4 })
    halfvec_embedding: number[] | Buffer
}
```

> **注意**：
>
> - **MariaDB/MySQL**：自 MariaDB 11.7 和 MySQL 9 起支持向量类型。
> - **Microsoft SQL Server**：需要 SQL Server 2025 (17.x) 或更高版本。
> - **PostgreSQL**：需要安装 `pgvector` 扩展，该扩展提供向量数据类型和相似度运算符。
> - **SAP HANA**：需要 SAP HANA Cloud (2024Q1+) 及支持的 `@sap/hana-client` 版本。

### 空间列

Microsoft SQL Server、MySQL/MariaDB、PostgreSQL/CockroachDB 和 SAP HANA 都支持空间列。TypeORM 不同数据库的支持略有差异，特别是列名不同。

MS SQL、MySQL/MariaDB 和 SAP HANA 使用 [well-known text
(WKT)](https://en.wikipedia.org/wiki/Well-known_text) 格式的几何数据，因此几何类型列应使用 `string` 类型标记。

```typescript
import { Entity, PrimaryColumn, Column } from "typeorm"

@Entity()
export class Thing {
    @PrimaryColumn()
    id: number

    @Column("point")
    point: string

    @Column("linestring")
    linestring: string
}

...

const thing = new Thing()
thing.point = "POINT(1 1)"
thing.linestring = "LINESTRING(0 0,1 1,2 2)"
```

Postgres/CockroachDB 的空间列，请参阅[Postgis 数据类型](../drivers/postgres.md#spatial-columns)

## 列选项

列选项定义了实体列的额外选项。
你可以在 `@Column` 中指定列选项：

```typescript
@Column({
    type: "varchar",
    length: 150,
    unique: true,
    // ...
})
name: string;
```

`ColumnOptions` 中可用的选项列表：

- `type: ColumnType` - 列类型，详见 [上文](#column-types)。
- `name: string` - 数据库表中的列名。
  默认列名由属性名生成，你可以通过指定自定义名称更改。
- `length: number` - 列类型长度。例如，创建 `varchar(150)` 类型时，指定类型和长度。
- `onUpdate: string` - `ON UPDATE` 触发器，仅用于 [MySQL](https://dev.mysql.com/doc/refman/5.7/en/timestamp-initialization.html)。
- `nullable: boolean` - 设定列是否允许 `NULL`。默认 `nullable: false`。
- `update: boolean` - 指定是否在“保存”操作时更新该列。若为 `false`，只能在首次插入时设置此值。默认 `true`。
- `insert: boolean` - 指定列值是否在首次插入时设置。默认 `true`。
- `select: boolean` - 指定查询时默认是否包含此列。若为 `false`，标准查询不显示此列。默认 `true`。
- `default: string` - 数据库层级的列默认值。
- `primary: boolean` - 标记为主键列。与使用 `@PrimaryColumn` 等价。
- `unique: boolean` - 标记为唯一列（创建唯一约束）。
- `comment: string` - 数据库列注释。不是所有数据库类型都支持。
- `precision: number` - 十进制（精确数值）列的精度，表示最大数字位数。仅部分列类型适用。
- `scale: number` - 十进制列的小数位数。必须不大于 precision。仅部分列类型适用。
- `unsigned: boolean` - 在数值列加 `UNSIGNED` 属性，仅用于 MySQL。
- `charset: string` - 指定列的字符集。非所有数据库支持。
- `collation: string` - 指定列校对规则。
- `enum: string[]|AnyEnum` - 枚举列类型中指定允许的枚举值列表。可指定值数组或枚举类。
- `enumName: string` - 枚举的名称。
- `asExpression: string` - 生成列表达式，仅用于 [MySQL](https://dev.mysql.com/doc/refman/5.7/en/create-table-generated-columns.html)。
- `generatedType: "VIRTUAL"|"STORED"` - 生成列类型，仅用于 [MySQL](https://dev.mysql.com/doc/refman/5.7/en/create-table-generated-columns.html)。
- `hstoreType: "object"|"string"` - `HSTORE` 列的返回类型，返回字符串或对象，仅用于 [Postgres](https://www.postgresql.org/docs/9.6/static/hstore.html)。
- `array: boolean` - 用于支持数组的 Postgres 和 CockroachDB 列类型（如 int[]）。
- `transformer: { from(value: DatabaseType): EntityType, to(value: EntityType): DatabaseType }` - 用于将任意类型的属性 `EntityType` 转换为数据库支持的类型 `DatabaseType`。支持数组形式的转换器，会按自然顺序写入，按相反顺序读取。例如 `[lowercase, encrypt]` 会先转换为小写再加密写入，读取时先解密。
- `utc: boolean` - 指定日期值是否应以 UTC 时区存储和读取，仅适用于 `date` 类型列。默认 `false`（为兼容性使用本地时区）。

注意：大多数列选项是关系型数据库特定的，`MongoDB` 中不可用。

## 实体继承

你可以通过实体继承减少代码重复。

例如，你有以下三个实体：`Photo`、`Question`、`Post`：

```typescript
@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    description: string

    @Column()
    size: string
}

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    description: string

    @Column()
    answersCount: number
}

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    description: string

    @Column()
    viewCount: number
}
```

你可以看到这些实体都有共同的列：`id`、`title`、`description`。为了减少重复并抽象出更好的设计，可以创建一个基类 `Content`：

```typescript
export abstract class Content {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    description: string
}
@Entity()
export class Photo extends Content {
    @Column()
    size: string
}

@Entity()
export class Question extends Content {
    @Column()
    answersCount: number
}

@Entity()
export class Post extends Content {
    @Column()
    viewCount: number
}
```

所有来自父类的列（关系、内嵌等）都会被继承，并在最终实体中创建。

## 树形实体

TypeORM 支持邻接列表（Adjacency list）和闭包表（Closure table）两种存储树形结构的模式。

### 邻接列表

邻接列表是一个简单的自引用模型。
优点是简单明了，
缺点是因为连接限制，不能一次性加载很大的树。
示例：

```typescript
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
} from "typeorm"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @ManyToOne((type) => Category, (category) => category.children)
    parent: Category

    @OneToMany((type) => Category, (category) => category.parent)
    children: Category[]
}
```

### 闭包表

闭包表将父子关系以特殊方式存储在独立的表中。
读写效率均较高。
想深入了解闭包表请看[Bill Karwin 的精彩演讲](https://www.slideshare.net/billkarwin/models-for-hierarchical-data)。
示例：

```typescript
import {
    Entity,
    Tree,
    Column,
    PrimaryGeneratedColumn,
    TreeChildren,
    TreeParent,
    TreeLevelColumn,
} from "typeorm"

@Entity()
@Tree("closure-table")
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @TreeChildren()
    children: Category[]

    @TreeParent()
    parent: Category

    @TreeLevelColumn()
    level: number
}
```