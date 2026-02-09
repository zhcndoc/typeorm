# Microsoft SQLServer

## 安装

```shell
npm install mssql
```

## 数据源选项

有关通用数据源选项，请参见[数据源选项](../data-source/2-data-source-options.md)。

基于 [tedious](https://tediousjs.github.io/node-mssql/) 的 MSSQL 实现。有关公开属性的详细信息，请参见 [SqlServerConnectionOptions.ts](https://github.com/typeorm/typeorm/tree/master/src/driver/sqlserver/SqlServerConnectionOptions.ts)。

- `url` - 连接执行的连接 URL。请注意，其他数据源选项将覆盖从 URL 设置的参数。

- `host` - 数据库主机。

- `port` - 数据库主机端口。默认的 mssql 端口是 `1433`。

- `username` - 数据库用户名。

- `password` - 数据库密码。

- `database` - 数据库名称。

- `schema` - 模式名称。默认是 "dbo"。

- `domain` - 设置域后，驱动程序将使用域登录连接到 SQL Server。

- `connectionTimeout` - 连接超时（毫秒）（默认：`15000`）。

- `requestTimeout` - 请求超时（毫秒）（默认：`15000`）。注意：msnodesqlv8 驱动不支持低于 1 秒的超时。

- `stream` - 以流方式返回记录集/行，而不是一次性通过回调参数返回（默认：`false`）。你也可以为每个请求独立启用流（`request.stream = true`）。如果计划处理大量行，请始终设置为 `true`。

- `pool.max` - 连接池中最大连接数（默认：`10`）。

- `pool.min` - 连接池中最小连接数（默认：`0`）。

- `pool.maxWaitingClients` - 允许排队的最大请求数，额外的 acquire 调用将在事件循环的未来周期中以错误回调。

- `pool.acquireTimeoutMillis` - acquire 调用等待资源的最长毫秒数，超时后放弃（默认无限制），如果指定，必须是非零正整数。

- `pool.fifo` - 若为 true，最旧的资源将优先分配；若为 false，最近释放的资源将优先分配。这实际上将连接池的行为由队列变为栈。布尔类型，默认 `true`。

- `pool.priorityRange` - 介于 1 和 x 之间的整数——若设置，借用者在无可用资源时可以指定其队列中的相对优先级。参见示例。（默认：`1`）。

- `pool.evictionRunIntervalMillis` - 运行驱逐检查的间隔时间。默认：`0`（不运行）。

- `pool.numTestsPerRun` - 每次驱逐运行检查的资源数量。默认：`3`。

- `pool.softIdleTimeoutMillis` - 对象在池中空闲多长时间后可由空闲对象驱逐器（如果有）驱逐，但会保留至少“最小空闲”对象实例。默认 `-1`（不驱逐任何对象）。

- `pool.idleTimeoutMillis` - 对象在池中空闲到可因空闲时间被驱逐的最小时间，覆盖 `softIdleTimeoutMillis`。默认：`30000`。

- `pool.errorHandler` - 当底层连接池发出 `'error'` 事件时调用的函数。接收单一参数（错误实例），默认以 `warn` 级别记录。

- `options.fallbackToDefaultDb` - 默认情况下，如果 `options.database` 请求的数据库无法访问，连接将失败并报错。若设置为 `true`，将使用用户默认数据库代替（默认：`false`）。

- `options.instanceName` - 要连接的实例名称。数据库服务器上必须运行 SQL Server 浏览器服务，且数据库服务器的 UDP 端口 1434 必须可达。与 `port` 互斥。（无默认值）。

- `options.enableAnsiNullDefault` - 若为 true，将在初始 SQL 中设置 `SET ANSI_NULL_DFLT_ON ON`，这意味着新列默认可为空。详见 [T-SQL 文档](https://msdn.microsoft.com/en-us/library/ms187375.aspx)（默认：`true`）。

- `options.cancelTimeout` - 请求取消（中止）被视为失败之前的毫秒数（默认：`5000`）。

- `options.packetSize` - TDS 包的大小（与服务器协商）。应为 2 的幂次方。（默认：`4096`）。

- `options.useUTC` - 布尔值，决定是否以 UTC 传输时间值，还是本地时间。（默认：`false`）。

- `options.abortTransactionOnError` - 布尔值，决定在事务执行过程中遇到任何错误时是否自动回滚事务。该选项设置连接初始 SQL 阶段的 `SET XACT_ABORT` 取值（[文档](http://msdn.microsoft.com/en-us/library/ms188792.aspx)）。

- `options.localAddress` - 连接 SQL Server 时使用的网络接口（IP 地址）。

- `options.useColumnNames` - 布尔值，决定返回的行是数组还是键值集合。（默认：`false`）。

- `options.camelCaseColumns` - 布尔值，控制返回的列名首字母是否转为小写（`true`）。如果提供了 `columnNameReplacer`，该值将被忽略。（默认：`false`）。

- `options.isolationLevel` - 事务的默认隔离级别。隔离级别由 `require('tedious').ISOLATION_LEVEL` 提供：

    - `READ_UNCOMMITTED`
    - `READ_COMMITTED`
    - `REPEATABLE_READ`
    - `SERIALIZABLE`
    - `SNAPSHOT`

    （默认：`READ_COMMITTED`）

- `options.connectionIsolationLevel` - 新连接的默认隔离级别。所有无事务查询均使用此设置。隔离级别同上。

    （默认：`READ_COMMITTED`）

- `options.readOnlyIntent` - 布尔值，决定连接是否向 SQL Server 可用性组请求只读访问权限。详情请见此处。（默认：`false`）。

- `options.encrypt` - 布尔值，决定连接是否加密。若在 Windows Azure 上，应设置为 true。（默认：`true`）。

- `options.cryptoCredentialsDetails` - 使用加密时，可提供的对象，将作为调用 [tls.createSecurePair](http://nodejs.org/docs/latest/api/tls.html#tls_tls_createsecurepair_credentials_isserver_requestcert_rejectunauthorized) 的第一个参数。（默认：`{}`）。

- `options.rowCollectionOnDone` - 布尔值，若为 true，将在请求的 `done*` 事件中暴露接收到的行。参见 done，[`doneInProc`](http://tediousjs.github.io/tedious/api-request.html#event_doneInProc) 和 [`doneProc`](http://tediousjs.github.io/tedious/api-request.html#event_doneProc)。（默认：`false`）

    注意：若接收到大量行，启用此选项可能导致占用过多内存。

- `options.rowCollectionOnRequestCompletion` - 布尔值，若为 true，将在请求完成回调中暴露接收到的行。见 [`new Request`](http://tediousjs.github.io/tedious/api-request.html#function_newRequest)。（默认：`false`）

    注意：若接收到大量行，启用此选项可能导致占用过多内存。

- `options.tdsVersion` - 使用的 TDS 版本。如果服务器不支持指定版本，将使用协商后的版本。版本由 `require('tedious').TDS_VERSION` 提供：

    - `7_1`
    - `7_2`
    - `7_3_A`
    - `7_3_B`
    - `7_4`

    （默认：`7_4`）

- `options.appName` - 用于在 SQL Server 的分析、日志或跟踪工具中标识特定应用的应用名称。（默认：`node-mssql`）

- `options.trustServerCertificate` - 布尔值，控制当无可验证服务器证书时是否进行加密。（默认：`false`）

- `options.multiSubnetFailover` - 布尔值，控制驱动是否应并行连接 DNS 返回的所有 IP。（默认：`false`）

- `options.debug.packet` - 布尔值，控制是否发出带有包详情文本的 `debug` 事件。（默认：`false`）

- `options.debug.data` - 布尔值，控制是否发出带有包数据详情文本的 `debug` 事件。（默认：`false`）

- `options.debug.payload` - 布尔值，控制是否发出带有包负载详情文本的 `debug` 事件。（默认：`false`）

- `options.debug.token` - 布尔值，控制是否发出带有令牌流令牌描述文本的 `debug` 事件。（默认：`false`）


## 列类型

`int`, `bigint`, `bit`, `decimal`, `money`, `numeric`, `smallint`, `smallmoney`, `tinyint`, `float`, `real`, `date`, `datetime2`, `datetime`, `datetimeoffset`, `smalldatetime`, `time`, `char`, `varchar`, `text`, `nchar`, `nvarchar`, `ntext`, `binary`, `image`, `varbinary`, `hierarchyid`, `sql_variant`, `timestamp`, `uniqueidentifier`, `xml`, `geometry`, `geography`, `rowversion`, `vector`

### 向量类型（vector）

SQL Server 支持用来存储高维向量的 `vector` 数据类型，常用于：

- 带嵌入的语义搜索
- 推荐系统
- 相似度匹配
- 机器学习应用

注意：通用的 `halfvec` 类型支持不可用，因为该功能仍处于预览状态。详情见微软文档：[Vector data type](https://learn.microsoft.com/en-us/sql/t-sql/data-types/vector-data-type)。

#### 用法

```typescript
@Entity()
export class DocumentChunk {
    @PrimaryGeneratedColumn()
    id: number

    @Column("varchar")
    content: string

    // 向量列，维度为 1998
    @Column("vector", { length: 1998 })
    embedding: number[]
}
```

#### 向量相似度搜索

SQL Server 提供了 `VECTOR_DISTANCE` 函数用于计算向量间距离：

```typescript
const queryEmbedding = [
    /* 你的查询向量 */
]

const results = await dataSource.query(
    `
    DECLARE @question AS VECTOR (1998) = @0;
    SELECT TOP (10) dc.*,
           VECTOR_DISTANCE('cosine', @question, embedding) AS distance
    FROM document_chunk dc
    ORDER BY VECTOR_DISTANCE('cosine', @question, embedding)
`,
    [JSON.stringify(queryEmbedding)],
)
```

**距离度量方式：**

- `'cosine'` - 余弦距离（语义搜索中最常用）
- `'euclidean'` - 欧氏距离（L2）
- `'dot'` - 负点积

**要求：**

- 使用支持向量功能的 SQL Server 版本
- 必须通过 `length` 选项指定向量维度