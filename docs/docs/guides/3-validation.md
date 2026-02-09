# 使用验证

要使用验证，请使用 [class-validator](https://github.com/pleerock/class-validator)。
以下是如何将 class-validator 与 TypeORM 一起使用的示例：

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"
import {
    Contains,
    IsInt,
    Length,
    IsEmail,
    IsFQDN,
    IsDate,
    Min,
    Max,
} from "class-validator"

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    @Length(10, 20)
    title: string

    @Column()
    @Contains("hello")
    text: string

    @Column()
    @IsInt()
    @Min(0)
    @Max(10)
    rating: number

    @Column()
    @IsEmail()
    email: string

    @Column()
    @IsFQDN()
    site: string

    @Column()
    @IsDate()
    createDate: Date
}
```

验证：

```typescript
import { validate } from "class-validator"

let post = new Post()
post.title = "Hello" // 不应通过验证
post.text = "this is a great post about hell world" // 不应通过验证
post.rating = 11 // 不应通过验证
post.email = "google.com" // 不应通过验证
post.site = "googlecom" // 不应通过验证

const errors = await validate(post)
if (errors.length > 0) {
    throw new Error(`验证失败！`)
} else {
    await dataSource.manager.save(post)
}
```