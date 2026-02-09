# 生成

TypeORM 能够根据你对实体所做的更改，自动生成迁移文件，比较它们与服务器上现有的数据库架构。

自动迁移生成会创建一个新的迁移文件，并写入所有必须执行的 SQL 查询以更新数据库。如果未检测到任何更改，该命令将以代码 `1` 退出。

假设你有一个包含 `title` 列的 `Post` 实体，你将 `title` 的名称更改为了 `name`。

你可以使用以下命令之一生成迁移：

```shell
typeorm migration:generate -d <path/to/datasource> <migration-name>
```

`-d` 参数的值应指定你定义 [DataSource](../data-source/1-data-source.md) 实例的路径。

另外，你也可以使用 `--name` 参数指定名称：

```shell
typeorm migration:generate -- -d <path/to/datasource> --name=<migration-name>
```

或者使用完整路径：

```shell
typeorm migration:generate -d <path/to/datasource> <path/to/migrations>/<migration-name>
```

假设你使用了 `post-refactoring` 作为名称，它将生成一个名为 `{TIMESTAMP}-post-refactoring.ts` 的新文件，内容如下：

```typescript
import { MigrationInterface, QueryRunner } from "typeorm"

export class PostRefactoringTIMESTAMP implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "post" ALTER COLUMN "title" RENAME TO "name"`,
        )
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "post" ALTER COLUMN "name" RENAME TO "title"`,
        )
    }
}
```

另外，你还可以使用 `o`（`--outputJs` 的别名）参数将迁移输出为 JavaScript 文件。这对于仅使用 JavaScript、未安装 TypeScript 相关包的项目非常有用。此命令将生成一个新迁移文件 `{TIMESTAMP}-PostRefactoring.js`，内容如下：

```javascript
/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class PostRefactoringTIMESTAMP {
    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(
            `ALTER TABLE "post" ALTER COLUMN "title" RENAME TO "name"`,
        )
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(
            `ALTER TABLE "post" ALTER COLUMN "name" RENAME TO "title"`,
        )
    }
}
```

默认情况下，使用 `o`（`--outputJs`）参数生成的是 CommonJS 格式的 JavaScript 代码，但你也可以使用 `esm` 参数生成 ESM 代码。这对于使用 ESM 的 JavaScript 项目非常有用：

```javascript
/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
export class PostRefactoringTIMESTAMP {
    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(
            `ALTER TABLE "post" ALTER COLUMN "title" RENAME TO "name"`,
        )
    }

    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(
            `ALTER TABLE "post" ALTER COLUMN "name" RENAME TO "title"`,
        )
    }
}
```

看吧，你不需要自己编写查询语句。

生成迁移的经验法则是：每次对模型做出更改后，都要生成相应的迁移。要对生成的迁移查询应用多行格式，可以使用 `p`（`--pretty` 的别名）参数。