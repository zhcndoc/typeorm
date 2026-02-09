# 回滚

如果出于某种原因你想回滚更改，可以运行：

```shell
typeorm migration:revert -- -d path-to-datasource-config
```

此命令将执行最新已执行迁移中的 `down` 方法。

如果需要回滚多个迁移，则必须多次调用此命令。