# 树实体

TypeORM 支持使用邻接表（Adjacency list）和闭包表（Closure table）模式存储树结构。  
想了解层级表的更多内容，请查看 [Bill Karwin 的这场精彩演讲](https://www.slideshare.net/billkarwin/models-for-hierarchical-data)。

## 邻接表（Adjacency list）

邻接表是一种简单的自引用模型。  
需要注意的是，TreeRepository 不支持邻接表。  
这种方法的优点是简单，缺点是由于连接限制，不能一次加载大型树。  
想了解邻接表的优势及使用方法，可以查看 [Matthew Schinckel 的这篇文章](http://schinckel.net/2014/09/13/long-live-adjacency-lists/)。  
示例：

```typescript
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
} from "typeorm"

@Entity()
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    description: string

    @ManyToOne((type) => Category, (category) => category.children)
    parent: Category

    @OneToMany((type) => Category, (category) => category.parent)
    children: Category[]
}
```

## 嵌套集（Nested set）

嵌套集是另一种在数据库中存储树结构的模式。  
它对读取操作非常高效，但写入性能较差。  
嵌套集不允许存在多个根节点。  
示例：

```typescript
import {
    Entity,
    Tree,
    Column,
    PrimaryGeneratedColumn,
    TreeChildren,
    TreeParent,
    TreeLevelColumn,
} from "typeorm"

@Entity()
@Tree("nested-set")
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @TreeChildren()
    children: Category[]

    @TreeParent()
    parent: Category
}
```

## 物化路径（Materialized Path，也称路径枚举）

物化路径（也叫路径枚举）是另一种在数据库中存储树结构的模式。  
它简单且高效。  
示例：

```typescript
import {
    Entity,
    Tree,
    Column,
    PrimaryGeneratedColumn,
    TreeChildren,
    TreeParent,
    TreeLevelColumn,
} from "typeorm"

@Entity()
@Tree("materialized-path")
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @TreeChildren()
    children: Category[]

    @TreeParent()
    parent: Category
}
```

## 闭包表（Closure table）

闭包表以特殊方式将父子关系存储在单独的表中。  
它在读写操作上都很高效。  
示例：

```typescript
import {
    Entity,
    Tree,
    Column,
    PrimaryGeneratedColumn,
    TreeChildren,
    TreeParent,
    TreeLevelColumn,
} from "typeorm"

@Entity()
@Tree("closure-table")
export class Category {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @TreeChildren()
    children: Category[]

    @TreeParent()
    parent: Category
}
```

你可以通过在 `@Tree("closure-table", options)` 中设置可选参数 `options` 指定闭包表的名称和/或闭包表列名。`ancestorColumnName` 和 `descendantColumnName` 是回调函数，接收主列的元数据并返回列名。

```ts
@Tree("closure-table", {
    closureTableName: "category_closure",
    ancestorColumnName: (column) => "ancestor_" + column.propertyName,
    descendantColumnName: (column) => "descendant_" + column.propertyName,
})
```

## 操作树实体

要将树实体绑定在一起，需要在子实体中设置父实体，然后保存它们。  
例如：

```typescript
const a1 = new Category()
a1.name = "a1"
await dataSource.manager.save(a1)

const a11 = new Category()
a11.name = "a11"
a11.parent = a1
await dataSource.manager.save(a11)

const a12 = new Category()
a12.name = "a12"
a12.parent = a1
await dataSource.manager.save(a12)

const a111 = new Category()
a111.name = "a111"
a111.parent = a11
await dataSource.manager.save(a111)

const a112 = new Category()
a112.name = "a112"
a112.parent = a11
await dataSource.manager.save(a112)
```

要加载这样的树，请使用 `TreeRepository`：

```typescript
const trees = await dataSource.manager.getTreeRepository(Category).findTrees()
```

`trees` 将如下所示：

```json
[
    {
        "id": 1,
        "name": "a1",
        "children": [
            {
                "id": 2,
                "name": "a11",
                "children": [
                    {
                        "id": 4,
                        "name": "a111"
                    },
                    {
                        "id": 5,
                        "name": "a112"
                    }
                ]
            },
            {
                "id": 3,
                "name": "a12"
            }
        ]
    }
]
```

还有一些通过 `TreeRepository` 操作树实体的特殊方法：

- `findTrees` - 返回数据库中所有树及其所有子节点、子节点的子节点等。

```typescript
const treeCategories = await dataSource.manager
    .getTreeRepository(Category)
    .findTrees()
// 返回含子类的根分类

const treeCategoriesWithLimitedDepth = await dataSource.manager
    .getTreeRepository(Category)
    .findTrees({ depth: 2 })
// 返回深度最多为 2 级的根分类及其子分类
```

- `findRoots` - 根节点是没有祖先的实体。查找所有根节点。  
  不加载其子节点。

```typescript
const rootCategories = await dataSource.manager
    .getTreeRepository(Category)
    .findRoots()
// 返回根分类但不包含子分类
```

- `findDescendants` - 获取给定实体的所有子节点（后代）。返回一个扁平数组。

```typescript
const children = await dataSource.manager
    .getTreeRepository(Category)
    .findDescendants(parentCategory)
// 返回 parentCategory 所有直接子分类（不包括嵌套子分类）
```

- `findDescendantsTree` - 获取给定实体的所有子节点（后代）。返回嵌套结构的树。

```typescript
const childrenTree = await repository.findDescendantsTree(parentCategory)
// 返回 parentCategory 所有直接子分类及其嵌套子分类

const childrenTreeWithLimitedDepth = await repository.findDescendantsTree(
    parentCategory,
    { depth: 2 },
)
// 返回深度最多为 2 级的 parentCategory 子分类及其嵌套子分类
```

- `createDescendantsQueryBuilder` - 创建用于获取树中实体后代的查询构建器。

```typescript
const children = await repository
    .createDescendantsQueryBuilder(
        "category",
        "categoryClosure",
        parentCategory,
    )
    .andWhere("category.type = 'secondary'")
    .getMany()
```

- `countDescendants` - 获取实体后代的数量。

```typescript
const childrenCount = await dataSource.manager
    .getTreeRepository(Category)
    .countDescendants(parentCategory)
```

- `findAncestors` - 获取给定实体的所有父节点（祖先）。返回一个扁平数组。

```typescript
const parents = await repository.findAncestors(childCategory)
// 返回 childCategory 所有直接父分类（不包括“父的父”）
```

- `findAncestorsTree` - 获取给定实体的所有父节点（祖先）。返回嵌套结构的树。

```typescript
const parentsTree = await dataSource.manager
    .getTreeRepository(Category)
    .findAncestorsTree(childCategory)
// 返回 childCategory 所有直接父分类及其“父的父”
```

- `createAncestorsQueryBuilder` - 创建用于获取树中实体祖先的查询构建器。

```typescript
const parents = await repository
    .createAncestorsQueryBuilder("category", "categoryClosure", childCategory)
    .andWhere("category.type = 'secondary'")
    .getMany()
```

- `countAncestors` - 获取实体祖先的数量。

```typescript
const parentsCount = await dataSource.manager
    .getTreeRepository(Category)
    .countAncestors(childCategory)
```

以下方法可传入选项参数：

- findTrees  
- findRoots  
- findDescendants  
- findDescendantsTree  
- findAncestors  
- findAncestorsTree  

可用选项包括：

- `relations` - 指定应加载的实体关系（简化的左连接形式）。

示例：

```typescript
const treeCategoriesWithRelations = await dataSource.manager
    .getTreeRepository(Category)
    .findTrees({
        relations: ["sites"],
    })
// 自动连接 sites 关系

const parentsWithRelations = await dataSource.manager
    .getTreeRepository(Category)
    .findAncestors(childCategory, {
        relations: ["members"],
    })
// 返回 childCategory 所有直接父分类（不含“父的父”），并连接 members 关系
```