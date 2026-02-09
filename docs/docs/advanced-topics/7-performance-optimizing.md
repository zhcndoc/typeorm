# TypeORM 中的性能与优化

## 1. 性能优化介绍

- 在使用 TypeORM 这类 ORM 的应用中，性能优化至关重要，能够确保系统顺畅运行、最小化延迟并高效利用资源。

- 使用 ORM 时常见的挑战包括不必要的数据检索、N+1 查询问题，以及未充分利用索引或缓存等优化工具。

- 优化的主要目标包括：
    - 减少发送到数据库的 SQL 查询数量。
    - 优化复杂查询以提高执行速度。
    - 利用缓存和索引加速数据检索。
    - 使用合适的加载方式（懒加载 vs 预加载）保证高效数据读取。

## 2. 高效使用 Query Builder

### 2.1. 避免 N+1 查询问题

- N+1 查询问题是指系统为每个查询出的数据行执行过多的子查询。

- 避免方法是使用 `leftJoinAndSelect` 或 `innerJoinAndSelect`，在单条查询中关联多张表，减少查询次数。

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.posts", "post")
    .getMany()
```

- 这里 `leftJoinAndSelect` 助力在一条查询中获取所有用户的帖子，而非多条小查询。

### 2.2. 仅需原始数据时使用 `getRawMany()`

- 如果不需要完整的实体对象，可通过 `getRawMany()` 获取原始数据，避免 TypeORM 处理过多信息。

```typescript
const rawPosts = await dataSource
    .getRepository(Post)
    .createQueryBuilder("post")
    .select("post.title, post.createdAt")
    .getRawMany()
```

### 2.3. 使用 `select` 限制字段

- 为优化内存使用和减少不必要数据，使用 `select` 指定只查询所需字段。

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select(["user.name", "user.email"])
    .getMany()
```

## 3. 使用索引

- 索引通过减少扫描数据量加快数据库查询性能。TypeORM 支持在实体列上通过 `@Index` 装饰器创建索引。

### 3.1. 创建索引

- 可直接在实体中使用 `@Index` 装饰器创建索引。

```typescript
import { Entity, Column, Index } from "typeorm"

@Entity()
@Index(["firstName", "lastName"]) // 复合索引
export class User {
    @Column()
    firstName: string

    @Column()
    lastName: string
}
```

### 3.2. 唯一索引

- 也可创建唯一索引，确保列中值不重复。

```typescript
@Index(["email"], { unique: true })
```

## 4. 懒加载与预加载

TypeORM 提供两种主要的关系数据加载方式：懒加载（Lazy Loading）和预加载（Eager Loading）。它们对应用性能影响不同。

### 4.1. 懒加载

- 懒加载仅在需要时加载关联数据，减少数据库负载，适合并非所有相关数据都必须时。

```typescript
@Entity()
export class User {
    @OneToMany(() => Post, (post) => post.user, { lazy: true })
    posts: Promise<Post[]>
}
```

- 需要数据时，调用：

```typescript
const user = await userRepository.findOne(userId)
const posts = await user.posts
```

- 优点：
    - 资源高效：仅在真正需要时加载所需数据，减少查询和内存开销。
    - 适合选择性数据使用场景。
- 缺点：
    - 查询复杂度增加：每次访问关联数据都会触发额外查询，若未妥善控制，可能增加延迟。
    - 不易追踪：不当使用易引发 n+1 查询问题。

### 4.2. 预加载

- 预加载会在主查询执行时自动获取所有关联数据。方便但如关联关系复杂过多，可能引发性能问题。

```typescript
@Entity()
export class User {
    @OneToMany(() => Post, (post) => post.user, { eager: true })
    posts: Post[]
}
```

- 这样一来，获取用户数据时即加载对应帖子。

- 优点：
    - 自动加载关联数据，访问关系更简便，无需额外查询。
    - 避免 n+1 查询问题：数据一次性查询，避免多余查询。
- 缺点：
    - 一次性拉取所有关联数据可能导致查询庞大，即使部分数据未用到。
    - 不适合只需关联数据子集的场景，导致数据使用低效。

- 更多懒加载和预加载配置与示例，请参考官方 TypeORM 文档：[预加载与懒加载关系](../relations/5-eager-and-lazy-relations.md)

## 5. 高级优化

### 5.1. 使用查询提示（Query Hints）

- 查询提示是随 SQL 查询发送的指令，辅助数据库选择更高效的执行策略。

- 不同关系型数据库支持的提示各异，如建议使用索引或选择合适 JOIN 类型。

```typescript
await dataSource.query(`
    SELECT /*+ MAX_EXECUTION_TIME(1000) */ *
    FROM user
    WHERE email = 'example@example.com'
`)
```

- 以上示例中，`MAX_EXECUTION_TIME(1000)` 告诉 MySQL 查询若超过 1 秒则停止。

### 5.2. 分页

- 分页是获取大量数据时提高性能的重要手段。通过分块加载数据，减少数据库负载，优化内存使用。

- TypeORM 中使用 `limit` 和 `offset` 实现分页。

```typescript
const users = await userRepository
    .createQueryBuilder("user")
    .limit(10) // 每页获取记录数
    .offset(20) // 跳过前 20 条记录
    .getMany()
```

- 分页可防止一次性拉取大量数据，降低延迟并优化内存。实现分页时，可考虑使用分页游标以更有效处理动态数据。

### 5.3. 缓存

- 缓存是将查询结果或数据临时存储以供后续请求复用，避免每次都查询数据库的技术。

- TypeORM 内置支持缓存，且可自定义缓存策略。

```typescript
const users = await userRepository
    .createQueryBuilder("user")
    .cache(true) // 启用缓存
    .getMany()
```

- 另外，可配置缓存时长或使用外部缓存工具（如 Redis）提升效率。

```typescript=
const dataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "test",
    password: "test",
    database: "test",
    cache: {
        type: "redis",
        options: {
            host: "localhost",
            port: 6379
        }
    }
});
```