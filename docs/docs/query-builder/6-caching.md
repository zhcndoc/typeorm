# 查询缓存

你可以缓存以下 `QueryBuilder` 方法选中的结果：`getMany`、`getOne`、`getRawMany`、`getRawOne` 和 `getCount`。

你也可以缓存 `Repository` 和 `EntityManager` 的 `find*` 和 `count*` 方法选中的结果。

要启用缓存，需要在数据源选项中显式启用：

```typescript
{
    type: "mysql",
    host: "localhost",
    username: "test",
    ...
    cache: true
}
```

首次启用缓存时，必须同步数据库模式（使用 CLI、迁移或 `synchronize` 数据源选项）。

然后在 `QueryBuilder` 中你可以为任意查询启用查询缓存：

```typescript
const users = await dataSource
    .createQueryBuilder(User, "user")
    .where("user.isAdmin = :isAdmin", { isAdmin: true })
    .cache(true)
    .getMany()
```

等效的 `Repository` 查询：

```typescript
const users = await dataSource.getRepository(User).find({
    where: { isAdmin: true },
    cache: true,
})
```

这将执行查询以获取所有管理员用户并缓存结果。下次执行相同代码时，将从缓存中获取所有管理员用户。
默认缓存生命周期是 `1000 ms`，即 1 秒。这意味着缓存会在查询构建器代码调用后 1 秒失效。
实际上，这意味着如果用户在 3 秒内打开用户页面 150 次，期间只会执行三次查询。在 1 秒缓存窗口内插入的任何用户都不会返回给用户。

你可以通过 `QueryBuilder` 手动更改缓存时间：

```typescript
const users = await dataSource
    .createQueryBuilder(User, "user")
    .where("user.isAdmin = :isAdmin", { isAdmin: true })
    .cache(60000) // 1 分钟
    .getMany()
```

或者通过 `Repository`：

```typescript
const users = await dataSource.getRepository(User).find({
    where: { isAdmin: true },
    cache: 60000,
})
```

或者全局通过数据源选项设置：

```typescript
{
    type: "mysql",
    host: "localhost",
    username: "test",
    ...
    cache: {
        duration: 30000 // 30 秒
    }
}
```

此外，你可以通过 `QueryBuilder` 设置“缓存 ID”：

```typescript
const users = await dataSource
    .createQueryBuilder(User, "user")
    .where("user.isAdmin = :isAdmin", { isAdmin: true })
    .cache("users_admins", 25000)
    .getMany()
```

或者通过 `Repository`：

```typescript
const users = await dataSource.getRepository(User).find({
    where: { isAdmin: true },
    cache: {
        id: "users_admins",
        milliseconds: 25000,
    },
})
```

这让你对缓存有更细粒度的控制，例如在插入新用户时清除缓存结果：

```typescript
await dataSource.queryResultCache.remove(["users_admins"])
```

默认情况下，TypeORM 使用一个名为 `query-result-cache` 的独立表来存储所有查询及结果。表名是可配置的，你可以通过指定不同的 `tableName` 值进行更改。示例：

```typescript
{
    type: "mysql",
    host: "localhost",
    username: "test",
    ...
    cache: {
        type: "database",
        tableName: "configurable-table-query-result-cache"
    }
}
```

如果将缓存存储在单一数据库表中效果不佳，你可以把缓存类型改为 `"redis"` 或 `"ioredis"`，TypeORM 会将所有缓存记录存储在 Redis 中。示例：

```typescript
{
    type: "mysql",
    host: "localhost",
    username: "test",
    ...
    cache: {
        type: "redis",
        options: {
            socket: {
                host: "localhost",
                port: 6379
            }
        }
    }
}
```

`options` 可以是 [node_redis 具体选项](https://github.com/redis/node-redis/blob/master/docs/client-configuration.md) 或 [ioredis 具体选项](https://github.com/luin/ioredis/blob/master/API.md#new-redisport-host-options)，取决于你使用的类型。

如果你想使用 IORedis 的集群功能连接 redis-cluster，也可以按如下方式配置：

```typescript
{
    type: "mysql",
    host: "localhost",
    username: "test",
    cache: {
        type: "ioredis/cluster",
        options: {
            startupNodes: [
                {
                    host: 'localhost',
                    port: 7000,
                },
                {
                    host: 'localhost',
                    port: 7001,
                },
                {
                    host: 'localhost',
                    port: 7002,
                }
            ],
            options: {
                scaleReads: 'all',
                clusterRetryStrategy: function (times) { return null },
                redisOptions: {
                    maxRetriesPerRequest: 1
                }
            }
        }
    }
}
```

注意，你仍然可以将选项作为 IORedis 集群构造函数的第一个参数使用：

```typescript
{
    ...
    cache: {
        type: "ioredis/cluster",
        options: [
            {
                host: 'localhost',
                port: 7000,
            },
            {
                host: 'localhost',
                port: 7001,
            },
            {
                host: 'localhost',
                port: 7002,
            }
        ]
    },
    ...
}
```

如果内置的缓存提供者都无法满足你的需求，你也可以通过使用一个 `provider` 工厂函数来自定义缓存提供者，该函数需返回一个实现了 `QueryResultCache` 接口的新对象：

```typescript
class CustomQueryResultCache implements QueryResultCache {
    constructor(private dataSource: DataSource) {}
    ...
}
```

```typescript
{
    ...
    cache: {
        provider(dataSource) {
            return new CustomQueryResultCache(dataSource);
        }
    }
}
```

如果你希望忽略缓存错误，并且在缓存错误时使查询直接通过到数据库，可以使用 `ignoreErrors` 选项。
示例：

```typescript
{
    type: "mysql",
    host: "localhost",
    username: "test",
    ...
    cache: {
        type: "redis",
        options: {
            socket: {
                host: "localhost",
                port: 6379
            }
        },
        ignoreErrors: true
    }
}
```

你可以使用 `typeorm cache:clear` 清除缓存中的所有内容。