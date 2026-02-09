# Google Spanner

## 安装

```shell
npm install @google-cloud/spanner
```

## 数据源选项

有关常见数据源选项，请参阅 [数据源选项](../data-source/2-data-source-options.md)。

通过设置环境变量 `GOOGLE_APPLICATION_CREDENTIALS` 向您的应用程序代码提供身份验证凭证：

```shell
# Linux/macOS
export GOOGLE_APPLICATION_CREDENTIALS="KEY_PATH"

# Windows
set GOOGLE_APPLICATION_CREDENTIALS=KEY_PATH

# 将 KEY_PATH 替换为包含您的服务账户密钥的 JSON 文件路径。
```

若要与模拟器一起使用 Spanner，您应设置 `SPANNER_EMULATOR_HOST` 环境变量：

```shell
# Linux/macOS
export SPANNER_EMULATOR_HOST=localhost:9010

# Windows
set SPANNER_EMULATOR_HOST=localhost:9010
```

## 列类型

`bool`, `int64`, `float64`, `numeric`, `string`, `json`, `bytes`, `date`, `timestamp`, `array`