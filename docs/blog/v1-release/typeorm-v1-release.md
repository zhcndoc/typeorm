---
slug: typeorm-1-0
title: TypeORM 1.0 来了
tags: [release, announcement]
date: 2026-05-19
description: TypeORM 1.0 已发布——近五年来的首个重大版本。稳定的 API 表面、数十项新功能，以及 TypeORM 将长期存在的声明。
---

TypeORM v1.0 现已发布！

这是一段漫长的旅程，但我们终于做到了。TypeORM 自 2016 年以来一直存在，是 Node.js 生态中使用最广泛的 ORM 库之一。但在那段时间里，它一直停留在 1.0 之前的状态，这并不能准确反映项目这些年来的发展成果。

1.0 之前的软件往往传递出不稳定、不成熟的信号，而现实是，TypeORM 是最成熟、最稳定、性能最好的 Node.js ORM 解决方案之一。事实上，自 2021 年发布 v0.3 以来，它已经近 5 年没有出现破坏性变更了。

当新的维护者在 2024 年底接手项目时，我们的首要目标是让项目重新回到正轨，恢复定期发布，并开始处理过去几年因 TypeORM 缺乏 नियमित维护而积压的大量问题和 PR。我们做到了，并且在 2025 年发布了 8 个补丁版本，合并了 575 个 PR（上一年为 63 个），关闭了 2,300 多个问题！

过去几个月里，团队一直专注于下一个重大目标：发布 v1.0，并表明 TypeORM 将作为一个稳定、成熟、维护良好的开源项目继续存在。这是一项巨大的工作，为了走到今天，我们投入了无数小时。

TypeORM 团队和社区很自豪地推出 v1.0。本文将介绍升级时需要了解的内容。

<!-- truncate -->

## 数据概览

从 0.3 到 1.0：

- **363 次提交**，发生在 v1 开发周期中
- **53 位贡献者**
- **每周 470 万+ 下载量**，来自 npm（前 0.1%）
- **36,400+ GitHub stars**
- **10 个受支持的数据库**，从 Postgres 到 Spanner 再到 MongoDB

## 新内容

### 更清爽的 API 表面

`Connection` 现在改为 `DataSource`。自 v0.3 起已弃用的全局 `createConnection`、`getConnection`、`getRepository`、`getManager` 等方法都已移除，取而代之的是直接使用 `dataSource.getRepository(...)`。

- **查找选项现在采用对象形式** - 使用 `relations: { profile: true, posts: true }`，而不是 `["profile", "posts"]`。`select` 也是一样。类型更好、自动补全更好、并且只有一种规范形式。
- **仓库方法已整合** - 使用 `findOneBy({ id })` 代替 `findOneById(id)`，使用 `findBy({ id: In([…]) })` 代替 `findByIds([…])`，使用 `exists()` 代替 `exist()`。每个操作都只有一种做法。
- **自定义仓库** - `@EntityRepository` 和 `getCustomRepository()` 已经移除；请直接扩展 `Repository<Entity>`，或为从 `dataSource.getRepository()` 获取的仓库附加方法。

下面的 codemod 会自动处理这些重命名中的每一项。

### 默认更安全

- **`where` 中的 `null` 和 `undefined` 现在会抛错**，适用于高级 API（`find*`、repository/manager 变更操作、`queryBuilder.setFindOptions()`）。QueryBuilder 的 `.where()`、`.andWhere()` 和 `.orWhere()` 不受影响，它们会原样透传。匹配 null 请使用 `IsNull()`，或者如果你需要忽略它们，可以设置 `invalidWhereValuesBehavior: { null: "ignore", undefined: "ignore" }`。
- **非空关联现在使用 `INNER JOIN`。** 如果你的 schema 声明了 `nullable: false`，查询就会反映这一点。上线前最好运行一次完整性检查——原本会被“漏”出来的孤儿行，现在会静默地从结果中消失。

### 测试更快，Schema 工作更清晰

- **级联清空** - `repository.clear({ cascade: true })` 会在 PostgreSQL、CockroachDB 和 Oracle 上发出 `TRUNCATE … CASCADE`。一次调用即可清空表及其依赖项。
- **`clearDatabase()` 中的批量 DROP** - Postgres 和 CockroachDB 会将单独的 drop 操作整合为批量查询。测试初始化明显更快。
- **每个 drop 方法都支持 `ifExists`** - 无需再用 try/catch 脚手架来实现幂等的 schema 清理。

### 事务行为处处更可预测

现在，凡是支持事务的驱动程序都会遵守 DataSource 级别的 `isolationLevel`，不再只限于 MS SQL Server。Aurora Postgres 和 Google Spanner 也在其中——Spanner 支持 `REPEATABLE READ` 和 `SERIALIZABLE`。

### 数据迁移更顺畅

- **`InsertQueryBuilder` 上的 `valuesFromSelect()`** - 真正的 `INSERT … SELECT`，无需为了批量迁移而退回到原始 SQL。
- **`update()` 和 `upsert()` 上的 `returning`** - 在支持 `RETURNING` 的数据库上不再需要后续 `SELECT`。

### 驱动进展

