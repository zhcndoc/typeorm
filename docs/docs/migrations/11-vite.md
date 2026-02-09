# Vite

在 [Vite](https://vite.dev) 项目中使用 TypeORM 非常简单。然而，当你使用[迁移](../migrations/01-why.md)时，在运行生产构建时会遇到“...迁移名称错误。迁移类名应附加一个 JavaScript 时间戳。”的错误。
在生产构建中，文件默认会被[优化](https://vite.dev/config/build-options#build-minify)，其中包括对代码进行混淆以尽量减小文件大小。

你有三种方案来缓解这个问题。下面以对基础 `vite.config.ts` 的差异形式展示这三种方案。

```typescript
import legacy from "@vitejs/plugin-legacy"
import vue from "@vitejs/plugin-vue"
import path from "path"
import { defineConfig } from "vite"

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        sourcemap: true,
    },
    plugins: [vue(), legacy()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
})
```

## 方案 1：禁用代码混淆（minify）

这是最粗暴的方案，会导致文件体积显著增大。在配置中添加 `build.minify = false`。

```diff
--- basic vite.config.ts
+++ disable minify vite.config.ts
@@ -7,6 +7,7 @@
 export default defineConfig({
   build: {
     sourcemap: true,
+    minify: false,
   },
   plugins: [vue(), legacy()],
   resolve: {
```

## 方案 2：禁用 esbuild 的标识符混淆

Vite 使用 esbuild 作为默认的压缩器。通过在配置中添加 `esbuild.minifyIdentifiers = false` 禁用标识符混淆。
这种方式会生成比方案 1 小的文件，但由于所有标识符都不会被缩短，收益会随代码规模减少而降低。

```diff
--- basic vite.config.ts
+++ disable esbuild minify identifiers vite.config.ts
@@ -8,6 +8,7 @@
   build: {
     sourcemap: true,
   },
+  esbuild: { minifyIdentifiers: false },
   plugins: [vue(), legacy()],
   resolve: {
```

## 方案 3：使用 terser 作为压缩器，只对迁移类名保持不变

Vite 支持使用 terser 作为压缩器。terser 比 esbuild 慢，但提供了更精细的混淆控制。
在配置中添加 `minify: 'terser'`，再加上 `terserOptions.mangle.keep_classnames: /^Migrations\d+$/` 和 `terserOptions.compress.keep_classnames: /^Migrations\d+$/`。
这些选项确保以 “Migrations” 开头且以数字结尾的类名在压缩过程中不被重命名。

确保项目中已作为开发依赖安装 terser：`npm add -D terser`。

```diff
--- basic vite.config.ts
+++ terser keep migration class names vite.config.ts
@@ -7,6 +7,11 @@
 export default defineConfig({
   build: {
     sourcemap: true,
+    minify: 'terser',
+    terserOptions: {
+      mangle: { keep_classnames: /^Migrations\d+$/ },
+      compress: { keep_classnames: /^Migrations\d+$/ },
+    },
   },
   plugins: [vue(), legacy()],
   resolve: {
```
