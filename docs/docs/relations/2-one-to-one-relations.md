# 一对一关系

一对一关系是指 A 只包含一个 B 实例，B 也只包含一个 A 实例。
举个例子，`User` 和 `Profile` 实体。
User 只能有一个 Profile，一个 Profile 也只属于一个 User。

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    gender: string

    @Column()
    photo: string
}
```

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from "typeorm"
import { Profile } from "./Profile"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToOne(() => Profile)
    @JoinColumn()
    profile: Profile
}
```

这里我们给 `user` 添加了 `@OneToOne`，并指定目标关系类型为 `Profile`。
我们还加上了 `@JoinColumn`，这是必须的，并且只能设置在关系的一侧。
设置 `@JoinColumn` 的那一侧的表会包含“关系 id”以及指向目标实体表的外键。

这个例子将会生成以下表：

```text
+-------------+--------------+----------------------------+
|                        profile                          |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| gender      | varchar(255) |                            |
| photo       | varchar(255) |                            |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                          user                           |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(255) |                            |
| profileId   | int          | FOREIGN KEY                |
+-------------+--------------+----------------------------+
```

再次强调，`@JoinColumn` 必须只能设置在关系的一侧——也就是数据库表中必须有外键的一侧。

下面是如何保存这样一个关系的示例：

```typescript
const profile = new Profile()
profile.gender = "male"
profile.photo = "me.jpg"
await dataSource.manager.save(profile)

const user = new User()
user.name = "Joe Smith"
user.profile = profile
await dataSource.manager.save(user)
```

启用 [级联操作](./1-relations.md#cascades) 后，你只需要一次 `save` 调用即可保存此关系。

要加载包含 profile 的 user，你必须在 `FindOptions` 中指定关系：

```typescript
const users = await dataSource.getRepository(User).find({
    relations: {
        profile: true,
    },
})
```

或者使用 `QueryBuilder` 进行连接：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.profile", "profile")
    .getMany()
```

如果在关系上启用了急加载（eager loading），你就不需要在 find 命令中指定关系，因为它会始终自动加载。
如果使用 QueryBuilder，急加载关系将被禁用，你必须用 `leftJoinAndSelect` 来加载关系。

关系可以是单向的，也可以是双向的。
单向关系是关系装饰器只在一侧设置的关系。
双向关系是双方都设置了装饰器的关系。

我们刚刚创建了一个单向关系，接下来将其改为双向：

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToOne } from "typeorm"
import { User } from "./User"

@Entity()
export class Profile {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    gender: string

    @Column()
    photo: string

    @OneToOne(() => User, (user) => user.profile) // 第二个参数指定反向关系
    user: User
}
```

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
} from "typeorm"
import { Profile } from "./Profile"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToOne(() => Profile, (profile) => profile.user) // 第二个参数指定反向关系
    @JoinColumn()
    profile: Profile
}
```

我们刚刚将关系改为双向。注意，反向关系不需要加 `@JoinColumn`。
`@JoinColumn` 只能放在关系的一侧——也就是会拥有外键的表那一侧。

双向关系允许你通过 `QueryBuilder` 从双方进行连接：

```typescript
const profiles = await dataSource
    .getRepository(Profile)
    .createQueryBuilder("profile")
    .leftJoinAndSelect("profile.user", "user")
    .getMany()
```
