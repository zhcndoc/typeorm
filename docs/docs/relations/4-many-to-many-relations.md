# 多对多关系

## 什么是多对多关系？

多对多是一种关系，其中 A 包含多个 B 实例，B 也包含多个 A 实例。  
我们以 `Question` 和 `Category` 实体为例。  
一个问题可以有多个分类，每个分类也可以有多个问题。

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string
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

    @ManyToMany(() => Category)
    @JoinTable()
    categories: Category[]
}
```

`@JoinTable()` 是 `@ManyToMany` 关系必须的。  
你必须在关系的一方（拥有方）上放置 `@JoinTable`。

该示例会生成如下表：

```text
+-------------+--------------+----------------------------+
|                        category                         |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| name        | varchar(255) |                            |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                        question                         |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| title       | varchar(255) |                            |
| text        | varchar(255) |                            |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|              question_categories_category               |
+-------------+--------------+----------------------------+
| questionId  | int          | PRIMARY KEY FOREIGN KEY    |
| categoryId  | int          | PRIMARY KEY FOREIGN KEY    |
+-------------+--------------+----------------------------+
```

## 保存多对多关系

启用 [级联操作](./1-relations.md#cascades) 后，你可以只用一次 `save` 调用保存该关系。

```typescript
const category1 = new Category()
category1.name = "animals"
await dataSource.manager.save(category1)

const category2 = new Category()
category2.name = "zoo"
await dataSource.manager.save(category2)

const question = new Question()
question.title = "dogs"
question.text = "who let the dogs out?"
question.categories = [category1, category2]
await dataSource.manager.save(question)
```

## 删除多对多关系

启用 [级联操作](./1-relations.md#cascades) 后，你可以只用一次 `save` 调用删除该关系。

要删除两个记录之间的多对多关系，从对应字段中移除对应记录并保存即可。

```typescript
const question = await dataSource.getRepository(Question).findOne({
    relations: {
        categories: true,
    },
    where: { id: 1 },
})
question.categories = question.categories.filter((category) => {
    return category.id !== categoryToRemove.id
})
await dataSource.manager.save(question)
```

这只会删除连接表中的记录，`question` 和 `categoryToRemove` 记录仍然存在。

## 使用级联软删除关系

此示例展示了级联软删除的行为：

```typescript
const category1 = new Category()
category1.name = "animals"

const category2 = new Category()
category2.name = "zoo"

const question = new Question()
question.categories = [category1, category2]
const newQuestion = await dataSource.manager.save(question)

await dataSource.manager.softRemove(newQuestion)
```

在此示例中，我们没有调用 `save` 或 `softRemove` 来处理 `category1` 和 `category2`，但当关系选项的级联设置为 `true` 时，它们会被自动保存并进行软删除，如下所示：

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

    @ManyToMany(() => Category, (category) => category.questions, {
        cascade: true,
    })
    @JoinTable()
    categories: Category[]
}
```

## 加载多对多关系

要加载包含分类的题目，必须在 `FindOptions` 中指定关系：

```typescript
const questionRepository = dataSource.getRepository(Question)
const questions = await questionRepository.find({
    relations: {
        categories: true,
    },
})
```

或者使用 `QueryBuilder` 连接它们：

```typescript
const questions = await dataSource
    .getRepository(Question)
    .createQueryBuilder("question")
    .leftJoinAndSelect("question.categories", "category")
    .getMany()
```

启用急切加载（eager loading）时，你无需在 find 命令中指定关系，因为它会自动加载。但如果你使用 QueryBuilder，急切加载则被禁用，必须使用 `leftJoinAndSelect` 才能加载关系。

## 双向关系

关系可以是单向或双向的。  
单向关系指仅在一方使用关系装饰器的关系。  
双向关系指在关系两端都使用装饰器的关系。

我们刚创建的是单向关系。下面将其改为双向关系：

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from "typeorm"
import { Question } from "./Question"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @ManyToMany(() => Question, (question) => question.categories)
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

    @ManyToMany(() => Category, (category) => category.questions)
    @JoinTable()
    categories: Category[]
}
```

我们刚刚让关系变成了双向的。注意反向关系没有 `@JoinTable`，  
`@JoinTable` 只能放在关系的一侧。

双向关系允许你用 `QueryBuilder` 从两端进行关联查询：

```typescript
const categoriesWithQuestions = await dataSource
    .getRepository(Category)
    .createQueryBuilder("category")
    .leftJoinAndSelect("category.questions", "question")
    .getMany()
```

## 带有自定义属性的多对多关系

如果你需要在多对多关系中添加额外属性，你需要自己创建一个新的实体。  
例如，如果你希望实体 `Question` 和 `Category` 之间的多对多关系带有一个额外的 `order` 列，那么你需要创建一个带有两个指向双方的 `ManyToOne` 关系和自定义列的实体 `QuestionToCategory`：

```typescript
import { Entity, Column, ManyToOne, PrimaryGeneratedColumn } from "typeorm"
import { Question } from "./question"
import { Category } from "./category"

@Entity()
export class QuestionToCategory {
    @PrimaryGeneratedColumn()
    public questionToCategoryId: number

    @Column()
    public questionId: number

    @Column()
    public categoryId: number

    @Column()
    public order: number

    @ManyToOne(() => Question, (question) => question.questionToCategories)
    public question: Question

    @ManyToOne(() => Category, (category) => category.questionToCategories)
    public category: Category
}
```

此外，你需要在 `Question` 和 `Category` 中添加类似如下的关系：

```typescript
// category.ts
...
@OneToMany(() => QuestionToCategory, questionToCategory => questionToCategory.category)
public questionToCategories: QuestionToCategory[];

// question.ts
...
@OneToMany(() => QuestionToCategory, questionToCategory => questionToCategory.question)
public questionToCategories: QuestionToCategory[];
```