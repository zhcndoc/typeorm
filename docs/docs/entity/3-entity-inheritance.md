# 实体继承

## 具体表继承（Concrete Table Inheritance）

通过使用实体继承模式，可以减少代码中的重复。
最简单且最有效的是具体表继承。

例如，你有 `Photo`、`Question`、`Post` 实体：

```typescript
@Entity()
export class Photo {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    description: string

    @Column()
    size: string
}
```

```typescript
@Entity()
export class Question {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    description: string

    @Column()
    answersCount: number
}
```

```typescript
@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    description: string

    @Column()
    viewCount: number
}
```

如你所见，所有这些实体都有公共的列：`id`、`title`、`description`。
为了减少重复并提供更好的抽象，我们可以为它们创建一个基类，称为 `Content`：

```typescript
export abstract class Content {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    description: string
}
```

```typescript
@Entity()
export class Photo extends Content {
    @Column()
    size: string
}
```

```typescript
@Entity()
export class Question extends Content {
    @Column()
    answersCount: number
}
```

```typescript
@Entity()
export class Post extends Content {
    @Column()
    viewCount: number
}
```

父实体中的所有列（包括关系、嵌入等）（父类也可以继承自其他实体）
都会被继承并在最终的实体中创建。

这个例子会创建 3 张表——`photo`、`question` 和 `post`。

## 单表继承（Single Table Inheritance）

TypeORM 也支持单表继承。
单表继承是一种模式，你有多个类，每个类都有自己的属性，
但在数据库中它们存储在同一张表中。

```typescript
@Entity()
@TableInheritance({ column: { type: "varchar", name: "type" } })
export class Content {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    description: string
}
```

```typescript
@ChildEntity()
export class Photo extends Content {
    @Column()
    size: string
}
```

```typescript
@ChildEntity()
export class Question extends Content {
    @Column()
    answersCount: number
}
```

```typescript
@ChildEntity()
export class Post extends Content {
    @Column()
    viewCount: number
}
```

这将创建一个名为 `content` 的单表，所有的照片、问题和帖子实例
都会保存到这张表中。

## 使用嵌入对象（Embeddeds）

通过使用“嵌入列”（embedded columns），有一种很棒的方法可以减少应用中的重复（使用组合优于继承的方式）。
在这里了解更多关于嵌入实体的内容：[链接](./2-embedded-entities.md)。