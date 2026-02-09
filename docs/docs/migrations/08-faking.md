# 伪造迁移和回滚

你也可以使用 `--fake` 标志（简写为 `-f`）来伪造运行迁移。这将把迁移添加到迁移表中，但不会实际运行迁移。 当数据库已经手动修改后创建的迁移，或者迁移已经被外部运行过（例如，通过其他工具或应用程序），且你仍然希望保持一致的迁移历史时，这非常有用。

```shell
typeorm migration:run -d path-to-datasource-config --fake
```

这同样适用于回滚。

```shell
typeorm migration:revert -d path-to-datasource-config --fake
```

### 事务模式

默认情况下，TypeORM 会将所有迁移包裹在一个单一的事务中执行。这对应于 `--transaction all` 标志。 如果你需要更细粒度的事务控制，可以使用 `--transaction each` 标志让每个迁移单独包裹事务，或者使用 `--transaction none` 标志完全放弃用事务包裹迁移。

除了这些标志，你还可以通过在 `MigrationInterface` 上设置 `transaction` 属性为 `true` 或 `false` 来覆盖单个迁移的事务行为。这只在 `each` 或 `none` 事务模式下有效。

```typescript
import { MigrationInterface, QueryRunner } from "typeorm"

export class AddIndexTIMESTAMP implements MigrationInterface {
    transaction = false

    async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `CREATE INDEX CONCURRENTLY post_names_idx ON post(name)`,
        )
    }

    async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX CONCURRENTLY post_names_idx`)
    }
}
```