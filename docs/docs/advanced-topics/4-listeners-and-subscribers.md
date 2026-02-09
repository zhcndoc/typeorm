# 实体监听器与订阅者

## 什么是实体监听器？

你的任何实体都可以拥有带有自定义逻辑的方法，这些方法监听特定的实体事件。  
你必须根据你想监听的事件，用特殊的装饰器标记这些方法。

**注意：** 不要在监听器中进行任何数据库调用，应选择使用 [订阅者](#什么是订阅者)。

### `@AfterLoad`

你可以在实体中定义一个任意名称的方法并用 `@AfterLoad` 装饰它，TypeORM 会在每次实体被通过 `QueryBuilder` 或 repository/manager 的查找方法加载时调用它。  
示例：

```typescript
@Entity()
export class Post {
    @AfterLoad()
    updateCounters() {
        if (this.likesCount === undefined) this.likesCount = 0
    }
}
```

### `@BeforeInsert`

你可以在实体中定义一个任意名称的方法并用 `@BeforeInsert` 装饰它，TypeORM 会在通过 repository/manager `save` 方法插入实体之前调用它。  
示例：

```typescript
@Entity()
export class Post {
    @BeforeInsert()
    updateDates() {
        this.createdDate = new Date()
    }
}
```

### `@AfterInsert`

你可以在实体中定义一个任意名称的方法并用 `@AfterInsert` 装饰它，TypeORM 会在通过 repository/manager `save` 方法插入实体之后调用它。  
示例：

```typescript
@Entity()
export class Post {
    @AfterInsert()
    resetCounters() {
        this.counters = 0
    }
}
```

### `@BeforeUpdate`

你可以在实体中定义一个任意名称的方法并用 `@BeforeUpdate` 装饰它，TypeORM 会在通过 repository/manager `save` 方法更新已存在的实体之前调用它。  
请注意，只有当模型中的信息发生更改时才会调用。如果调用 `save` 时没有修改模型中的任何内容，`@BeforeUpdate` 和 `@AfterUpdate` 将不会被执行。  
示例：

```typescript
@Entity()
export class Post {
    @BeforeUpdate()
    updateDates() {
        this.updatedDate = new Date()
    }
}
```

### `@AfterUpdate`

你可以在实体中定义一个任意名称的方法并用 `@AfterUpdate` 装饰它，TypeORM 会在通过 repository/manager `save` 方法更新已存在的实体之后调用它。  
示例：

```typescript
@Entity()
export class Post {
    @AfterUpdate()
    updateCounters() {
        this.counter = 0
    }
}
```

### `@BeforeRemove`

你可以在实体中定义一个任意名称的方法并用 `@BeforeRemove` 装饰它，TypeORM 会在通过 repository/manager `remove` 方法移除实体之前调用它。  
示例：

```typescript
@Entity()
export class Post {
    @BeforeRemove()
    updateStatus() {
        this.status = "removed"
    }
}
```

### `@AfterRemove`

你可以在实体中定义一个任意名称的方法并用 `@AfterRemove` 装饰它，TypeORM 会在通过 repository/manager `remove` 方法移除实体之后调用它。  
示例：

```typescript
@Entity()
export class Post {
    @AfterRemove()
    updateStatus() {
        this.status = "removed"
    }
}
```

### `@BeforeSoftRemove`

你可以在实体中定义一个任意名称的方法并用 `@BeforeSoftRemove` 装饰它，TypeORM 会在通过 repository/manager `softRemove` 方法软删除实体之前调用它。  
示例：

```typescript
@Entity()
export class Post {
    @BeforeSoftRemove()
    updateStatus() {
        this.status = "soft-removed"
    }
}
```

### `@AfterSoftRemove`

你可以在实体中定义一个任意名称的方法并用 `@AfterSoftRemove` 装饰它，TypeORM 会在通过 repository/manager `softRemove` 方法软删除实体之后调用它。  
示例：

```typescript
@Entity()
export class Post {
    @AfterSoftRemove()
    updateStatus() {
        this.status = "soft-removed"
    }
}
```

### `@BeforeRecover`

你可以在实体中定义一个任意名称的方法并用 `@BeforeRecover` 装饰它，TypeORM 会在通过 repository/manager `recover` 方法恢复实体之前调用它。  
示例：

```typescript
@Entity()
export class Post {
    @BeforeRecover()
    updateStatus() {
        this.status = "recovered"
    }
}
```

### `@AfterRecover`

你可以在实体中定义一个任意名称的方法并用 `@AfterRecover` 装饰它，TypeORM 会在通过 repository/manager `recover` 方法恢复实体之后调用它。  
示例：

```typescript
@Entity()
export class Post {
    @AfterRecover()
    updateStatus() {
        this.status = "recovered"
    }
}
```

## 什么是订阅者？

将一个类标记为事件订阅者，可以监听特定实体事件或所有实体事件。  
事件通过 `QueryBuilder` 和 repository/manager 方法触发。  
示例：

```typescript
@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface<Post> {
    /**
     * 指示该订阅者仅监听 Post 事件。
     */
    listenTo() {
        return Post
    }

    /**
     * 在 Post 插入前调用。
     */
    beforeInsert(event: InsertEvent<Post>) {
        console.log(`BEFORE POST INSERTED: `, event.entity)
    }
}
```

你可以实现 `EntitySubscriberInterface` 的任意方法。  
若监听所有实体，则省略 `listenTo` 方法并使用 `any`：

```typescript
@EventSubscriber()
export class PostSubscriber implements EntitySubscriberInterface {
    /**
     * 在实体加载后调用。
     */
    afterLoad(entity: any) {
        console.log(`AFTER ENTITY LOADED: `, entity)
    }

    /**
     * 查询执行前调用。
     */
    beforeQuery(event: BeforeQueryEvent<any>) {
        console.log(`BEFORE QUERY: `, event.query)
    }

    /**
     * 查询执行后调用。
     */
    afterQuery(event: AfterQueryEvent<any>) {
        console.log(`AFTER QUERY: `, event.query)
    }

    /**
     * 实体插入前调用。
     */
    beforeInsert(event: InsertEvent<any>) {
        console.log(`BEFORE ENTITY INSERTED: `, event.entity)
    }

    /**
     * 实体插入后调用。
     */
    afterInsert(event: InsertEvent<any>) {
        console.log(`AFTER ENTITY INSERTED: `, event.entity)
    }

    /**
     * 实体更新前调用。
     */
    beforeUpdate(event: UpdateEvent<any>) {
        console.log(`BEFORE ENTITY UPDATED: `, event.entity)
    }

    /**
     * 实体更新后调用。
     */
    afterUpdate(event: UpdateEvent<any>) {
        console.log(`AFTER ENTITY UPDATED: `, event.entity)
    }

    /**
     * 实体移除前调用。
     */
    beforeRemove(event: RemoveEvent<any>) {
        console.log(
            `BEFORE ENTITY WITH ID ${event.entityId} REMOVED: `,
            event.entity,
        )
    }

    /**
     * 实体移除后调用。
     */
    afterRemove(event: RemoveEvent<any>) {
        console.log(
            `AFTER ENTITY WITH ID ${event.entityId} REMOVED: `,
            event.entity,
        )
    }

    /**
     * 实体软删除前调用。
     */
    beforeSoftRemove(event: SoftRemoveEvent<any>) {
        console.log(
            `BEFORE ENTITY WITH ID ${event.entityId} SOFT REMOVED: `,
            event.entity,
        )
    }

    /**
     * 实体软删除后调用。
     */
    afterSoftRemove(event: SoftRemoveEvent<any>) {
        console.log(
            `AFTER ENTITY WITH ID ${event.entityId} SOFT REMOVED: `,
            event.entity,
        )
    }

    /**
     * 实体恢复前调用。
     */
    beforeRecover(event: RecoverEvent<any>) {
        console.log(
            `BEFORE ENTITY WITH ID ${event.entityId} RECOVERED: `,
            event.entity,
        )
    }

    /**
     * 实体恢复后调用。
     */
    afterRecover(event: RecoverEvent<any>) {
        console.log(
            `AFTER ENTITY WITH ID ${event.entityId} RECOVERED: `,
            event.entity,
        )
    }

    /**
     * 事务开始前调用。
     */
    beforeTransactionStart(event: TransactionStartEvent) {
        console.log(`BEFORE TRANSACTION STARTED: `, event)
    }

    /**
     * 事务开始后调用。
     */
    afterTransactionStart(event: TransactionStartEvent) {
        console.log(`AFTER TRANSACTION STARTED: `, event)
    }

    /**
     * 事务提交前调用。
     */
    beforeTransactionCommit(event: TransactionCommitEvent) {
        console.log(`BEFORE TRANSACTION COMMITTED: `, event)
    }

    /**
     * 事务提交后调用。
     */
    afterTransactionCommit(event: TransactionCommitEvent) {
        console.log(`AFTER TRANSACTION COMMITTED: `, event)
    }

    /**
     * 事务回滚前调用。
     */
    beforeTransactionRollback(event: TransactionRollbackEvent) {
        console.log(`BEFORE TRANSACTION ROLLBACK: `, event)
    }

    /**
     * 事务回滚后调用。
     */
    afterTransactionRollback(event: TransactionRollbackEvent) {
        console.log(`AFTER TRANSACTION ROLLBACK: `, event)
    }
}
```

确保你的 [DataSourceOptions](../data-source/2-data-source-options.md#common-data-source-options) 中的 `subscribers` 属性已设置，以便 TypeORM 加载你的订阅者。

### `事件对象`

除 `listenTo` 方法外，所有 `EntitySubscriberInterface` 的方法都接收一个事件对象，该对象包含以下基础属性：

- `dataSource: DataSource` - 事件中使用到的数据源。  
- `queryRunner: QueryRunner` - 事件事务中使用的查询执行器。  
- `manager: EntityManager` - 事件事务中使用的实体管理器。

具体事件还会有额外属性，可查看对应的 [事件接口](https://github.com/typeorm/typeorm/tree/master/src/subscriber/event)。

请注意，当使用 `Repository.update()` 时，`event.entity` 中不一定含有主键。此时仅包含传入的实体部分属性。为了在订阅者中获取主键，你可以显式地在部分实体对象字面量中传入主键值，或者使用会重新查询的 `Repository.save()`。

```typescript
await postRepository.update(post.id, { description: "Bacon ipsum dolor amet cow" })

// post.subscriber.ts
afterUpdate(event: UpdateEvent<Post>) {
  console.log(event.entity) // 输出 { description: 'Bacon ipsum dolor amet cow' }
}
```

**注意：** 所有订阅事件监听器中的数据库操作应当使用事件对象中的 `queryRunner` 或 `manager` 实例来执行。