# 日志记录

## 启用日志记录

只需在数据源选项中设置 `logging: true`，即可启用所有查询和错误的日志记录：

```typescript
{
    name: "mysql",
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "test",
    password: "test",
    database: "test",
    ...
    logging: true
}
```

## 日志记录选项

你可以在数据源选项中启用不同类型的日志记录：

```typescript
{
    host: "localhost",
    ...
    logging: ["query", "error"]
}
```

如果你只想启用失败查询的日志记录，则只需添加 `error`：

```typescript
{
    host: "localhost",
    ...
    logging: ["error"]
}
```

还有其他可用选项：

- `query` - 记录所有查询。
- `error` - 记录所有失败的查询和错误。
- `schema` - 记录模式构建过程。
- `warn` - 记录内部 ORM 警告。
- `info` - 记录内部 ORM 信息性消息。
- `log` - 记录内部 ORM 日志消息。

你可以根据需要指定任意多个选项。
如果想启用全部日志记录，可以简单地指定 `logging: "all"`：

```typescript
{
    host: "localhost",
    ...
    logging: "all"
}
```

## 记录长时间执行的查询

如果你遇到性能问题，可以通过在数据源选项中设置 `maxQueryExecutionTime` 来记录执行时间过长的查询：

```typescript
{
    host: "localhost",
    ...
    maxQueryExecutionTime: 1000
}
```

上述代码会记录所有运行超过 `1 秒` 的查询。

## 更改默认日志器

TypeORM 提供了 4 种不同类型的日志器：

- `advanced-console` - 这是默认日志器，会在控制台中记录所有消息，支持颜色和 SQL 语法高亮。
- `simple-console` - 这是一个简单的控制台日志器，与高级日志器完全相同，但不使用任何颜色高亮。
  如果你对彩色日志不满意或者遇到问题，可以使用这个日志器。
- `formatted-console` - 几乎和高级日志器一样，但它会格式化 SQL 查询以提高可读性（使用 [@sqltools/formatter](https://github.com/mtxr/vscode-sqltools)）。
- `file` - 该日志器会将所有日志写入项目根目录（与 `package.json` 同级）的 `ormlogs.log` 文件中。
- `debug` - 该日志器使用了 [debug 包](https://github.com/visionmedia/debug)，要开启日志，请设置环境变量 `DEBUG=typeorm:*`（注意，日志选项对该日志器无效）。

你可以在数据源选项中启用任意一个日志器：

```typescript
{
    host: "localhost",
    ...
    logging: true,
    logger: "file"
}
```

## 使用自定义日志器

你可以通过实现 `Logger` 接口来创建自己的日志类：

```typescript
import { Logger } from "typeorm"

export class MyCustomLogger implements Logger {
    // 实现日志类的所有方法
}
```

或者你可以继承 `AbstractLogger` 类：

```typescript
import { AbstractLogger } from "typeorm"

export class MyCustomLogger extends AbstractLogger {
    /**
     * 将日志写入指定输出。
     */
    protected writeLog(
        level: LogLevel,
        logMessage: LogMessage | LogMessage[],
        queryRunner?: QueryRunner,
    ) {
        const messages = this.prepareLogMessages(
            logMessage,
            {
                highlightSql: false,
            },
            queryRunner,
        )

        for (let message of messages) {
            switch (message.type ?? level) {
                case "log":
                case "schema-build":
                case "migration":
                    console.log(message.message)
                    break

                case "info":
                case "query":
                    if (message.prefix) {
                        console.info(message.prefix, message.message)
                    } else {
                        console.info(message.message)
                    }
                    break

                case "warn":
                case "query-slow":
                    if (message.prefix) {
                        console.warn(message.prefix, message.message)
                    } else {
                        console.warn(message.message)
                    }
                    break

                case "error":
                case "query-error":
                    if (message.prefix) {
                        console.error(message.prefix, message.message)
                    } else {
                        console.error(message.message)
                    }
                    break
            }
        }
    }
}
```

然后在数据源选项中指定它：

```typescript
import { DataSource } from "typeorm"
import { MyCustomLogger } from "./logger/MyCustomLogger"

const dataSource = new DataSource({
    name: "mysql",
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "test",
    password: "test",
    database: "test",
    logger: new MyCustomLogger(),
})
```

当可用时，日志方法可以接受 `QueryRunner`。这对于你希望记录额外数据时非常有用。
此外，通过 QueryRunner，你可以访问在持久化/移除过程中传递的额外数据。例如：

```typescript
// 用户在保存实体时发送请求
postRepository.save(post, { data: { request: request } });

// 在日志器中可以这样访问：
logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const requestUrl = queryRunner && queryRunner.data["request"] ? "(" + queryRunner.data["request"].url + ") " : "";
    console.log(requestUrl + "执行查询: " + query);
}
```