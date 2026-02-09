# 迁移是如何工作的？

一旦进入生产环境，您需要将模型的更改同步到数据库中。  
通常，在数据库中已有数据后，不建议在生产环境中使用 `synchronize: true` 来进行架构同步。  
这时候，迁移（migrations）就派上用场了。

迁移就是一个包含 SQL 查询的单个文件，用于更新数据库架构并将新更改应用到现有数据库中。

假设您已经有一个数据库和一个 `Post` 实体：

```typescript
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm"

@Entity()
export class Post {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    text: string
}
```

而您的实体在生产环境中已经运行了几个月且没有任何更改。  
您的数据库中有数千条帖子。

现在，您需要发布一个新版本，将 `title` 重命名为 `name`。  
您会怎么做？

您需要创建一个包含以下 SQL 查询的新迁移（PostgreSQL 语法）：

```sql
ALTER TABLE "post" RENAME COLUMN "title" TO "name";
```

一旦您执行了这条 SQL 查询，数据库架构就准备好配合您的新代码库工作了。  
TypeORM 提供了一个可以编写这类 SQL 查询并在需要时运行的地方。  
这个地方被称为“迁移”。