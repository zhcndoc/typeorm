# 使用查询构建器删除

## `Delete`

你可以使用 `QueryBuilder` 创建 `DELETE` 查询。
示例：

```typescript
await myDataSource
    .createQueryBuilder()
    .delete()
    .from(User)
    .where("id = :id", { id: 1 })
    .execute()
```

这是从数据库中删除实体在性能方面最有效的方法。

## `软删除`

在 QueryBuilder 中应用软删除

```typescript
await dataSource.getRepository(Entity).createQueryBuilder().softDelete()
```

示例：

```typescript
await myDataSource
    .getRepository(User)
    .createQueryBuilder()
    .softDelete()
    .where("id = :id", { id: 1 })
    .execute()
```

## `恢复软删除`

另外，你可以使用 `restore()` 方法恢复软删除的记录：

```typescript
await dataSource.getRepository(Entity).createQueryBuilder().restore()
```

示例：

```typescript
await myDataSource
    .getRepository(User)
    .createQueryBuilder()
    .restore()
    .where("id = :id", { id: 1 })
    .execute()
```