# 在 JavaScript 中使用

TypeORM 不仅可以和 TypeScript 一起使用，也可以和 JavaScript 一起使用。
一切都相同，只是你需要省略类型，如果你的平台不支持 ES6 类的话，则需要用所有必需的元数据来定义对象。

##### app.js

```typescript
var typeorm = require("typeorm")

var dataSource = new typeorm.DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "test",
    password: "admin",
    database: "test",
    synchronize: true,
    entities: [require("./entities/Post"), require("./entities/Category")],
})

dataSource
    .initialize()
    .then(function () {
        var category1 = {
            name: "TypeScript",
        }
        var category2 = {
            name: "Programming",
        }

        var post = {
            title: "Control flow based type analysis",
            text: "TypeScript 2.0 实现了基于控制流的局部变量和参数类型分析。",
            categories: [category1, category2],
        }

        var postRepository = dataSource.getRepository("Post")
        postRepository
            .save(post)
            .then(function (savedPost) {
                console.log("文章已保存: ", savedPost)
                console.log("现在让我们加载所有文章: ")

                return postRepository.find()
            })
            .then(function (allPosts) {
                console.log("所有文章: ", allPosts)
            })
    })
    .catch(function (error) {
        console.log("错误: ", error)
    })
```

##### entity/Category.js

```typescript
var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Category", // 默认行为会使用表名 `category`。
    tableName: "categories", // 可选：提供 `tableName` 属性以覆盖默认的表名行为。
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        name: {
            type: "varchar",
        },
    },
})
```

##### entity/Post.js

```typescript
var EntitySchema = require("typeorm").EntitySchema

module.exports = new EntitySchema({
    name: "Post", // 默认行为会使用表名 `post`。
    tableName: "posts", // 可选：提供 `tableName` 属性以覆盖默认的表名行为。
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: true,
        },
        title: {
            type: "varchar",
        },
        text: {
            type: "text",
        },
    },
    relations: {
        categories: {
            target: "Category",
            type: "many-to-many",
            joinTable: true,
            cascade: true,
        },
    },
})
```

你可以查看这个示例 [typeorm/javascript-example](https://github.com/typeorm/javascript-example) 来了解更多。