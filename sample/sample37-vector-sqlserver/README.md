# SQL Server 中的向量类型支持

本示例演示了如何在 SQL Server 中使用 TypeORM 的 `vector` 列类型来存储和查询向量嵌入。

## 概述

SQL Server 支持 `vector` 数据类型用于存储高维向量，适用于：

- 使用嵌入进行语义搜索
- 推荐系统
- 相似度匹配
- 机器学习应用

## 演示功能

1. **向量列定义**：定义具有特定向量维度的列
2. **存储嵌入**：以数字数组形式保存向量数据
3. **向量相似度搜索**：使用 `VECTOR_DISTANCE` 函数计算余弦相似度

## 实体定义

```typescript
@Entity("document_chunks")
export class DocumentChunk {
    @PrimaryGeneratedColumn("uuid")
    id: string

    @Column("varchar", { length: "MAX" })
    content: string

    // 1998 维的向量列
    @Column("vector", { length: 1998 })
    embedding: number[]

    @Column("uuid")
    documentId: string

    @ManyToOne(() => Document, (document) => document.chunks)
    @JoinColumn({ name: "documentId" })
    document: Document
}
```

## 向量相似度搜索

SQL Server 提供了 `VECTOR_DISTANCE` 函数来计算向量间的距离：

```typescript
const queryEmbedding = [
    /* 你的查询向量 */
]
const documentIds = ["doc-id-1", "doc-id-2"]

const results = await dataSource.query(
    `
    DECLARE @question AS VECTOR (1998) = @0;
    SELECT TOP (10) dc.*,
           VECTOR_DISTANCE('cosine', @question, embedding) AS distance,
           d.fileName as "documentName"
    FROM document_chunks dc
    LEFT JOIN documents d ON dc.documentId = d.id
    WHERE documentId IN (@1))
    ORDER BY VECTOR_DISTANCE('cosine', @question, embedding)
`,
    [JSON.stringify(queryEmbedding), documentIds.join(", ")],
)
```

## 距离度量

`VECTOR_DISTANCE` 函数支持不同的距离度量方法：

- `'cosine'` - 余弦距离（语义搜索中最常用）
- `'euclidean'` - 欧几里得距离（L2 距离）
- `'dot'` - 负点积

## 需求

- 启用向量支持的 SQL Server
- 搭配 SQL Server 驱动（`mssql` 包）的 TypeORM

## 运行示例

1. 确保你已有启用向量支持的 SQL Server 运行环境
2. 如有需要，更新 `app.ts` 中的数据源配置
3. 运行：
    ```bash
    npm install
    ts-node app.ts
    ```

## 注意事项

- 必须通过 `length` 选项指定向量维度
- 嵌入内部以 JSON 字符串形式存储，自动转换为/自数字数组
- 最大向量维度取决于你的 SQL Server 版本及配置
