# 在 where 条件中处理 null 和 undefined 值

在 `WHERE` 条件中，`null` 和 `undefined` 的值在 TypeORM 中并不是严格有效的值。

传递已知的 `null` 值在 TypeScript 中是不允许的（当你在 tsconfig.json 中启用了 `strictNullChecks` 时）编译时会报错。默认行为是在运行时遇到 `null` 和 `undefined` 值时会抛出错误。

`null` 和 `undefined` 值的处理方式可以通过数据源配置中的 `invalidWhereValuesBehavior` 选项自定义。该选项适用于高级操作，如查找操作、仓库方法和实体管理器的方法（更新、删除、软删除、恢复）。

:::warning
此设置**不影响**查询构建器（QueryBuilder）的 `.where()`、`.andWhere()` 或 `.orWhere()` 方法。查询构建器是低级 API，`null`/`undefined` 值会直接传递。对于显式的 null 处理，请使用查询构建器中的 `IsNull()` 操作符或参数化条件。
:::
:::

## 默认行为

默认情况下，TypeORM 在 where 条件中遇到 `null` 或 `undefined` 值时会抛出错误。这样可以防止意想不到的结果，并帮助及早发现潜在的错误：

```typescript
// 这两个查询都会抛出错误
```
const posts1 = await repository.find({
    where: {
        text: null,
    },
})
// Error: Null value encountered in property 'text' of a where condition.

const posts2 = await repository.find({
    where: {
        text: undefined,
    },
})
// Error: Undefined value encountered in property 'text' of a where condition.
```

正确匹配 where 条件中的 `null` 值应使用 `IsNull` 操作符（详情见 [查找选项](../working-with-entity-manager/3-find-options.md)）：

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

#### `'ignore'`

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

#### `'throw'` (default)

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

#### `'ignore'`

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

#### `'throw'` (default)

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

`invalidWhereValuesBehavior` 配置适用于 TypeORM 的高级操作，不包括查询构建器的直接 `.where()` 方法：

### 查找操作

```typescript
// Repository.find() / findOne() / findBy() / findOneBy()
await repository.find({ where: { text: null } }) // 尊重 invalidWhereValuesBehavior 设置

// EntityManager.find() / findOne() / findBy() / findOneBy()
await manager.find(Post, { where: { text: null } }) // 尊重 invalidWhereValuesBehavior 设置
```

### 仓库和实体管理器方法

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

### 使用 setFindOptions 的查询构建器

```typescript
// setFindOptions 走查找选项路径，因此会尊重该设置
await dataSource
    .createQueryBuilder(Post, "post")
    .setFindOptions({ where: { text: null } }) // 尊重 invalidWhereValuesBehavior 设置
    .getMany()
```

### 不受影响：查询构建器的 `.where()`

查询构建器的 `.where()`、`.andWhere()` 和 `.orWhere()` 是低级 API，不受此设置影响。`null` 和 `undefined` 值直接传递：

```typescript
// 这不会尊重 invalidWhereValuesBehavior — null 会直接传递
await dataSource
    .createQueryBuilder()
    .update(Post)
    .set({ title: "Updated" })
    .where({ text: null })
    .execute()
```

## 查询构建器 `.where()` 中 null 和 undefined 的行为

由于查询构建器是低级 API，`null` 和 `undefined` 值不会被验证或转换。了解它们的行为对于避免意外结果很重要。

### 查询构建器 `.where()` 中的 `null`

当 `null` 作为对象样式 `.where()` 的值传入时，会生成针对 `NULL` 的 SQL 等式检查：

```typescript
await dataSource
    .createQueryBuilder(Post, "post")
    .where({ text: null })
    .getMany()
// 生成：WHERE post.text = NULL
```

在 SQL 中，`column = NULL` **总是为假** —— 没有任何值等于 NULL。此查询将返回**零条结果**，这几乎肯定不是你的本意。匹配 NULL 值，请使用 `IsNull()` 操作符：

```typescript
import { IsNull } from "typeorm"

await dataSource
    .createQueryBuilder(Post, "post")
    .where({ text: IsNull() })
    .getMany()
// 生成：WHERE post.text IS NULL
```

或者使用字符串条件：

```typescript
await dataSource
    .createQueryBuilder(Post, "post")
    .where("post.text IS NULL")
    .getMany()
```

### 查询构建器 `.where()` 中的 `undefined`

当 `undefined` 作为值传入时，行为与上述相同 —— 生成 `WHERE column = NULL`，总是为假：

```typescript
await dataSource
    .createQueryBuilder(Post, "post")
    .where({ text: undefined })
    .getMany()
// 生成：WHERE post.text = NULL
// 返回：零条结果
```

### 行为总结表

| 值                                  | 高级 API（查找/仓库/管理器）          | 查询构建器 `.where()`            |
| ----------------------------------- | ------------------------------------ | ------------------------------- |
| `null` 配合 `"ignore"`              | 属性被跳过 — 无过滤                  | `WHERE col = NULL` — 返回零条结果 |
| `null` 配合 `"sql-null"`            | 生成 `WHERE col IS NULL`             | `WHERE col = NULL` — 返回零条结果 |
| `null` 配合 `"throw"`（默认）       | 抛出错误                            | `WHERE col = NULL` — 返回零条结果 |
| `undefined` 配合 `"ignore"`         | 属性被跳过 — 无过滤                  | `WHERE col = NULL` — 返回零条结果 |
| `undefined` 配合 `"throw"`（默认）  | 抛出错误                            | `WHERE col = NULL` — 返回零条结果 |
| `IsNull()`                         | 生成 `WHERE col IS NULL`             | 生成 `WHERE col IS NULL`         |

:::tip
无论使用哪种 API，当你想匹配 SQL NULL 值时，请始终使用 `IsNull()`。它在高级和查询构建器两种语境下均可正确工作。
:::
