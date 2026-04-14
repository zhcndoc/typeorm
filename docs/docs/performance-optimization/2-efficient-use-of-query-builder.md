---
sidebar_label: 查询构建器
---

# 查询构建器的高效使用

## 避免 N+1 查询问题

N+1 查询问题发生在系统为检索的每一行数据执行过多子查询时。

为了避免这种情况，可以使用 `leftJoinAndSelect` 或 `innerJoinAndSelect` 在单个查询中合并表，而不是执行多个查询。

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.posts", "post")
    .getMany()
```

在这里，`leftJoinAndSelect` 帮助在一个查询中检索所有用户的帖子，而不是多个小查询。

## 仅需要原始数据时使用 `getRawMany()`

在不需要完整对象的情况下，可以使用 `getRawMany()` 获取原始数据，避免 TypeORM 处理过多信息。

```typescript
const rawPosts = await dataSource
    .getRepository(Post)
    .createQueryBuilder("post")
    .select("post.title, post.createdAt")
    .getRawMany()
```

## 使用 `select` 限制字段

为了优化内存使用并减少不必要的数据，请使用 `select` 仅选择所需字段。

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .select(["user.name", "user.email"])
    .getMany()
```
