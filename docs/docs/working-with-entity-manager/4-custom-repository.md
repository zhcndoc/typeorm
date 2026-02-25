# 自定义仓库

你可以创建一个自定义仓库，其中应包含操作数据库的方法。
例如，假设我们想要有一个名为 `findByName(firstName: string, lastName: string)` 的方法，
用于根据给定的名字和姓氏搜索用户。
这个方法最合适放在一个 `Repository` 中，
这样我们就可以像 `userRepository.findByName(...)` 那样调用它。
你可以通过自定义仓库来实现这一点。

创建自定义仓库有几种方式。

- [如何创建自定义仓库](#how-to-create-custom-repository)
- [在事务中使用自定义仓库](#using-custom-repositories-in-transactions)

## 如何创建自定义仓库？

通常的做法是将仓库实例赋值给一个全局导出的变量，
在应用程序中使用这个变量，例如：

```ts
// user.repository.ts
export const UserRepository = dataSource.getRepository(User)

// user.controller.ts
export class UserController {
    users() {
        return UserRepository.find()
    }
}
```

为了扩展 `UserRepository` 的功能，你可以使用 `Repository` 类的 `.extend` 方法：

```typescript
// user.repository.ts
export const UserRepository = dataSource.getRepository(User).extend({
    findByName(firstName: string, lastName: string) {
        return this.createQueryBuilder("user")
            .where("user.firstName = :firstName", { firstName })
            .andWhere("user.lastName = :lastName", { lastName })
            .getMany()
    },
})

// user.controller.ts
export class UserController {
    users() {
        return UserRepository.findByName("Timber", "Saw")
    }
}
```

## 在事务中使用自定义仓库

事务有自己的执行范围：它们有自己的查询运行器、实体管理器和仓库实例。
这就是为什么在事务中使用全局（数据源的）实体管理器和仓库不起作用的原因。
为了在事务范围内正确执行查询，你**必须**使用事务提供的实体管理器
及其 `getRepository` 方法。若要在事务中使用自定义仓库，
你必须使用提供的实体管理器实例的 `withRepository` 方法：

```typescript
await dataSource.transaction(async (manager) => {
    // 在事务中你必须使用事务提供的 manager 实例，
    // 不能使用全局实体管理器或仓库，
    // 因为该 manager 是独立且事务性的

    const userRepository = manager.withRepository(UserRepository)
    await userRepository.createAndSave("Timber", "Saw")
    const timber = await userRepository.findByName("Timber", "Saw")
})
```
