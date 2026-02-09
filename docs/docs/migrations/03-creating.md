# 手动创建

你可以通过 CLI 指定迁移的名称和位置来创建一个新的迁移：

```shell
npx typeorm migration:create <path/to/migrations>/<migration-name>
```

例如：

```shell
npx typeorm migration:create src/db/migrations/post-refactoring
```

运行命令后，你会在 `src/db/migrations` 目录下看到一个名为 `{TIMESTAMP}-post-refactoring.ts` 的新文件，其中 `{TIMESTAMP}` 是生成迁移时的当前时间戳。

现在你可以打开该文件并添加你的迁移 SQL 查询。你的迁移文件内容应如下所示：

```typescript
import { MigrationInterface, QueryRunner } from "typeorm"

export class PostRefactoringTIMESTAMP implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {}

    async down(queryRunner: QueryRunner): Promise<void> {}
}
```

有两个方法你必须填写迁移代码：`up` 和 `down`。
`up` 包含执行迁移所需的代码。
`down` 用于还原 `up` 所做的更改。
`down` 方法用于回滚最后一次迁移。

在 `up` 和 `down` 方法中，你都有一个 `QueryRunner` 对象。
所有数据库操作都是通过该对象执行的。
了解更多关于 [query runner](../query-runner.md) 的内容。

让我们来看一下针对 `Post` 修改的迁移示例：

```typescript
import { MigrationInterface, QueryRunner } from "typeorm"

export class PostRefactoringTIMESTAMP implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "post" RENAME COLUMN "title" TO "name"`,
        )
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "post" RENAME COLUMN "name" TO "title"`,
        ) // 回滚 "up" 方法中所做的更改
    }
}
```