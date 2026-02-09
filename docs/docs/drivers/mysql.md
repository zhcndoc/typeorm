# MySQL / MariaDB

MySQL、MariaDB 和 Amazon Aurora MySQL 作为 TypeORM 的驱动被支持。

## 安装

```shell
npm install mysql2
```

## 数据源选项

请参见 [数据源选项](../data-source/2-data-source-options.md) 了解常用的数据源选项。您可以使用数据源类型 `mysql`、`mariadb` 和 `aurora-mysql` 来连接相应的数据库。

- `url` - 执行连接的连接 URL。请注意，其他数据源选项将会覆盖 URL 中设置的参数。

- `host` - 数据库主机。

- `port` - 数据库主机端口。MySQL 默认端口是 `3306`。

- `username` - 数据库用户名。

- `password` - 数据库密码。

- `database` - 数据库名称。

- `socketPath` - 数据库套接字路径。

- `poolSize` - 每个连接池中应包含的最大客户端数量。

- `charset` 和 `collation` - 连接的字符集/校对规则。如果指定了 SQL 层面的字符集（如 utf8mb4），则使用该字符集的默认校对规则。

- `timezone` - MySQL 服务器配置的时区。用于类型转换服务器日期/时间值为 JavaScript Date 对象，反之亦然。可以是 `local`、`Z`，或格式为 `+HH:MM` 或 `-HH:MM` 的偏移量。（默认：`local`）

- `connectTimeout` - 在初始连接到 MySQL 服务器期间，发生超时前的毫秒数。（默认：`10000`）

- `acquireTimeout` - 在初始连接到 MySQL 服务器期间，发生超时前的毫秒数。它与 `connectTimeout` 不同，`acquireTimeout` 是 TCP 连接超时，`connectTimeout` 不是。（默认：`10000`）

- `insecureAuth` - 允许连接请求旧的（不安全）认证方式的 MySQL 实例。（默认：`false`）

- `supportBigNumbers` - 处理数据库中的大数字（`BIGINT` 和 `DECIMAL` 列）时，应启用此选项。（默认：`true`）

- `bigNumberStrings` - 同时启用 `supportBigNumbers` 和 `bigNumberStrings` 会强制大数字（`BIGINT` 和 `DECIMAL` 列）始终以 JavaScript 字符串对象返回。（默认：`true`）  
启用 `supportBigNumbers` 但未启用 `bigNumberStrings` 的情况下，只有当数字无法精确用 [JavaScript 数字对象](http://ecma262-5.com/ELS5_HTML.htm#Section_8.5) 表示（超出 `[-2^53, +2^53]` 范围）时才以字符串对象返回，否则返回数字对象。如果关闭 `supportBigNumbers`，则忽略该选项。

- `dateStrings` - 强制将日期类型（`TIMESTAMP`、`DATETIME`、`DATE`）作为字符串返回，而非转换为 JavaScript Date 对象。可以为 true/false 或包含类型名的字符串数组，表示保留为字符串的类型。（默认：`false`）

- `debug` - 将协议细节打印到标准输出。可以为 true/false 或应打印的包类型名称数组。（默认：`false`）

- `trace` - 在出错时生成堆栈追踪，包含库入口调用位置（“长堆栈追踪”）。大多数调用会有轻微性能开销。（默认：`true`）

- `multipleStatements` - 允许每条查询使用多个 MySQL 语句。使用时请谨慎，可能增加 SQL 注入攻击风险。（默认：`false`）

- `legacySpatialSupport` - 使用遗留的空间函数如 `GeomFromText` 和 `AsText`，它们在 MySQL 8.0 中被符合标准的 `ST_GeomFromText` 或 `ST_AsText` 替代。（当前默认：`true`）

- `flags` - 使用除默认外的其他连接标志列表，也可以屏蔽默认标志。更多信息请参见 [连接标志](https://github.com/mysqljs/mysql#connection-flags)。

- `ssl` - 包含 SSL 参数的对象或包含 SSL 配置名称的字符串。详见 [SSL 选项](https://github.com/mysqljs/mysql#ssl-options)。

- `enableQueryTimeout` - 如果为 maxQueryExecutionTime 指定了值，除了在查询超出此时间限制时生成警告日志外，maxQueryExecutionTime 值也被用作查询的超时。更多信息请参见 [mysql 超时](https://github.com/mysqljs/mysql#timeouts)。

其他选项可以添加到 `extra` 对象中，并将直接传递给客户端库。更多见 [mysql2 文档](https://sidorares.github.io/node-mysql2/docs)。

## 列类型

`bit`、`int`、`integer`、`tinyint`、`smallint`、`mediumint`、`bigint`、`float`、`double`、`double precision`、`dec`、`decimal`、`numeric`、`fixed`、`bool`、`boolean`、`date`、`datetime`、`timestamp`、`time`、`year`、`char`、`nchar`、`national char`、`varchar`、`nvarchar`、`national varchar`、`text`、`tinytext`、`mediumtext`、`blob`、`longtext`、`tinyblob`、`mediumblob`、`longblob`、`enum`、`set`、`json`、`binary`、`varbinary`、`geometry`、`point`、`linestring`、`polygon`、`multipoint`、`multilinestring`、`multipolygon`、`geometrycollection`、`uuid`、`inet4`、`inet6`

> 注意：`uuid`、`inet4` 和 `inet6` 仅适用于 MariaDB 及其支持这些类型的对应版本。

### `enum` 列类型

请参见 [enum 列类型](../entity/1-entities.md#enum-column-type)。

### `set` 列类型

`set` 列类型由 `mariadb` 和 `mysql` 支持。存在多种可能的列定义方式：

使用 TypeScript 枚举：

```typescript
export enum UserRole {
    ADMIN = "admin",
    EDITOR = "editor",
    GHOST = "ghost",
}

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: "set",
        enum: UserRole,
        default: [UserRole.GHOST, UserRole.EDITOR],
    })
    roles: UserRole[]
}
```

使用包含 `set` 值的数组：

```typescript
export type UserRoleType = "admin" | "editor" | "ghost"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: "set",
        enum: ["admin", "editor", "ghost"],
        default: ["ghost", "editor"],
    })
    roles: UserRoleType[]
}
```

### 向量类型

MySQL 从版本 9.0 开始支持 [VECTOR 类型](https://dev.mysql.com/doc/refman/en/vector.html)，而 MariaDB 自 11.7 版本起支持 [向量](https://mariadb.com/docs/server/reference/sql-structure/vectors/vector-overview)。