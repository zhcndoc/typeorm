# SQLite

## 安装

- 对于 **SQLite**：

```shell
npm install sqlite3
```

- 对于 **Better SQLite**：

```shell
npm install better-sqlite3
```

- 对于 **sql.js**：

```shell
npm install sql.js
```

- 对于 **Capacitor**、**Cordova**、**Expo**、**NativeScript** 和 **React Native**，请查看 [支持的平台](../help/2-supported-platforms.md)。

## 数据源选项

有关常用数据源选项，请参见 [数据源选项](../data-source/2-data-source-options.md)。

### `sqlite` 数据源选项

- `database` - 数据库路径。例如："mydb.sql"

### `better-sqlite3` 数据源选项

- `database` - 数据库路径。例如："mydb.sql"
- `statementCacheSize` - SQLite 语句缓存大小，用于加快查询速度（默认 100）。
- `prepareDatabase` - 在 typeorm 使用数据库前调用的函数。你可以在这里访问原生的 better-sqlite3 Database 对象。
- `nativeBinding` - 原生插件的相对或绝对路径（better_sqlite3.node）。

### `sql.js` 数据源选项

- `database`：待导入的原始 UInt8Array 格式数据库。
- `sqlJsConfig`：可选的 sql.js 初始化配置。
- `autoSave`：启用自动持久化数据库更改，需要指定 `location` 或 `autoSaveCallback`。设置为 `true` 时，每次更改都会保存到文件系统（Node.js）或 `localStorage`/`indexedDB`（浏览器），如果指定了 `location`，否则调用 `autoSaveCallback`。
- `autoSaveCallback`：启用 `autoSave` 后，当数据库发生更改时调用的函数。函数接收表示数据库的 `UInt8Array`。
- `location`：加载和保存数据库的文件位置。
- `useLocalForage`：启用使用 [localforage 库](https://github.com/localForage/localForage)，从 indexedDB 异步保存和加载数据库，取代浏览器环境中的同步 local storage 方法。需要将 localforage node 模块添加到项目中，并在页面中导入 localforage.js。

### `capacitor` 数据源选项

- `database` - 数据库名称（capacitor-sqlite 会自动添加后缀 `SQLite.db`）
- `driver` - capacitor-sqlite 实例。例如，`new SQLiteConnection(CapacitorSQLite)`。
- `mode` - 设置数据库加密模式："no-encryption" | "encryption" | "secret" | "newsecret"
- `version` - 数据库版本
- `journalMode` - SQLite 日志模式（可选）

### `cordova` 数据源选项

- `database` - 数据库名称
- `location` - 数据库存储位置。选项请参见 [cordova-sqlite-storage](https://github.com/litehelpers/Cordova-sqlite-storage#opening-a-database)。

### `expo` 数据源选项

- `database` - 数据库名称。例如，"mydb"。
- `driver` - Expo SQLite 模块。例如，`require('expo-sqlite')`。

### `nativescript` 数据源选项

- `database` - 数据库名称

### `react-native` 数据源选项

- `database` - 数据库名称
- `location` - 数据库存储位置。选项请参见 [react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage#opening-a-database)。

## 列类型

`int`、`int2`、`int8`、`integer`、`tinyint`、`smallint`、`mediumint`、`bigint`、`decimal`、`numeric`、`float`、`double`、`real`、`double precision`、`datetime`、`varying character`、`character`、`native character`、`varchar`、`nchar`、`nvarchar2`、`unsigned big int`、`boolean`、`blob`、`text`、`clob`、`date`