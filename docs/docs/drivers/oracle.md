# Oracle

## 安装

```shell
npm install oracledb
```

默认情况下，[oracledb](https://github.com/oracle/node-oracledb) 使用“thin 模式”进行连接。要启用“thick 模式”，需要按照其[用户指南](https://node-oracledb.readthedocs.io/en/latest/user_guide/installation.html)里的安装说明操作。

## 数据源选项

有关常用数据源选项，请参见[数据源选项](../data-source/2-data-source-options.md)。

- `sid` - 系统标识符 (SID) 用于标识特定的数据库实例。例如，“sales”。
- `serviceName` - 服务名称是数据库服务的标识符。例如，`sales.us.example.com`。

## 列类型

`char`，`nchar`，`nvarchar2`，`varchar2`，`long`，`raw`，`long raw`，`number`，`numeric`，`float`，`dec`，`decimal`，`integer`，`int`，`smallint`，`real`，`double precision`，`date`，`timestamp`，`timestamp with time zone`，`timestamp with local time zone`，`interval year to month`，`interval day to second`，`bfile`，`blob`，`clob`，`nclob`，`rowid`，`urowid`