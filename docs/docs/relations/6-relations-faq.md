# 关系常见问题

## 如何创建自引用关系？

自引用关系是指实体与自身有关系的关系。
当你存储树形结构的实体时非常有用。
另外，“邻接列表”模式也是通过自引用关系实现的。
例如，你想在应用中创建分类树。
分类可以嵌套分类，嵌套分类又可以嵌套其他分类，依此类推。
这时候自引用关系就非常方便。
基本上自引用关系就是普通关系，只不过目标实体是自身。
示例：

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
} from "typeorm"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    text: string

    @ManyToOne((type) => Category, (category) => category.childCategories)
    parentCategory: Category

    @OneToMany((type) => Category, (category) => category.parentCategory)
    childCategories: Category[]
}
```

## 如何不联表加载关系而仅使用关系 ID？

有时候你希望在对象中仅包含关联对象的 ID，而不加载关联对象本身。
例如：

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

    @OneToOne((type) => Profile)
    @JoinColumn()
    profile: Profile
}
```

当你加载一个用户但没有联表加载 `profile` 时，用户对象中不会包含任何 profile 的信息，甚至连 profile 的 id 都没有：

```javascript
User {
  id: 1,
  name: "Umed"
}
```

但有时你想知道当前用户的“profile id”，而不加载整个 profile。
为此，只需在实体中添加一个用 `@Column` 装饰器标记的新属性，并且名称必须与关联列的列名一致。示例：

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

    @Column({ nullable: true })
    profileId: number

    @OneToOne((type) => Profile)
    @JoinColumn()
    profile: Profile
}
```

就这么简单。下次你加载用户对象时，它就会包含 profile 的 id：

```javascript
User {
  id: 1,
  name: "Umed",
  profileId: 1
}
```

## 如何加载实体中的关系？

加载实体关系最简单的方式是使用 `FindOptions` 的 `relations` 选项：

```typescript
const users = await dataSource.getRepository(User).find({
    relations: {
        profile: true,
        photos: true,
        videos: true,
    },
})
```

另一种更灵活的方式是使用 `QueryBuilder`：

```typescript
const users = await dataSource
    .getRepository(User)
    .createQueryBuilder("user")
    .leftJoinAndSelect("user.profile", "profile")
    .leftJoinAndSelect("user.photos", "photo")
    .leftJoinAndSelect("user.videos", "video")
    .getMany()
```

使用 `QueryBuilder` 你可以使用 `innerJoinAndSelect` 替代 `leftJoinAndSelect`  
（关于 `LEFT JOIN` 和 `INNER JOIN` 的区别，请参考你的 SQL 文档），
还可以根据条件联表，排序等等。

了解更多关于 [`QueryBuilder`](../query-builder/1-select-query-builder.md)。

## 避免关系属性初始化器

有时初始化关系属性是很有用的，例如：

```typescript
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToMany,
    JoinTable,
} from "typeorm"
import { Category } from "./Category"

@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    text: string

    @ManyToMany((type) => Category, (category) => category.questions)
    @JoinTable()
    categories: Category[] = [] // 注意这里有 = [] 初始化
}
```

然而，在 TypeORM 实体中，这可能会导致问题。
为了理解这个问题，先尝试不初始化关系属性来加载一个 Question 实体。
你加载的对象会是这样的：

```javascript
Question {
    id: 1,
    title: "Question about ..."
}
```

此时保存该对象时，因为 `categories` 没有被设置，所以不会对数据库里的关联数据做出改变。

但是如果你有初始化器，加载结果将会是：

```javascript
Question {
    id: 1,
    title: "Question about ...",
    categories: []
}
```

保存该对象时，TypeORM 会检测数据库中与该问题相关联的 categories，
然后断开它们的绑定。为什么？因为关系被赋予了 `[]` 或者某些项，会被视为“某些关联已被移除”，
这是检测关联是否被移除的唯一办法。

因此，保存如此对象会导致所有之前设置的 categories 被删除，带来问题。

如何避免这种情况？只需不要在实体中初始化数组即可。
同样规则适用于构造函数——在构造函数中也不要初始化关系属性。

## 避免创建外键约束

有时出于性能考虑，你可能希望两个实体之间有所联系，但不希望在数据库级别创建外键约束。
你可以通过 `createForeignKeyConstraints` 选项来控制是否创建外键约束（默认值：true）。

```typescript
import { Entity, PrimaryColumn, Column, ManyToOne } from "typeorm"
import { Person } from "./Person"

@Entity()
export class ActionLog {
    @PrimaryColumn()
    id: number

    @Column()
    date: Date

    @Column()
    action: string

    @ManyToOne((type) => Person, {
        createForeignKeyConstraints: false,
    })
    person: Person
}
```

## 避免循环导入错误

下面是一个例子，展示如何定义实体且不导致某些环境下的错误。
在此情形中，我们有 Action.ts 和 Person.ts 互相导入以实现多对多关系。
我们使用 `import type` 以便仅使用类型信息，而不生成任何 JavaScript 代码。

```typescript
import { Entity, PrimaryColumn, Column, ManyToMany } from "typeorm"
import type { Person } from "./Person"

@Entity()
export class ActionLog {
    @PrimaryColumn()
    id: number

    @Column()
    date: Date

    @Column()
    action: string

    @ManyToMany("Person", (person: Person) => person.id)
    person: Person
}
```

```typescript
import { Entity, PrimaryColumn, ManyToMany } from "typeorm"
import type { ActionLog } from "./Action"

@Entity()
export class Person {
    @PrimaryColumn()
    id: number

    @ManyToMany("ActionLog", (actionLog: ActionLog) => actionLog.id)
    log: ActionLog
}
```
