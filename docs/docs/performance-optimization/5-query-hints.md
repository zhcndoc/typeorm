# 查询提示

查询提示是与 SQL 查询一起发送的指令，帮助数据库决定更高效的执行策略。

不同的 RDBMS 系统支持不同类型的提示，例如建议使用索引或选择适当的 JOIN 类型。

```typescript
await dataSource.query(`
    SELECT /*+ MAX_EXECUTION_TIME(1000) */ *
    FROM user
    WHERE email = 'example@example.com'
`)
```

在上面的示例中，`MAX_EXECUTION_TIME(1000)` 指示 MySQL 如果查询执行时间超过 1 秒则停止查询。
