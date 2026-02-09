# 执行和回滚

一旦你有需要在生产环境运行的迁移，可以使用 CLI 命令来执行它们：

```shell
typeorm migration:run -- -d path-to-datasource-config
```

**`typeorm migration:create` 和 `typeorm migration:generate` 会创建 `.ts` 文件，除非你使用了 `o` 标志（详见 [生成迁移](04-generating.md)）。`migration:run` 和 `migration:revert` 命令仅支持 `.js` 文件。因此，在运行这些命令之前需要先编译 TypeScript 文件。** 另外，你也可以结合 `ts-node` 和 `typeorm` 来运行 `.ts` 格式的迁移文件。

使用 `ts-node` 的示例：

```shell
npx typeorm-ts-node-commonjs migration:run -- -d path-to-datasource-config
```

ESM 项目中使用 `ts-node` 的示例：

```shell
npx typeorm-ts-node-esm migration:run -- -d path-to-datasource-config
```

```shell
npx typeorm-ts-node-esm migration:generate ./src/migrations/update-post-table -d ./src/data-source.ts
```

该命令会执行所有待执行的迁移，并按照时间戳顺序依次执行。
这意味着所有在你创建的迁移中 `up` 方法里编写的 SQL 查询都会被执行。
就是这样！现在你的数据库架构已经是最新的了。