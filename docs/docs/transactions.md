# 事务

## 创建和使用事务

事务通过 `DataSource` 或 `EntityManager` 来创建。
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

隔离级别的实现在不同数据库之间**并非**通用。每个驱动都会声明其支持的隔离级别，如果你请求了不支持的级别，TypeORM 将会抛出错误。

| 数据库驱动 | 支持的隔离级别 |
| --------------- | ----------------------------------------------------------------------------------- |
| MySQL / MariaDB | `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`             |
| PostgreSQL      | `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`             |
| CockroachDB     | `READ UNCOMMITTED`, `READ COMMITTED`\*\*, `REPEATABLE READ`\*\*, `SERIALIZABLE`     |
| SQL Server      | `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`, `SNAPSHOT` |
| Oracle          | `READ COMMITTED`, `SERIALIZABLE`                                                    |
| SAP HANA        | `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`                                 |
| SQLite          | `READ UNCOMMITTED`\*, `SERIALIZABLE`                                                |
| Spanner         | `READ UNCOMMITTED`, `READ COMMITTED`, `REPEATABLE READ`, `SERIALIZABLE`             |

\* SQLite 的 `READ UNCOMMITTED` 仅在启用[共享缓存模式](https://www.sqlite.org/sharedcache.html)时生效。在默认模式下，无论设置如何，SQLite 始终使用 `SERIALIZABLE` 隔离级别。

\*\* CockroachDB defaults to `SERIALIZABLE`. `READ COMMITTED` requires the cluster setting `sql.txn.read_committed_isolation.enabled` (enabled by default in recent versions). `READ UNCOMMITTED` is upgraded to `READ COMMITTED`, and `REPEATABLE READ` is upgraded to `SERIALIZABLE`. See [CockroachDB Read Committed](https://www.cockroachlabs.com/docs/stable/read-committed) for details.

## 默认隔离级别

你可以通过在数据源选项中设置 `isolationLevel` 来为所有事务配置默认隔离级别：

```typescript
const dataSource = new DataSource({
    type: "postgres",
    isolationLevel: "SERIALIZABLE",
    // ...
})
```

当设置后，所有未显式指定隔离级别的事务将使用此默认值。传入 `transaction()` 或 `startTransaction()` 的显式隔离级别将覆盖默认值。

> **注意：** SQL Server 还支持驱动特定的 `options.isolationLevel` 和 `options.connectionIsolationLevel` 设置，但这些设置受 [上游池限制](./drivers/microsoft-sqlserver.md#connection-pool-does-not-reset-isolation-level) 影响。上述顶级 `isolationLevel` 选项不受此限制，因为它会在每个事务上显式应用。

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

了解更多关于 [查询运行器](./query-runner.md)。
