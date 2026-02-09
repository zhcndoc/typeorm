# SQL 标签

TypeORM 提供了一种使用模板字面量编写 SQL 查询的方法，能够根据你的数据库类型自动处理参数。该功能有助于防止 SQL 注入，同时使查询更加易读。SQL 标签作为 `.query` 方法的一个包装实现，提供了另一种接口，同时保持相同的底层功能。

## 基本用法

`sql` 标签可用于 DataSource、EntityManager、Repository 和 QueryRunner 实例：

```typescript
const users = await dataSource.sql`SELECT * FROM users WHERE name = ${"John"}`
```

## 参数处理

参数会根据你的数据库类型自动进行转义和格式化：

- **PostgreSQL**、**CockroachDB**、**Aurora PostgreSQL** 使用 `$1`、`$2` 等：

```typescript
// 查询变为：SELECT * FROM users WHERE name = $1
const users = await dataSource.sql`SELECT * FROM users WHERE name = ${"John"}`
```

- **MySQL**、**MariaDB**、**Aurora MySQL**、**SAP**、**SQLite** 使用 `?`：

```typescript
// 查询变为：SELECT * FROM users WHERE name = ?
const users = await dataSource.sql`SELECT * FROM users WHERE name = ${"John"}`
```

- **Oracle** 使用 `:1`、`:2` 等：

```typescript
// 查询变为：SELECT * FROM users WHERE name = :1
const users = await dataSource.sql`SELECT * FROM users WHERE name = ${"John"}`
```

- **MSSQL** 使用 `@1`、`@2` 等：

```typescript
// 查询变为：SELECT * FROM users WHERE name = @1
const users = await dataSource.sql`SELECT * FROM users WHERE name = ${"John"}`
```

### 多参数

你可以使用多个参数以及复杂表达式：

```typescript
const name = "John"
const age = 30
const active = true
const users = await dataSource.sql`
    SELECT * FROM users
    WHERE name LIKE ${name + "%"}
    AND age > ${age}
    AND is_active = ${active}
`
```

### 展开参数列表

要将一个值数组转换成模板表达式中的动态参数列表，可以将数组包裹在一个函数中。这通常用于编写 SQL 中的 `IN (...)` 表达式，其中列表中的每个值都必须作为单独的参数提供：

```typescript
// 查询变为：SELECT * FROM users WHERE id IN (?, ?, ?)
const users = await dataSource.sql`
    SELECT * FROM users
    WHERE id IN (${() => [1, 2, 3]})
`
```

### 插入未经转义的表达式

当你想插入一个模板表达式，但不希望它被转换成数据库参数时，可以将字符串包裹在一个函数中。这可用于动态定义不能参数化的列名、表名或架构名，或用于按条件设置 SQL 中的子句。

**注意！** 通过这种方式插入的原始 SQL 不会进行转义。不要对来自用户输入的值使用此方式，存在安全风险。

```typescript
// 查询变为：SELECT * FROM dynamic_table_name
const rawData = await dataSource.sql`
    SELECT * FROM ${() => "dynamic_table_name"}
`
```

## 特性

- **防止 SQL 注入**：参数会被正确转义
- **数据库无关**：根据数据库类型自动处理参数格式
- **查询更易读**：模板字面量使查询相比参数数组更易理解

## 与 query 方法的比较

传统的 `query` 方法需要手动处理参数占位符：

```typescript
// 传统 query 方法
await dataSource.query("SELECT * FROM users WHERE name = $1 AND age > $2", [
    "John",
    30,
])

// SQL 标签替代
await dataSource.sql`SELECT * FROM users WHERE name = ${"John"} AND age > ${30}`
```

SQL 标签自动处理参数格式化，能减少潜在错误。