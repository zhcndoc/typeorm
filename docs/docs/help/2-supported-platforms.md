# 支持的平台

## NodeJS

TypeORM 兼容 Node.js 20 及以上版本，目前每次提交都会在 Node.js 20 和 24 上进行测试。

## 浏览器

你可以在浏览器中使用 [sql.js](https://sql.js.org)。

### Webpack 配置

在 `browser` 文件夹中，该包还包含一个编译为 ES2015 模块的版本。如果你想使用不同的加载器，这是起点。在 TypeORM 0.1.7 之前，包的设置方式使得像 webpack 这样的加载器会自动使用 `browser` 文件夹。自 0.1.7 版本起，为了支持 Node.js 项目的 Webpack 使用，这一做法被取消了。这意味着必须使用 `NormalModuleReplacementPlugin` 来确保浏览器项目加载正确的版本。在你的 webpack 配置文件中，这个插件的配置如下：

```js
plugins: [
    ..., // 你已有的任何插件
    new webpack.NormalModuleReplacementPlugin(/typeorm$/, function (result) {
        result.request = result.request.replace(/typeorm/, "typeorm/browser");
    }),
    new webpack.ProvidePlugin({
      'window.SQL': 'sql.js/dist/sql-wasm.js'
    })
]
```

并确保你的公共路径中存在 [sql-wasm.wasm 文件](https://github.com/sql-js/sql.js/blob/master/README.md#downloadingusing)。

### 配置示例

```typescript
new DataSource({
    type: "sqljs",
    entities: [Photo],
    synchronize: true,
})
```

### 别忘了包含 reflect-metadata

在你的主 HTML 页面中，需要引入 reflect-metadata：

```html
<script src="./node_modules/reflect-metadata/Reflect.js"></script>
```

## Capacitor

请参阅官方 Capacitor 文档中的 [使用 Capacitor 驱动类型的 TypeORM](https://github.com/capacitor-community/sqlite/blob/master/docs/TypeORM-Usage-From-5.6.0.md)。

## Cordova / Ionic 应用

TypeORM 能够使用 [cordova-sqlite-storage](https://github.com/litehelpers/Cordova-sqlite-storage) 插件在 Cordova/Ionic 应用中运行。  
你可以像在浏览器包中一样，在不同的模块加载器之间进行选择。  
**重要**：与 Ionic 一起使用时，需要自定义 webpack 配置文件。请注意，当前使用 [cordova-sqlite-storage](https://github.com/litehelpers/Cordova-sqlite-storage) 插件时不支持事务。有关更多信息，请参阅 [Cordova SQLite 限制](https://github.com/storesafe/cordova-sqlite-storage#other-limitations)。

## Expo

TypeORM 能够使用 [Expo SQLite API](https://docs.expo.io/versions/latest/sdk/sqlite/) 在 Expo 应用中运行。

## NativeScript

1. 执行 `tns install webpack`（原因见下文为什么需要 webpack）  
2. 执行 `tns plugin add nativescript-sqlite`  
3. 在应用入口文件中创建 DataSource

    ```typescript
    import driver from "nativescript-sqlite"

    const dataSource = new DataSource({
        database: "test.db",
        type: "nativescript",
        driver,
        entities: [
            Todo, //... 你的实体
        ],
        logging: true,
    })
    ```

注意：此方式仅适用于 NativeScript 4.x 及以上版本

_使用 NativeScript 时，**必须使用 webpack**。  
`typeorm/browser` 包是原始的 ES7 代码，带有 `import/export`，  
无法直接运行。必须进行打包。  
请使用 `tns run --bundle` 方法运行。_

示例请见此处 [示例链接](https://github.com/championswimmer/nativescript-vue-typeorm-sample)！

## React Native

TypeORM 能够使用 [react-native-sqlite-storage](https://github.com/andpor/react-native-sqlite-storage) 插件在 React Native 应用中运行。
