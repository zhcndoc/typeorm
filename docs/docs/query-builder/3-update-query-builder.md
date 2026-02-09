# 使用查询构建器进行更新

你可以使用 `QueryBuilder` 创建 `UPDATE` 查询。
示例：

```typescript
await dataSource
    .createQueryBuilder()
    .update(User)
    .set({ firstName: "Timber", lastName: "Saw" })
    .where("id = :id", { id: 1 })
    .execute()
```

这是在性能方面更新数据库中实体的最有效方法。

## 原生 SQL 支持

在某些情况下，当你需要执行 SQL 查询时，你需要使用函数式的值：

```typescript
await dataSource
    .createQueryBuilder()
    .update(User)
    .set({
        firstName: "Timber",
        lastName: "Saw",
        age: () => "age + 1",
    })
    .where("id = :id", { id: 1 })
    .execute()
```

> 警告：使用原生 SQL 时，请确保对值进行正确的清理以防止 SQL 注入。