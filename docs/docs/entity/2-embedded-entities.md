# 嵌入实体

有一种很棒的方法可以减少应用中的重复代码（使用组合优于继承），那就是使用 `嵌入列`。  
嵌入列是一个接受拥有自己列的类的列，并将这些列合并到当前实体的数据库表中。

示例：

假设我们有 `User`、`Employee` 和 `Student` 实体。  
这些实体都有一些共同的属性——`first name` 和 `last name`。

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    isActive: boolean
}
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Employee {
    @PrimaryGeneratedColumn()
    id: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    salary: string
}
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Student {
    @PrimaryGeneratedColumn()
    id: string

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    faculty: string
}
```

我们可以通过创建一个包含这些列的新类来减少 `firstName` 和 `lastName` 的重复：

```typescript
import { Column } from "typeorm"

export class Name {
    @Column()
    first: string

    @Column()
    last: string
}
```

然后你可以在实体中“连接”这些列：

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { Name } from "./Name"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: string

    @Column(() => Name)
    name: Name

    @Column()
    isActive: boolean
}
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { Name } from "./Name"

@Entity()
export class Employee {
    @PrimaryGeneratedColumn()
    id: string

    @Column(() => Name)
    name: Name

    @Column()
    salary: number
}
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import { Name } from "./Name"

@Entity()
export class Student {
    @PrimaryGeneratedColumn()
    id: string

    @Column(() => Name)
    name: Name

    @Column()
    faculty: string
}
```

`Name` 实体中定义的所有列将会被合并到 `user`、`employee` 和 `student` 表中：

```text
+-------------+--------------+----------------------------+
|                          user                           |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| nameFirst   | varchar(255) |                            |
| nameLast    | varchar(255) |                            |
| isActive    | boolean      |                            |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                        employee                         |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| nameFirst   | varchar(255) |                            |
| nameLast    | varchar(255) |                            |
| salary      | int          |                            |
+-------------+--------------+----------------------------+

+-------------+--------------+----------------------------+
|                         student                         |
+-------------+--------------+----------------------------+
| id          | int          | PRIMARY KEY AUTO_INCREMENT |
| nameFirst   | varchar(255) |                            |
| nameLast    | varchar(255) |                            |
| faculty     | varchar(255) |                            |
+-------------+--------------+----------------------------+
```

这样就减少了实体类中的代码重复。  
你可以在嵌入类中使用任意数量的列（或关系）。  
甚至可以在嵌入类内部嵌套嵌入列。