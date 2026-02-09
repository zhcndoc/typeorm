# 额外选项

## 时间戳

如果你需要为迁移名称指定时间戳，使用 `-t`（`--timestamp` 的别名）并传入时间戳（应为非负数）

```shell
typeorm -t <specific-timestamp> migration:{create|generate}
```

你可以通过以下方式获取时间戳：

```js
Date.now()
/* 或者 */ new Date().getTime()
```