- **MongoDB** - 升级到 driver v7+，并使用基于对象的 `select` 投影，与关系型驱动保持一致。
- **PostgreSQL** - 通过 `@Index({ where: "..." })` 支持部分索引，自动安装扩展，以及用于枚举变更时更简洁的 `ALTER TYPE … ADD VALUE`。
- **SAP HANA** - 一等公民级别的 `FOR UPDATE` 锁定、通过 `@Entity({ comment: "..." })` 添加表注释，以及新的连接池超时选项。
- **SQLite** - `jsonb` 列类型。
- **React Native** - 支持 SQLite 加密密钥。

### 类型安全与资源管理

- **`update()`、`increment()` 和 `decrement()` 的实体感知类型** - 这些签名中不再有 `any`。
- **`QueryRunner` 上的 `await using`** - 当作用域退出时自动清理，减少一种连接泄漏错误。

此外，还有数十项关于查询生成、急加载、持久化以及各驱动的修复。完整列表见 [升级指南](/docs/releases/1.0/upgrading-from-0.3)。

## 平台要求

v1 提高了最低门槛：

- **Node.js 20+**（原为 16+）
- **ES2023** 目标
- 仅支持 **`mysql2`**（旧的 `mysql` 驱动已移除）
- 仅支持 **`better-sqlite3`**（`sqlite3` 已移除）
- **MongoDB driver v7+**
- **Expo SDK v52+**

v0.3 中存在的其他 API 也已移除：`@RelationCount`、IoC 容器集成、`TYPEORM_*` 环境变量自动加载、已弃用的锁模式，以及一些内部辅助工具。[升级指南](/docs/releases/1.0/upgrading-from-0.3) 中为每一项变更都提供了前后对照。

## 升级

一条命令：

```bash
npx @typeorm/codemod v1 src/
```

这个 codemod 会自动处理大部分重命名工作——导入、方法名、find-option 语法、依赖版本固定。它还会扫描你的 `package.json`，并将生态包升级到与 v1 兼容的版本，包括将 `@nestjs/typeorm` 升级到 v11.0.1+，以及数据库驱动（`mongodb`、`mysql2`、`better-sqlite3`、`redis`、`mssql`、`@google-cloud/spanner`）。对于仍然固定在已移除 API 上的包，它会打印警告。

对于大多数代码库来说，codemod 大约能完成 80% 的升级工作。剩下的——针对非空关联的新 `INNER JOIN` 行为进行数据完整性检查，以及 `null` 出现在 where 中的审计——都已在 [升级指南](/docs/releases/1.0/upgrading-from-0.3) 中说明。

## NestJS 集成

你们中的许多人会在 NestJS 应用中使用 TypeORM。作为本次发布的一部分，我们与 NestJS 团队紧密合作，以确保升级过程顺畅无阻——只需确保你使用的是 [@nestjs/typeorm v11.0.1](https://github.com/nestjs/typeorm/releases/tag/11.0.1)，它已经支持 TypeORM v1.0。

## 团队

如果你听说过 TypeORM 已经“死了”或无人维护，v1 就是我们的回应。这个项目目前由一个积极参与、并且自 2024 年底以来持续交付的团队维护：

- **指导委员会**：**Michael Bromley**（[@michaelbromley](https://github.com/michaelbromley)）和 **David Hoeck**（[@dlhck](https://github.com/dlhck)），负责领导我们去年宣布的过渡工作。
- **技术负责人**：**Lucian Mocanu**（[@alumni](https://github.com/alumni)）。
- **维护者**：**Naor Peled**（[@naorpeled](https://github.com/naorpeled)）、**Giorgio Boa**（[@gioboa](https://github.com/gioboa)）、**Piotr Kuczynski**（[@pkuczynski](https://github.com/pkuczynski)）、**Mohammed Gomaa**（[@G0maa](https://github.com/G0maa)）、**Julian Pufler**（[@pujux](https://github.com/pujux)）、**Simon Garner**（[@sgarner](https://github.com/sgarner)）、**Pieter Wigboldus**（[@w3nl](https://github.com/w3nl)）、**Mike Guida**（[@mguida22](https://github.com/mguida22)）、**Shaun Smith**（[@smith-xyz](https://github.com/smith-xyz)）以及 **Prakhar Chhalotre**（[@Cprakhar](https://github.com/Cprakhar)）。

特别感谢 **Umed Khudoiberdiev**（[@pleerock](https://github.com/pleerock)）和 **Dmitry Zotov**——TypeORM 最初是他们的项目，而 v1 建立在他们在整个 0.x 系列中交付的一切之上。

如果没有本轮发布 PR 的 53 位贡献者、所有提交了清晰复现步骤的问题的人，以及我们在 OpenCollective 上的赞助者，v1 也不会存在。谢谢你们。

如果你的公司依赖 TypeORM 但从未赞助过，现在是一个很好的时机：可以在 [OpenCollective](https://opencollective.com/typeorm) 上赞助，或通过 [maintainers@typeorm.io](mailto:maintainers@typeorm.io) 联系我们，讨论支持项目的其他方式。

## 链接

- [从 0.3 升级](/docs/releases/1.0/upgrading-from-0.3) - 包含每项变更前后对照的完整迁移指南
- [`@typeorm/codemod`](https://www.npmjs.com/package/@typeorm/codemod)
- [GitHub](https://github.com/typeorm/typeorm)
- [OpenCollective](https://opencollective.com/typeorm)
- [TypeORM 的未来（2024 年 10 月）](/blog/future-of-typeorm) - 如果你错过了治理公告
