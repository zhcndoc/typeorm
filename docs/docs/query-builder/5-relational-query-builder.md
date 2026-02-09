# 关系操作

`RelationQueryBuilder` 是一种特殊的 `QueryBuilder`，允许你操作实体之间的关系。  
通过它，你可以在数据库中直接绑定实体，而不需要加载任何实体，或轻松加载相关实体。

例如，我们有一个 `Post` 实体，它和 `Category` 有一个多对多关系，名为 `categories`。  
我们来给这个多对多关系添加一个新分类：

```typescript
await dataSource
    .createQueryBuilder()
    .relation(Post, "categories")
    .of(post)
    .add(category)
```

这段代码等同于下面操作：

```typescript
const postRepository = dataSource.manager.getRepository(Post)
const post = await postRepository.findOne({
    where: {
        id: 1,
    },
    relations: {
        categories: true,
    },
})
post.categories.push(category)
await postRepository.save(post)
```

但是更高效，因为它执行的操作更少，并且是在数据库中直接绑定实体，而不是调用笨重的 `save` 方法。

此外，这种方式的另一个好处是，你不需要在添加之前加载所有相关实体。  
举例来说，如果一个帖子有一万个分类，向这个列表添加新分类可能会变得非常麻烦，  
因为传统的方法是先加载帖子及所有一万个分类，添加新分类后再保存。  
这会造成极其严重的性能开销，基本上在生产环境中不可行。  
而使用 `RelationQueryBuilder` 则可以解决该问题。

并且，在“绑定”关联时，实际上并不需要使用实体对象，直接使用实体的 id 即可。  
比如，给 id 为 1 的帖子添加 id 为 3 的分类：

```typescript
await dataSource.createQueryBuilder().relation(Post, "categories").of(1).add(3)
```

如果使用复合主键，则必须传递一个 id 映射，例如：

```typescript
await dataSource
    .createQueryBuilder()
    .relation(Post, "categories")
    .of({ firstPostId: 1, secondPostId: 3 })
    .add({ firstCategoryId: 2, secondCategoryId: 4 })
```

你可以用同样的方式移除实体：

```typescript
// 这段代码从指定帖子中移除一个分类
await dataSource
    .createQueryBuilder()
    .relation(Post, "categories")
    .of(post) // 也可以只用帖子 id
    .remove(category) // 也可以只用分类 id
```

添加和移除相关实体适用于 `many-to-many` 和 `one-to-many` 关系。  
对于 `one-to-one` 和 `many-to-one` 关系，请使用 `set` 操作：

```typescript
// 这段代码设置指定帖子的分类
await dataSource
    .createQueryBuilder()
    .relation(Post, "categories")
    .of(post) // 也可以只用帖子 id
    .set(category) // 也可以只用分类 id
```

如果想取消关系（设置为 null），只需给 `set` 方法传入 `null`：

```typescript
// 这段代码取消指定帖子的分类关系
await dataSource
    .createQueryBuilder()
    .relation(Post, "categories")
    .of(post) // 也可以只用帖子 id
    .set(null)
```

除了更新关系外，关系查询构建器还允许你加载关系实体。  
例如，假设 `Post` 实体中有一个多对多的 `categories` 关系和一个多对一的 `user` 关系，  
加载这些关系可以使用下面的代码：

```typescript
const post = await dataSource.manager.findOneBy(Post, {
    id: 1,
})

post.categories = await dataSource
    .createQueryBuilder()
    .relation(Post, "categories")
    .of(post) // 也可以只用帖子 id
    .loadMany()

post.author = await dataSource
    .createQueryBuilder()
    .relation(Post, "user")
    .of(post) // 也可以只用帖子 id
    .loadOne()
```