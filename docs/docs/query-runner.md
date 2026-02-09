# 查询运行器

## 什么是 QueryRunner？

每个新的 `QueryRunner` 实例都会从连接池中获取一个连接（如果关系数据库管理系统支持连接池）。
对于不支持连接池的数据库，它会在整个数据源中使用相同的连接。

完整的 QueryRunner API 文档请参见[迁移章节](./migrations/09-api.md)。

## 创建新的 `QueryRunner` 实例

使用 `createQueryRunner` 方法来创建一个新的 `QueryRunner`：

```typescript
const queryRunner = dataSource.createQueryRunner()
```

## 使用 `QueryRunner`

创建新的 `QueryRunner` 实例后，当你执行第一个查询时，会从连接池中获取一个连接：

```typescript
const queryRunner = dataSource.createQueryRunner()
await queryRunner.query("SELECT 1")
await queryRunner.release()
```

你也可以使用 `connect` 方法直接从连接池获取一个连接：

```typescript
const queryRunner = dataSource.createQueryRunner()
const clientConnection = await queryRunner.connect()
await queryRunner.release()
```

**重要**：确保在不再需要使用 `QueryRunner` 时调用释放方法，将连接返回给连接池：

```typescript
await queryRunner.release()
```

释放 `QueryRunner` 后，将无法再使用其方法。

`QueryRunner` 还有自己独立的 `EntityManager` 实例，你可以通过 `manager` 属性使用它，对 `QueryRunner` 实例所使用的特定数据库连接执行 `EntityManager` 的查询：

```typescript
let queryRunner: QueryRunner
try {
    queryRunner = dataSource.createQueryRunner()
    // 使用单个数据库连接执行多个查询
    await queryRunner.manager.update(
        Employee,
        { level: "junior" },
        { bonus: 0.2 },
    )
    await queryRunner.manager.update(
        Employee,
        { level: "senior" },
        { bonus: 0.1 },
    )
} catch (error) {
    console.error(error)
} finally {
    // 使用完成后记得释放连接
    await queryRunner.release()
}
```

## 显式资源管理

`QueryRunner` 也支持显式的资源管理：

```typescript
async function updateSalaries() {
    await using queryRunner = dataSource.createQueryRunner()
    await queryRunner.manager.update(
        Employee,
        { level: "junior" },
        { bonus: 0.2 },
    )
    await queryRunner.manager.update(
        Employee,
        { level: "senior" },
        { bonus: 0.1 },
    )
    // 不再需要手动释放 QueryRunner
}

try {
    await updateSalaries()
} catch (error) {
    console.error(error)
}
```

像这样声明 query runner 时，它会在包含作用域中的最后一条语句执行完毕后自动释放。
