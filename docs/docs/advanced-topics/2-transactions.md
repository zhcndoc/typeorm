# 事务

## 创建和使用事务

事务是通过 `DataSource` 或 `EntityManager` 来创建的。
示例：

```typescript
await myDataSource.transaction(async (transactionalEntityManager) => {
    // 使用 transactionalEntityManager 执行查询
})
```

或者

```typescript
await myDataSource.manager.transaction(async (transactionalEntityManager) => {
    // 使用 transactionalEntityManager 执行查询
})
```

你希望在事务中执行的所有操作都必须在回调函数中执行：

```typescript
await myDataSource.manager.transaction(async (transactionalEntityManager) => {
    await transactionalEntityManager.save(users)
    await transactionalEntityManager.save(photos)
    // ...
})
```

在事务中工作的最重要限制是**必须始终**使用提供的实体管理器实例——本例中的 `transactionalEntityManager`。**不要**使用全局实体管理器。
所有操作**必须**使用提供的事务实体管理器来执行。

### 指定隔离级别

可以通过将隔离级别作为第一个参数传入来指定事务的隔离级别：

```typescript
await myDataSource.manager.transaction(
    "SERIALIZABLE",
    (transactionalEntityManager) => {},
)
```

隔离级别的实现并非对所有数据库都通用。

以下数据库驱动支持标准的隔离级别（`READ UNCOMMITTED`、`READ COMMITTED`、`REPEATABLE READ`、`SERIALIZABLE`）：

- MySQL
- Postgres
- SQL Server

**SQLite** 默认事务为 `SERIALIZABLE`，但如果启用了 _共享缓存模式_，事务可以使用 `READ UNCOMMITTED` 隔离级别。

**Oracle** 仅支持 `READ COMMITTED` 和 `SERIALIZABLE` 隔离级别。

## 使用 `QueryRunner` 创建和控制单个数据库连接的状态

`QueryRunner` 提供单个数据库连接。
事务通过查询运行器（query runners）来组织。
单个事务只能在单个查询运行器上建立。
你可以手动创建一个查询运行器实例，并用它来手动控制事务状态。
示例：

```typescript
// 创建一个新的查询运行器
const queryRunner = dataSource.createQueryRunner()

// 使用新的查询运行器建立真实的数据库连接
await queryRunner.connect()

// 现在我们可以在查询运行器上执行任何查询，例如：
await queryRunner.query("SELECT * FROM users")

// 我们也可以访问通过查询运行器创建的连接工作的实体管理器：
const users = await queryRunner.manager.find(User)

// 现在开始一个新事务：
await queryRunner.startTransaction()

try {
    // 在该事务中执行一些操作：
    await queryRunner.manager.save(user1)
    await queryRunner.manager.save(user2)
    await queryRunner.manager.save(photos)

    // 现在提交事务：
    await queryRunner.commitTransaction()
} catch (err) {
    // 发生错误时回滚我们所做的更改
    await queryRunner.rollbackTransaction()
} finally {
    // 需要释放手动创建的查询运行器：
    await queryRunner.release()
}
```

`QueryRunner` 中有三种方法来控制事务：

- `startTransaction` - 在查询运行器实例中启动一个新事务。
- `commitTransaction` - 提交使用查询运行器实例所做的所有更改。
- `rollbackTransaction` - 回滚使用查询运行器实例所做的所有更改。

详细了解请参见 [Query Runner](../query-runner.md)。