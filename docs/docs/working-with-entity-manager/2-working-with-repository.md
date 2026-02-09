# Repository

`Repository` 就像 `EntityManager`，但它的操作仅限于具体的实体。
你可以通过 EntityManager 访问仓库。

示例：

```typescript
import { User } from "./entity/User"

const userRepository = dataSource.getRepository(User)
const user = await userRepository.findOneBy({
    id: 1,
})
user.name = "Umed"
await userRepository.save(user)
```

有三种类型的仓库：

- `Repository` - 适用于任何实体的常规仓库。
- `TreeRepository` - `Repository` 的扩展，适用于树形实体
  （比如用 `@Tree` 装饰器标记的实体）。
  具有处理树形结构的特殊方法。
- `MongoRepository` - 只用于 MongoDB 的特殊功能仓库。