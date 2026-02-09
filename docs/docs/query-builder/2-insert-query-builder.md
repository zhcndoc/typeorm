# 使用查询构建器插入数据

你可以使用 `QueryBuilder` 创建 `INSERT` 查询。
示例：

```typescript
await dataSource
    .createQueryBuilder()
    .insert()
    .into(User)
    .values([
        { firstName: "Timber", lastName: "Saw" },
        { firstName: "Phantom", lastName: "Lancer" },
    ])
    .execute()
```

这是在性能方面插入数据行到数据库中最有效的方法。
你也可以通过此方式执行批量插入。

## 支持原生 SQL

在某些情况下，当你需要执行 SQL 查询时，可以使用函数形式的值：

```typescript
await dataSource
    .createQueryBuilder()
    .insert()
    .into(User)
    .values({
        firstName: "Timber",
        lastName: () => "CONCAT('S', 'A', 'W')",
    })
    .execute()
```

> 警告：使用原生 SQL 时，请确保值已被适当清理，以防止 SQL 注入。

## ON CONFLICT 时更新值

如果你尝试插入的值因已有数据冲突，可以使用 `orUpdate` 函数在冲突目标上更新特定字段。

```typescript
await dataSource
    .createQueryBuilder()
    .insert()
    .into(User)
    .values({
        firstName: "Timber",
        lastName: "Saw",
        externalId: "abc123",
    })
    .orUpdate(["firstName", "lastName"], ["externalId"])
    .execute()
```

## 带条件的 ON CONFLICT 更新（Postgres、Oracle、MSSQL、SAP HANA）

```typescript
await dataSource
    .createQueryBuilder()
    .insert()
    .into(User)
    .values({
        firstName: "Timber",
        lastName: "Saw",
        externalId: "abc123",
    })
    .orUpdate(["firstName", "lastName"], ["externalId"], {
        overwriteCondition: {
            where: {
                firstName: Equal("Phantom"),
            },
        },
    })
    .execute()
```

## 插入时忽略错误（MySQL）或执行 DO NOTHING（Postgres、Oracle、MSSQL、SAP HANA）

如果你尝试插入的值因已有数据冲突或包含无效数据，可以使用 `orIgnore` 函数来抑制错误，仅插入有效数据的行。

```typescript
await dataSource
    .createQueryBuilder()
    .insert()
    .into(User)
    .values({
        firstName: "Timber",
        lastName: "Saw",
        externalId: "abc123",
    })
    .orIgnore()
    .execute()
```

## 如果值未更改则跳过更新（Postgres、Oracle、MSSQL、SAP HANA）

```typescript
await dataSource
    .createQueryBuilder()
    .insert()
    .into(User)
    .values({
        firstName: "Timber",
        lastName: "Saw",
        externalId: "abc123",
    })
    .orUpdate(["firstName", "lastName"], ["externalId"], {
        skipUpdateIfNoValuesChanged: true,
    })
    .execute()
```

## 使用部分索引（Postgres）

```typescript
await dataSource
    .createQueryBuilder()
    .insert()
    .into(User)
    .values({
        firstName: "Timber",
        lastName: "Saw",
        externalId: "abc123",
    })
    .orUpdate(["firstName", "lastName"], ["externalId"], {
        skipUpdateIfNoValuesChanged: true,
        indexPredicate: "date > 2020-01-01",
    })
    .execute()
```

## 从 Select 插入数据

你可以使用 `valuesFromSelect()` 方法，通过 `SELECT` 查询将一个表的数据插入到另一个表中。这会生成一个 `INSERT INTO ... SELECT FROM` 语句，适用于数据迁移、归档或表间复制数据。

### 直接使用 SelectQueryBuilder

```typescript
// 创建查询以获取源数据
const selectQuery = dataSource
    .createQueryBuilder()
    .select(["user.firstName", "user.lastName"])
    .from(User, "user")
    .where("user.isActive = :isActive", { isActive: true })

// 将选中的数据插入另一个表
await dataSource
    .createQueryBuilder()
    .insert()
    .into(ArchivedUser, ["firstName", "lastName"])
    .valuesFromSelect(selectQuery)
    .execute()
```

### 使用回调函数

你也可以通过回调函数来构建 select 查询：

```typescript
await dataSource
    .createQueryBuilder()
    .insert()
    .into(ArchivedUser, ["firstName", "lastName", "archivedAt"])
    .valuesFromSelect((qb) =>
        qb
            .select(["user.firstName", "user.lastName", "NOW()"])
            .from(User, "user")
            .where("user.deletedAt IS NOT NULL"),
    )
    .execute()
```

### 使用联接

你可以在 select 查询中使用联接，组合多个表的数据：

```typescript
await dataSource
    .createQueryBuilder()
    .insert()
    .into(UserReport, ["userName", "orderCount"])
    .valuesFromSelect((qb) =>
        qb
            .select(["user.name", "COUNT(order.id)"])
            .from(User, "user")
            .leftJoin("user.orders", "order")
            .groupBy("user.id"),
    )
    .execute()
```

> **注意：** 使用 `valuesFromSelect()` 时，不会调用实体监听器和订阅器（`@BeforeInsert`、`@AfterInsert`），因为插入操作期间不会创建实体实例。

> **注意：** 由于没有实体实例需要更新，`updateEntity` 选项对 `valuesFromSelect()` 无效。