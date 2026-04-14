# 懒加载与急切加载

TypeORM 提供了两种加载数据关系的主要方法：懒加载（Lazy Loading）和急切加载（Eager Loading）。每种方法对应用程序性能都有不同的影响。

## 懒加载

懒加载仅在需要时加载关系数据，当并非总是需要所有相关数据时，可以降低数据库负载。

```typescript
@Entity()
export class User {
    @OneToMany(() => Post, (post) => post.user, { lazy: true })
    posts: Promise<Post[]>
}
```

当需要检索数据时，只需调用：

```typescript
const user = await userRepository.findOne(userId)
const posts = await user.posts
```

优点：

- 资源高效：仅在真正需要时加载必要数据，减少查询成本和内存使用。
- 适用于选择性数据使用：适合并非总是需要所有相关数据的场景。

缺点：

- 查询复杂度增加：每次访问关系数据都会触发对数据库的额外查询，若管理不当可能增加延迟。
- 难以追踪：如果使用不当，可能导致 N+1 查询问题。

## 急切加载

急切加载在主查询执行时自动检索所有相关数据。这很方便，但如果关系过于复杂，可能会导致性能问题。

```typescript
@Entity()
export class User {
    @OneToMany(() => Post, (post) => post.user, { eager: true })
    posts: Post[]
}
```

在这种情况下，一旦获取到用户数据，相关文章数据也会立即加载。

优点：

- 自动加载相关数据，无需额外查询即可轻松访问关系。
- 避免 N+1 查询问题：因为所有数据在一次查询中获取，不会产生不必要的多次查询。

缺点：

- 一次性获取所有相关数据可能导致查询体积过大，即使并非所有数据都需要。
- 不适用于仅需要相关数据子集的场景，因为这可能导致数据使用效率低下。

如需了解更多关于如何配置和使用懒加载与急切加载的详细信息及示例，请访问官方 TypeORM 文档：[急切与懒加载关系](../relations/5-eager-and-lazy-relations.md)
