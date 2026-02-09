# Postgres / CockroachDB

PostgreSQL、CockroachDB 和 Amazon Aurora Postgres 被支持作为 TypeORM 的驱动程序。

兼容 PostgreSQL 的数据库也可以通过 `postgres` 数据源类型与 TypeORM 一起使用。

要使用 YugabyteDB，请参阅[他们的 ORM 文档](https://docs.yugabyte.com/stable/drivers-orms/nodejs/typeorm/)以开始使用。请注意，由于 YugabyteDB [不支持](https://docs.yugabyte.com/stable/develop/postgresql-compatibility/#unsupported-postgresql-features) 某些 Postgres 功能，部分 TypeORM 功能可能受限。

## 安装

```shell
npm install pg
```

若需支持流式传输：

```shell
npm install pg-query-stream
```

## 数据源选项

有关常见数据源选项，请参见[数据源选项](../data-source/2-data-source-options.md)。您可以使用数据源类型 `postgres`、`cockroachdb` 或 `aurora-postgres` 连接到相应的数据库。

- `url` - 连接所用的 URL。请注意，其他数据源选项将覆盖来自 URL 设置的参数。

- `host` - 数据库主机。

- `port` - 数据库端口。Postgres 默认端口是 `5432`。

- `username` - 数据库用户名。

- `password` - 数据库密码。

- `database` - 数据库名称。

- `schema` - 模式名称。默认是 "public"。

- `connectTimeoutMS` - 在初始连接到 Postgres 服务器时发生超时的毫秒值。如果为 `undefined` 或设置为 `0`，则无超时。默认是 `undefined`。

- `ssl` - 包含 SSL 参数的对象。详情见 [TLS/SSL](https://node-postgres.com/features/ssl)。

- `uuidExtension` - 生成 UUID 时使用的 Postgres 扩展。默认为 `uuid-ossp`。如果 `uuid-ossp` 扩展不可用，可以更改为 `pgcrypto`。

- `poolErrorHandler` - 当底层连接池发出 `'error'` 事件时调用的函数。接受一个参数（错误实例），默认以 `warn` 级别记录日志。

- `maxTransactionRetries` - 发生 40001 错误时最大事务重试次数。默认值是 5。

- `logNotifications` - 布尔值，决定是否将 Postgres 服务器的[通知消息](https://www.postgresql.org/docs/current/plpgsql-errors-and-messages.html)和[通知事件](https://www.postgresql.org/docs/current/sql-notify.html)包含在客户端日志的 `info` 级别中（默认：`false`）。

- `installExtensions` - 控制是否自动安装必要的 Postgres 扩展（默认：`true`）

- `extensions` - 在数据库中安装的额外 Postgres 扩展列表（默认：`undefined`）

- `applicationName` - 可在统计和日志中看到的字符串，帮助将应用程序与连接关联（默认：`undefined`）

- `parseInt8` - 布尔值，启用将 64 位整数（int8）解析为 JavaScript 数字。默认情况下，`int8` （bigint）值作为字符串返回以避免溢出。JavaScript 的数字基于 IEEE-754，超出最大安全整数范围（`Number.MAX_SAFE_INTEGER = +2^53`）会丢失精度。如果需要完整的 64 位范围，建议使用返回的字符串或转换为本地的 `bigint`，而不是使用此选项。

其他选项可添加至 `extra` 对象，会直接传递给客户端库。详情见 `pg` 文档中的 [Pool](https://node-postgres.com/apis/pool#new-pool) 和 [Client](https://node-postgres.com/apis/client#new-client)。

## 列类型

### `postgres` 的列类型

`int`, `int2`, `int4`, `int8`, `smallint`, `integer`, `bigint`, `decimal`, `numeric`, `real`, `float`, `float4`, `float8`, `double precision`, `money`, `character varying`, `varchar`, `character`, `char`, `text`, `citext`, `hstore`, `bytea`, `bit`, `varbit`, `bit varying`, `timetz`, `timestamptz`, `timestamp`, `timestamp without time zone`, `timestamp with time zone`, `date`, `time`, `time without time zone`, `time with time zone`, `interval`, `bool`, `boolean`, `enum`, `point`, `line`, `lseg`, `box`, `path`, `polygon`, `circle`, `cidr`, `inet`, `macaddr`, `macaddr8`, `tsvector`, `tsquery`, `uuid`, `xml`, `json`, `jsonb`, `jsonpath`, `int4range`, `int8range`, `numrange`, `tsrange`, `tstzrange`, `daterange`, `int4multirange`, `int8multirange`, `nummultirange`, `tsmultirange`, `tstzmultirange`, `multidaterange`, `geometry`, `geography`, `cube`, `ltree`, `vector`, `halfvec`。

### `cockroachdb` 的列类型

`array`, `bool`, `boolean`, `bytes`, `bytea`, `blob`, `date`, `numeric`, `decimal`, `dec`, `float`, `float4`, `float8`, `double precision`, `real`, `inet`, `int`, `integer`, `int2`, `int8`, `int64`, `smallint`, `bigint`, `interval`, `string`, `character varying`, `character`, `char`, `char varying`, `varchar`, `text`, `time`, `time without time zone`, `timestamp`, `timestamptz`, `timestamp without time zone`, `timestamp with time zone`, `json`, `jsonb`, `uuid`

注意：CockroachDB 将所有数值类型数据作为 `string` 返回。但是如果省略列类型且将属性定义为 `number`，ORM 会使用 `parseInt` 将字符串转换成数字。

### 向量列

向量列可以用于使用 PostgreSQL 的向量操作符进行相似性搜索：

```typescript
// L2 距离（欧几里得） - <->
const results = await dataSource.sql`
    SELECT id, embedding
    FROM post
    ORDER BY embedding <-> ${"[1,2,3]"}
    LIMIT 5`

// 余弦距离 - <=>
const results = await dataSource.sql`
    SELECT id, embedding
    FROM post
    ORDER BY embedding <=> ${"[1,2,3]"}
    LIMIT 5`

// 内积 - <#>
const results = await dataSource.sql`
    SELECT id, embedding
    FROM post
    ORDER BY embedding <#> ${"[1,2,3]"}
    LIMIT 5`
```

### 空间列

TypeORM 对 PostgreSQL 和 CockroachDB 的支持使用 [GeoJSON](http://geojson.org/) 作为交换格式，因此几何列应该被标记为 `object` 或 `Geometry`（或其子类，例如 `Point`），可以导入 [`geojson` 类型](https://www.npmjs.com/package/@types/geojson) 或使用 TypeORM 内置的 GeoJSON 类型：

```typescript
import {
    Entity,
    PrimaryColumn,
    Column,
    Point,
    LineString,
    MultiPoint
} from "typeorm"

@Entity()
export class Thing {
    @PrimaryColumn()
    id: number

    @Column("geometry")
    point: Point

    @Column("geometry")
    linestring: LineString

    @Column("geometry", {
        spatialFeatureType: "MultiPoint",
        srid: 4326,
    })
    multiPointWithSRID: MultiPoint
}

...

const thing = new Thing()
thing.point = {
    type: "Point",
    coordinates: [116.443987, 39.920843],
}
thing.linestring = {
    type: "LineString",
    coordinates: [
        [-87.623177, 41.881832],
        [-90.199402, 38.627003],
        [-82.446732, 38.413651],
        [-87.623177, 41.881832],
    ],
}
thing.multiPointWithSRID = {
    type: "MultiPoint",
    coordinates: [
        [100.0, 0.0],
        [101.0, 1.0],
    ],
}
```

TypeORM 会尽力正确处理，但并非总能确定插入值或 PostGIS 函数的结果是否应视为几何体。因此，您可能会写类似如下代码，将值从 GeoJSON 转换为 PostGIS `geometry`，并将几何结果以 `json` 作为 GeoJSON 处理：

```typescript
import { Point } from "typeorm"

const origin: Point = {
    type: "Point",
    coordinates: [0, 0],
}

await dataSource.manager
    .createQueryBuilder(Thing, "thing")
    // 将字符串化的 GeoJSON 转换为匹配表中 SRID 的几何体
    .where(
        "ST_Distance(geom, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(geom))) > 0",
    )
    .orderBy(
        "ST_Distance(geom, ST_SetSRID(ST_GeomFromGeoJSON(:origin), ST_SRID(geom)))",
        "ASC",
    )
    .setParameters({
        // 字符串化 GeoJSON
        origin: JSON.stringify(origin),
    })
    .getMany()

await dataSource.manager
    .createQueryBuilder(Thing, "thing")
    // 将几何结果转换成 GeoJSON，以 JSON 形式返回（以便 TypeORM 知道要反序列化）
    .select("ST_AsGeoJSON(ST_Buffer(geom, 0.1))::json geom")
    .from("thing")
    .getMany()
```