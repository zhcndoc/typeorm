# 急切关联和懒加载关联

## 急切关联

急切关联在每次从数据库加载实体时都会自动加载。
例如：

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm"
import { Question } from "./Question"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToMany((type) => Question, (question) => question.categories)
    questions: Question[]
}
```

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

    @ManyToMany((type) => Category, (category) => category.questions, {
        eager: true,
    })
    @JoinTable()
    categories: Category[]
}
```

现在当你加载问题时，不需要使用 join 或指定想要加载的关联。
它们会自动加载：

```typescript
const questionRepository = dataSource.getRepository(Question)

// questions 会自动加载其 categories
const questions = await questionRepository.find()
```

急切关联只在使用 `find*` 方法时有效。
如果使用 `QueryBuilder`，急切关联将被禁用，必须使用 `leftJoinAndSelect` 来加载关联。
急切关联只能用于关系的一方，
两边都使用 `eager: true` 是不允许的。

## 懒加载关联

懒加载关联中的实体会在你访问它们时加载。
这类关联的类型必须是 `Promise` — 你将值存储在一个 Promise 中，
加载时也会返回一个 Promise。示例：

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm"
import { Question } from "./Question"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToMany((type) => Question, (question) => question.categories)
    questions: Promise<Question[]>
}
```

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
    categories: Promise<Category[]>
}
```

`categories` 是一个 Promise。这意味着它是懒加载的，只能存储一个包含值的 Promise。
下面是保存这类关联的示例：

```typescript
const category1 = new Category()
category1.name = "animals"
await dataSource.manager.save(category1)

const category2 = new Category()
category2.name = "zoo"
await dataSource.manager.save(category2)

const question = new Question()
question.categories = Promise.resolve([category1, category2])
await dataSource.manager.save(question)
```

下面是如何加载懒加载关联内部对象的示例：

```typescript
const [question] = await dataSource.getRepository(Question).find()
const categories = await question.categories
// 现在变量 "categories" 中包含了该 question 的所有类别
```

注意：如果你来自其他语言（如 Java、PHP 等），并习惯到处使用懒加载关联——请小心。
那些语言是同步的，懒加载是以不同方式实现的，不依赖 Promise。
在 JavaScript 和 Node.JS 中，如果想实现懒加载关联，必须使用 Promise。
这是一种非标准技术，在 TypeORM 中被视为实验性功能。