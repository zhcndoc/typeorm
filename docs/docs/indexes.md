# 索引

## 列索引

你可以使用 `@Index` 在想要建立索引的列上创建数据库索引。
你可以为实体的任意列创建索引。
示例：

```typescript
import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Index()
    @Column()
    firstName: string

    @Column()
    @Index()
    lastName: string
}
```

你也可以指定索引名称：

```typescript
import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Index("name1-idx")
    @Column()
    firstName: string

    @Column()
    @Index("name2-idx")
    lastName: string
}
```

## 唯一索引

要创建唯一索引，需要在索引选项中指定 `{ unique: true }`：

> 注意：CockroachDB 将唯一索引存储为 `UNIQUE` 约束

```typescript
import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Index({ unique: true })
    @Column()
    firstName: string

    @Column()
    @Index({ unique: true })
    lastName: string
}
```

## 多列索引

要创建包含多列的索引，需要将 `@Index` 放在实体类本身上，
并指定需要包含在索引内的所有列属性名。
示例：

```typescript
import { Entity, PrimaryGeneratedColumn, Column, Index } from "typeorm"

@Entity()
@Index(["firstName", "lastName"])
@Index(["firstName", "middleName", "lastName"], { unique: true })
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    middleName: string

    @Column()
    lastName: string
}
```

## 空间索引

MySQL、CockroachDB 和 PostgreSQL（当 PostGIS 可用时）支持空间索引。

在 MySQL 中，对使用空间类型的列（`geometry`、`point`、`linestring`、
`polygon`、`multipoint`、`multilinestring`、`multipolygon`、
`geometrycollection`）添加 `Index` 并设置 `{ spatial: true }` 即可创建空间索引：

```typescript
@Entity()
export class Thing {
    @Column("point")
    @Index({ spatial: true })
    point: string
}
```

对使用空间类型（`geometry`、`geography`）的列创建空间索引，添加带有 `{ spatial: true }` 的 `Index`：

```typescript
export interface Geometry {
    type: "Point"
    coordinates: [Number, Number]
}

@Entity()
export class Thing {
    @Column("geometry", {
        spatialFeatureType: "Point",
        srid: 4326,
    })
    @Index({ spatial: true })
    point: Geometry
}
```

## 并发创建

为了避免在 Postgres 中创建和删除索引时获取 ACCESS EXCLUSIVE 锁，可以使用 CONCURRENTLY 修饰符并发创建索引。
如果要使用并发选项，需要在数据源配置中将 `migrationsTransactionMode` 设为 `none`。

TypeORM 支持在索引上指定 concurrent 选项时生成包含该选项的 SQL。

```typescript
@Index(["firstName", "middleName", "lastName"], { concurrent: true })
```

更多信息请参阅 [Postgres 官方文档](https://www.postgresql.org/docs/current/sql-createindex.html)。

## 索引类型

如果需要为索引指定自定义类型，可以使用 `type` 属性。如果设置了 `spatial` 属性，则该字段会被忽略。

```typescript
@Index({ type: 'hash' })
```

该功能当前仅支持 PostgreSQL。

## 禁用同步

TypeORM 不支持某些索引选项和定义（例如 `lower`、`pg_trgm`），由于许多数据库特定的差异以及获取现有数据库索引信息并自动同步的多个问题。在这种情况下，你应该手动创建索引
（例如，在[迁移文件](./migrations/01-why.md)中）并使用你想要的任何索引签名。为了使 TypeORM 在同步时忽略这些索引，请在 `@Index` 装饰器上使用 `synchronize: false` 选项。

例如，创建一个不区分大小写的索引：

```sql
CREATE INDEX "POST_NAME_INDEX" ON "post" (lower("name"))
```

之后，应为该索引禁用同步以避免下次模式同步时被删除：

```ts
@Entity()
@Index("POST_NAME_INDEX", { synchronize: false })
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string
}
```
