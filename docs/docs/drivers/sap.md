# SAP HANA

## 安装

TypeORM 依赖 `@sap/hana-client` 来建立数据库连接：

```shell
npm install @sap/hana-client
```

如果你使用的是 TypeORM 0.3.25 或更早版本，还需要 `hdb-pool` 来管理连接池。

## 数据源选项

有关常用数据源选项，请参阅 [数据源选项](../data-source/2-data-source-options.md)。

- `host` - SAP HANA 服务器的主机名。例如，`"localhost"`。
- `port` - SAP HANA 服务器的端口号。例如，`30015`。
- `username` - 用于连接 SAP HANA 服务器的用户名。例如，`"SYSTEM"`。
- `password` - 用于连接 SAP HANA 服务器的密码。例如，`"password"`。
- `database` - 要连接的数据库名称。例如，`"HXE"`。
- `encrypt` - 是否加密连接。例如，`true`。
- `sslValidateCertificate` - 是否验证 SSL 证书。例如，`true`。
- `key`、`cert` 和 `ca` - 用于加密连接的私钥、公钥证书和证书颁发机构。
- `pool` — 连接池配置对象：
    - `maxConnectedOrPooled`（数字）— 连接池中最大活动或空闲连接数（默认值：10）。
    - `maxPooledIdleTime`（秒）— 空闲连接关闭前的等待时间（默认值：30）。
    - `maxWaitTimeoutIfPoolExhausted`（毫秒）— 等待连接可用的最长时间（默认值：0，表示不等待）。需要 `@sap/hana-client` 版本 `2.27` 或更高。
    - `pingCheck`（布尔）— 使用前是否验证连接有效性（默认值：false）。
    - `poolCapacity`（数字）— 保持可用的最大连接数（默认值：无上限）。

更多详情及 `extra` 属性，请参阅 SAP HANA Client 官方文档：[Node.js 连接属性](https://help.sap.com/docs/SAP_HANA_CLIENT/f1b440ded6144a54ada97ff95dac7adf/4fe9978ebac44f35b9369ef5a4a26f4c.html)。

## 列类型

SAP HANA 2.0 和 SAP HANA Cloud 支持的数据类型略有不同。更多信息请查看 SAP 帮助页面：

- [SAP HANA 2.0 数据类型](https://help.sap.com/docs/SAP_HANA_PLATFORM/4fe29514fd584807ac9f2a04f6754767/20a1569875191014b507cf392724b7eb.html?locale=en-US)
- [SAP HANA Cloud 数据类型](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-sql-reference-guide/data-types)

TypeORM 的 `SapDriver` 支持的类型包括：`tinyint`、`smallint`、`integer`、`bigint`、`smalldecimal`、`decimal`、`real`、`double`、`date`、`time`、`seconddate`、`timestamp`、`boolean`、`char`、`nchar`、`varchar`、`nvarchar`、`text`、`alphanum`、`shorttext`、`array`、`varbinary`、`blob`、`clob`、`nclob`、`st_geometry`、`st_point`、`real_vector` 和 `half_vector`。其中一些数据类型在 SAP HANA Cloud 已被废弃或移除，连接到云数据库时会转换为最接近的可用替代类型。

### 向量类型

`real_vector` 和 `half_vector` 数据类型分别于 SAP HANA Cloud 2024Q1 和 2025Q2 版本引入，同时需要支持的 `@sap/hana-client` 版本。

为了与 PostgreSQL 的向量支持保持一致，TypeORM 也提供了别名：

- `vector`（`real_vector` 的别名）— 以 4 字节浮点数存储向量
- `halfvec`（`half_vector` 的别名）— 以 2 字节浮点数存储向量，优化内存使用

```typescript
@Entity()
export class Document {
    @PrimaryGeneratedColumn()
    id: number

    // 使用 SAP HANA 原生类型名称
    @Column("real_vector", { length: 1536 })
    embedding: Buffer | number[]

    @Column("half_vector", { length: 768 })
    reduced_embedding: Buffer | number[]

    // 使用跨数据库别名（推荐）
    @Column("vector", { length: 1536 })
    universal_embedding: Buffer | number[]

    @Column("halfvec", { length: 768 })
    universal_reduced_embedding: Buffer | number[]
}
```

默认情况下，客户端会以更高效的 `fvecs`/`hvecs` 格式返回一个 `Buffer`，也可以通过在连接选项中添加 `{ extra: { vectorOutputType: "Array" } }` 让驱动转换值为 `number[]`。关于更多信息，请参阅 SAP HANA Client 文档中的 [REAL_VECTOR](https://help.sap.com/docs/SAP_HANA_CLIENT/f1b440ded6144a54ada97ff95dac7adf/0d197e4389c64e6b9cf90f6f698f62fe.html) 或 [HALF_VECTOR](https://help.sap.com/docs/SAP_HANA_CLIENT/f1b440ded6144a54ada97ff95dac7adf/8bb854b4ce4a4299bed27c365b717e91.html)。

使用相应的 [向量函数](https://help.sap.com/docs/hana-cloud-database/sap-hana-cloud-sap-hana-database-sql-reference-guide/vector-functions) 进行相似度搜索。