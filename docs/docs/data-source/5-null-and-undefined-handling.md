# 在 where 条件中处理 null 和 undefined 值

在 `WHERE` 条件中，`null` 和 `undefined` 的值在 TypeORM 中并不是严格有效的值。

传递已知的 `null` 值在 TypeScript 中是不允许的（当你在 tsconfig.json 中启用了 `strictNullChecks` 时）编译时会报错。但是默认行为是在运行时遇到 `null` 值时会被忽略。同样，TypeScript 允许 `undefined` 值，但在运行时也会被忽略。

接受 `null` 和 `undefined` 值有时会导致意想不到的结果，需要谨慎对待。尤其是在值来自用户输入且没有进行充分验证时，这一点尤为重要。

例如，调用 `Repository.findOneBy({ id: undefined })` 会返回表中的第一行，而 `Repository.findBy({ userId: null })` 则是不带过滤条件的，返回所有行。

`null` 和 `undefined` 值的处理方式可以通过数据源配置中的 `invalidWhereValuesBehavior` 选项自定义。该选项适用于所有支持 `WHERE` 条件的操作，包括查询操作、查询构建器和仓库方法。

:::note
未来版本的 TypeORM 将修改当前行为，建议将 `null` 和 `undefined` 行为都设置为抛出错误，以便提前适配这些变化。
:::

## 默认行为

默认情况下，TypeORM 会跳过 where 条件中的 `null` 和 `undefined` 值。这意味着如果你在 where 条件中包含 `null` 或 `undefined` 的属性，该属性将被忽略：

```typescript
// 这两个查询都会返回所有帖子，忽略 text 属性
const posts1 = await repository.find({
    where: {
        text: null,
    },
})

const posts2 = await repository.find({
    where: {
        text: undefined,
    },
})
```

正确匹配 where 条件中的 null 值应使用 `IsNull` 操作符（详情见 [查找选项](../working-with-entity-manager/3-find-options.md)）：

```typescript
const posts = await repository.find({
    where: {
        text: IsNull(),
    },
})
```

## 配置

你可以通过连接配置中的 `invalidWhereValuesBehavior` 选项来自定义对 `null` 和 `undefined` 值的处理：

```typescript
const dataSource = new DataSource({
    // ... 其他选项
    invalidWhereValuesBehavior: {
        null: "ignore" | "sql-null" | "throw",
        undefined: "ignore" | "throw",
    },
})
```

### null 行为选项

`null` 的行为可以设置为以下三个值之一：

#### `'ignore'`（默认）

where 条件中的 JavaScript `null` 值会被忽略，该属性会被跳过：

```typescript
const dataSource = new DataSource({
    // ... 其他选项
    invalidWhereValuesBehavior: {
        null: "ignore",
    },
})

// 这会返回所有帖子，忽略 text 属性
const posts = await repository.find({
    where: {
        text: null,
    },
})
```

#### `'sql-null'`

JavaScript `null` 值会被转换为 SQL 的 `NULL` 条件：

```typescript
const dataSource = new DataSource({
    // ... 其他选项
    invalidWhereValuesBehavior: {
        null: "sql-null",
    },
})

// 这将只返回数据库中 text 列为 NULL 的帖子
const posts = await repository.find({
    where: {
        text: null,
    },
})
```

#### `'throw'`

JavaScript `null` 值会导致抛出 TypeORMError：

```typescript
const dataSource = new DataSource({
    // ... 其他选项
    invalidWhereValuesBehavior: {
        null: "throw",
    },
})

// 这将抛出错误
const posts = await repository.find({
    where: {
        text: null,
    },
})
// 错误信息: 在 where 条件的 'text' 属性中遇到了 null 值。
// 若想匹配 SQL 的 NULL，应使用 IsNull() 操作符。
// 可在连接选项中将 'invalidWhereValuesBehavior.null' 设置为 'ignore' 或 'sql-null' 以跳过或处理 null 值。
```

### undefined 行为选项

`undefined` 的行为可以设置为以下两个值之一：

#### `'ignore'`（默认）

where 条件中的 JavaScript `undefined` 值会被忽略，该属性会被跳过：

```typescript
const dataSource = new DataSource({
    // ... 其他选项
    invalidWhereValuesBehavior: {
        undefined: "ignore",
    },
})

// 这会返回所有帖子，忽略 text 属性
const posts = await repository.find({
    where: {
        text: undefined,
    },
})
```

#### `'throw'`

JavaScript `undefined` 值会导致抛出 TypeORMError：

```typescript
const dataSource = new DataSource({
    // ... 其他选项
    invalidWhereValuesBehavior: {
        undefined: "throw",
    },
})

// 这将抛出错误
const posts = await repository.find({
    where: {
        text: undefined,
    },
})
// 错误信息: 在 where 条件的 'text' 属性中遇到了 undefined 值。
// 可在连接选项中将 'invalidWhereValuesBehavior.undefined' 设置为 'ignore' 以跳过 undefined 值的属性。
```

注意，这仅适用于显式设置为 `undefined` 的值，不适用于属性被省略的情况。

## 同时使用两个选项

你可以独立配置这两个行为，以实现全面控制：

```typescript
const dataSource = new DataSource({
    // ... 其他选项
    invalidWhereValuesBehavior: {
        null: "sql-null",
        undefined: "throw",
    },
})
```

此配置将：

1. 将 JavaScript 的 `null` 值转换为 SQL 的 `NULL` 条件
2. 发现任何 `undefined` 值时抛出错误
3. 忽略 where 条件中未提供的属性

该组合适用于你想要：

- 明确地在数据库中查找 NULL 值
- 捕获可能滑入查询中的 undefined 值的编程错误

## 适用于所有 where 操作

`invalidWhereValuesBehavior` 配置适用于**所有支持 where 条件的 TypeORM 操作**，不仅限于仓库的 find 方法：

### 查询构建器

```typescript
// UpdateQueryBuilder
await dataSource
    .createQueryBuilder()
    .update(Post)
    .set({ title: "Updated" })
    .where({ text: null }) // 尊重 invalidWhereValuesBehavior 设置
    .execute()

// DeleteQueryBuilder
await dataSource
    .createQueryBuilder()
    .delete()
    .from(Post)
    .where({ text: null }) // 尊重 invalidWhereValuesBehavior 设置
    .execute()

// SoftDeleteQueryBuilder
await dataSource
    .createQueryBuilder()
    .softDelete()
    .from(Post)
    .where({ text: null }) // 尊重 invalidWhereValuesBehavior 设置
    .execute()
```

### 仓库方法

```typescript
// Repository.update()
await repository.update({ text: null }, { title: "Updated" }) // 尊重 invalidWhereValuesBehavior 设置

// Repository.delete()
await repository.delete({ text: null }) // 尊重 invalidWhereValuesBehavior 设置

// EntityManager.update()
await manager.update(Post, { text: null }, { title: "Updated" }) // 尊重 invalidWhereValuesBehavior 设置

// EntityManager.delete()
await manager.delete(Post, { text: null }) // 尊重 invalidWhereValuesBehavior 设置

// EntityManager.softDelete()
await manager.softDelete(Post, { text: null }) // 尊重 invalidWhereValuesBehavior 设置
```

所有这些操作都会一致地应用你配置的 `invalidWhereValuesBehavior` 设置。