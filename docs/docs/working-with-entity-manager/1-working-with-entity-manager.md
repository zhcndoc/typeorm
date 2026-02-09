# EntityManager

使用 `EntityManager` 你可以管理（插入、更新、删除、加载等）任何实体。  
EntityManager 就像是将所有实体仓库集合在一个地方。

你可以通过 DataSource 访问实体管理器。  
使用示例：

```typescript
import { DataSource } from "typeorm"
import { User } from "./entity/User"

const myDataSource = new DataSource(/*...*/)
const user = await myDataSource.manager.findOneBy(User, {
    id: 1,
})
user.name = "Umed"
await myDataSource.manager.save(user)
```