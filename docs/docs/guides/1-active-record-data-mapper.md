# Active Record 与 Data Mapper

## 什么是 Active Record 模式？

在 TypeORM 中，你可以同时使用 Active Record 和 Data Mapper 模式。

使用 Active Record 方法时，你在模型内部定义所有查询方法，并使用模型方法来保存、删除和加载对象。

简单来说，Active Record 模式是一种在模型内访问数据库的方式。  
你可以在 [Wikipedia](https://en.wikipedia.org/wiki/Active_record_pattern) 上阅读更多关于 Active Record 模式的信息。

示例：

```typescript
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    isActive: boolean
}
```

所有 Active Record 实体必须继承自 `BaseEntity` 类，该类提供了操作实体的方法。  
使用此类实体的示例：

```typescript
// 如何保存 Active Record 实体的示例
const user = new User()
user.firstName = "Timber"
user.lastName = "Saw"
user.isActive = true
await user.save()

// 如何删除 Active Record 实体的示例
await user.remove()

// 如何加载 Active Record 实体的示例
const users = await User.find({ skip: 2, take: 5 })
const newUsers = await User.findBy({ isActive: true })
const timber = await User.findOneBy({ firstName: "Timber", lastName: "Saw" })
```

`BaseEntity` 拥有大部分标准 `Repository` 的方法。  
大多数情况下，使用 Active Record 实体时无需使用 `Repository` 或 `EntityManager`。

现在假设我们想创建一个函数，通过名字和姓氏来返回用户。  
我们可以把这个函数作为静态方法放在 `User` 类中：

```typescript
import { BaseEntity, Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    isActive: boolean

    static findByName(firstName: string, lastName: string) {
        return this.createQueryBuilder("user")
            .where("user.firstName = :firstName", { firstName })
            .andWhere("user.lastName = :lastName", { lastName })
            .getMany()
    }
}
```

使用方式和其他方法一样：

```typescript
const timber = await User.findByName("Timber", "Saw")
```

## 什么是 Data Mapper 模式？

在 TypeORM 中，你可以同时使用 Active Record 和 Data Mapper 模式。

使用 Data Mapper 方法时，你将所有查询方法定义在称为“仓库（repositories）”的独立类中，  
并通过仓库来保存、删除和加载对象。  
在 Data Mapper 模式中，实体非常“哑巴”——它们只定义自己的属性，可能还带有一些“空洞”的方法。

简单来说，Data Mapper 是一种通过仓库而不是模型来访问数据库的方式。  
你可以在 [Wikipedia](https://en.wikipedia.org/wiki/Data_mapper_pattern) 上阅读更多关于 Data Mapper 模式的信息。

示例：

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    isActive: boolean
}
```

使用此类实体的示例：

```typescript
const userRepository = dataSource.getRepository(User)

// 如何保存 Data Mapper 实体的示例
const user = new User()
user.firstName = "Timber"
user.lastName = "Saw"
user.isActive = true
await userRepository.save(user)

// 如何删除 Data Mapper 实体的示例
await userRepository.remove(user)

// 如何加载 Data Mapper 实体的示例
const users = await userRepository.find({ skip: 2, take: 5 })
const newUsers = await userRepository.findBy({ isActive: true })
const timber = await userRepository.findOneBy({
    firstName: "Timber",
    lastName: "Saw",
})
```

要给标准仓库扩展自定义方法，请使用 [自定义仓库模式](../working-with-entity-manager/4-custom-repository.md)。

## 我应该选择哪种？

选择权在你。  
两种策略各有优缺点。

在软件开发中，我们始终需要考虑如何维护应用程序。  
`Data Mapper` 方法有助于提高维护性，在大型应用中更为高效。  
`Active Record` 方法保持简单，在小型应用中表现良好。