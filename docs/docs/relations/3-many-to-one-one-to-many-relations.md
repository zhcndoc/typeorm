# 多对一 / 一对多 关系

多对一 / 一对多 是一种关系，其中 A 包含多个 B 的实例，但 B 只包含一个 A 的实例。
以 `User`（用户）和 `Photo`（照片）实体为例。
用户可以拥有多张照片，但每张照片只能属于一个用户。

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from "typeorm"
import { User } from "./User"

@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    url: string

    @ManyToOne(() => User, (user) => user.photos)
    user: User
}
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm"
import { Photo } from "./Photo"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @OneToMany(() => Photo, (photo) => photo.user)
    photos: Photo[]
}
```

这里我们在 `photos` 属性上添加了 `@OneToMany`，并指定目标关系类型为 `Photo`。
你可以在 `@ManyToOne` / `@OneToMany` 关系中省略 `@JoinColumn`。
`@OneToMany` 不能单独存在，必须配合 `@ManyToOne`。
如果你想使用 `@OneToMany`，必须先有对应的 `@ManyToOne`。反之则不然：如果你只关心 `@ManyToOne` 关系，可以在相关实体中只定义它而不必定义 `@OneToMany`。
设置了 `@ManyToOne` 的地方，其相关实体将具有“关系 ID”和外键。

此示例将生成如下表结构：

```text
+-------------+--------------+----------------------------+
|                         photo                           |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| url         | varchar(255) |                            |
| userId      | int          | FOREIGN KEY                |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                          user                           |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(255) |                            |
+-------------+--------------+----------------------------+
```

保存此类关系的示例：

```typescript
const photo1 = new Photo()
photo1.url = "me.jpg"
await dataSource.manager.save(photo1)

const photo2 = new Photo()
photo2.url = "me-and-bears.jpg"
await dataSource.manager.save(photo2)

const user = new User()
user.name = "John"
user.photos = [photo1, photo2]
await dataSource.manager.save(user)
```

或者你也可以这样做：

```typescript
const user = new User()
user.name = "Leo"
await dataSource.manager.save(user)

const photo1 = new Photo()
photo1.url = "me.jpg"
photo1.user = user
await dataSource.manager.save(photo1)

const photo2 = new Photo()
photo2.url = "me-and-bears.jpg"
photo2.user = user
await dataSource.manager.save(photo2)
```

启用了 [级联操作](./1-relations.md#cascades) 后，你只需一次 `save` 调用即可保存该关系。

要加载包含照片的用户，必须在 `FindOptions` 中指定关系：

```typescript
const userRepository = dataSource.getRepository(User)
const users = await userRepository.find({
    relations: {
        photos: true,
    },
})

// 或从反向关系加载

const photoRepository = dataSource.getRepository(Photo)
const photos = await photoRepository.find({
    relations: {
        user: true,
    },
})
```

或者使用 `QueryBuilder` 联合查询：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.photos", "photo")
    .getMany()

// 或从反向关系查询

const photos = await dataSource
    .getRepository(Photo)
    .createQueryBuilder("photo")
    .leftJoinAndSelect("photo.user", "user")
    .getMany()
```

如果在关系上启用了急加载（eager loading），则不必在查找命令中显式指定关系，因为它会**自动始终加载**。
但如果你使用 QueryBuilder，则急加载关系被禁用，必须使用 `leftJoinAndSelect` 显式加载关系。