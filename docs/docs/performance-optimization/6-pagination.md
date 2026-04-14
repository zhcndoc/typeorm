# 分页

分页是检索大量数据时提升性能的关键技术。与其一次性获取所有数据，分页将数据划分为更小的页，从而降低数据库负载并优化内存使用。

在 TypeORM 中，你可以使用 `limit` 和 `offset` 来实现分页。

```typescript
const users = await userRepository
    .createQueryBuilder("user")
    .limit(10) // 每页获取的记录数
    .offset(20) // 跳过前 20 条记录
    .getMany()
```

分页有助于防止一次性获取大量数据，从而最小化延迟并优化内存使用。在实现分页时，请考虑使用分页游标，以便更高效地处理动态数据。
