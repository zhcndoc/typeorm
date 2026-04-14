# 缓存

缓存是一种技术，用于临时存储查询结果或数据，以便在后续请求中重复使用，而无需每次都查询数据库。

TypeORM 内置了对缓存的支持，你可以自定义缓存的使用方式。

```typescript
const users = await userRepository
    .createQueryBuilder("user")
    .cache(true) // 启用缓存
    .getMany()
```

此外，你可以配置缓存过期时间，或使用外部缓存工具（如 Redis）来提升效率。

```typescript
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
            port: 6379,
        },
    },
})
```
