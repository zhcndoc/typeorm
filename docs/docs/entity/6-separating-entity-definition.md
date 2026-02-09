# 分离实体定义

## 定义 Schema

你可以直接在模型中使用装饰器定义实体及其列。但有些人更喜欢在单独的文件中定义实体及其列，在 TypeORM 中称为“实体 schema”。

简单定义示例：

```ts
import { EntitySchema } from "typeorm"

export const CategoryEntity = new EntitySchema({
    name: "category",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true,
        },
        name: {
            type: String,
        },
    },
})
```

带关联关系的示例：

```ts
import { EntitySchema } from "typeorm"

export const PostEntity = new EntitySchema({
    name: "post",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true,
        },
        title: {
            type: String,
        },
        text: {
            type: String,
        },
    },
    relations: {
        categories: {
            type: "many-to-many",
            target: "category", // CategoryEntity
        },
    },
})
```

复杂示例：

```ts
import { EntitySchema } from "typeorm"

export const PersonSchema = new EntitySchema({
    name: "person",
    columns: {
        id: {
            primary: true,
            type: "int",
            generated: "increment",
        },
        firstName: {
            type: String,
            length: 30,
        },
        lastName: {
            type: String,
            length: 50,
            nullable: false,
        },
        age: {
            type: Number,
            nullable: false,
        },
        countryCode: {
            type: String,
            length: 2,
            foreignKey: {
                target: "countries", // CountryEntity
                inverseSide: "code",
            },
        },
        cityId: {
            type: Number,
            foreignKey: {
                target: "cities", // CityEntity
            },
        },
    },
    checks: [
        { expression: `"firstName" <> 'John' AND "lastName" <> 'Doe'` },
        { expression: `"age" > 18` },
    ],
    indices: [
        {
            name: "IDX_TEST",
            unique: true,
            columns: ["firstName", "lastName"],
        },
    ],
    uniques: [
        {
            name: "UNIQUE_TEST",
            columns: ["firstName", "lastName"],
        },
    ],
    foreignKeys: [
        {
            target: "cities", // CityEntity
            columnNames: ["cityId", "countryCode"],
            referencedColumnNames: ["id", "countryCode"],
        },
    ],
})
```

如果你想让实体类型安全，可以定义一个模型并在 schema 定义中指定它：

```ts
import { EntitySchema } from "typeorm"

export interface Category {
    id: number
    name: string
}

export const CategoryEntity = new EntitySchema<Category>({
    name: "category",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: true,
        },
        name: {
            type: String,
        },
    },
})
```

## 扩展 Schema

使用 `Decorator` 方式时，可以很方便地将基本列扩展到一个抽象类，并简单继承它。例如，你的 `id`、`createdAt` 和 `updatedAt` 列可以定义在这样的 `BaseEntity` 中。更多细节，请参见[具体表继承](./3-entity-inheritance.md#concrete-table-inheritance)章节。

使用 `EntitySchema` 方式时则不行。不过，你可以利用“扩展运算符”(Spread Operator) (`...`)。

重新考虑上面的 `Category` 例子。你可能想提取基本列描述，并在其他 schema 中重用。可以这样做：

```ts
import { EntitySchemaColumnOptions } from "typeorm"

export const BaseColumnSchemaPart = {
    id: {
        type: Number,
        primary: true,
        generated: true,
    } as EntitySchemaColumnOptions,
    createdAt: {
        name: "created_at",
        type: "timestamp with time zone",
        createDate: true,
    } as EntitySchemaColumnOptions,
    updatedAt: {
        name: "updated_at",
        type: "timestamp with time zone",
        updateDate: true,
    } as EntitySchemaColumnOptions,
}
```

现在你可以在其他 schema 模型中使用 `BaseColumnSchemaPart`，例如：

```ts
export const CategoryEntity = new EntitySchema<Category>({
    name: "category",
    columns: {
        ...BaseColumnSchemaPart,
        // CategoryEntity 现在有了定义的 id、createdAt、updatedAt 列！
        // 另外，定义了以下新的字段
        name: {
            type: String,
        },
    },
})
```

你可以在 schema 模型中使用嵌入实体，示例如下：

```ts
export interface Name {
    first: string
    last: string
}

export const NameEntitySchema = new EntitySchema<Name>({
    name: "name",
    columns: {
        first: {
            type: "varchar",
        },
        last: {
            type: "varchar",
        },
    },
})

export interface User {
    id: string
    name: Name
    isActive: boolean
}

export const UserEntitySchema = new EntitySchema<User>({
    name: "user",
    columns: {
        id: {
            primary: true,
            generated: "uuid",
            type: "uuid",
        },
        isActive: {
            type: "boolean",
        },
    },
    embeddeds: {
        name: {
            schema: NameEntitySchema,
            prefix: "name_",
        },
    },
})
```

请确保也将“扩展”的列添加到 `Category` 接口里（例如通过 `export interface Category extends BaseEntity`）。

### 单表继承

要使用[单表继承](./3-entity-inheritance.md#single-table-inheritance)：

1. 在父类 schema 中添加 `inheritance` 选项，指定继承模式 ("STI") 及用于存储子类名称的 **区分列**（discriminator column）
2. 所有子类 schema 设置 `type: "entity-child"` 选项，同时通过上面介绍的扩展运算符语法继承父类列

```ts
// entity.ts

export abstract class Base {
    id!: number
    type!: string
    createdAt!: Date
    updatedAt!: Date
}

export class A extends Base {
    constructor(public a: boolean) {
        super()
    }
}

export class B extends Base {
    constructor(public b: number) {
        super()
    }
}

export class C extends Base {
    constructor(public c: string) {
        super()
    }
}
```

```ts
// schema.ts

const BaseSchema = new EntitySchema<Base>({
    target: Base,
    name: "Base",
    columns: {
        id: {
            type: Number,
            primary: true,
            generated: "increment",
        },
        type: {
            type: String,
        },
        createdAt: {
            type: Date,
            createDate: true,
        },
        updatedAt: {
            type: Date,
            updateDate: true,
        },
    },
    // 新增：继承选项
    inheritance: {
        pattern: "STI",
        column: "type",
    },
})

const ASchema = new EntitySchema<A>({
    target: A,
    name: "A",
    type: "entity-child",
    // 保存 'A' 实例时，"type" 列会被赋予此 discriminatorValue
    discriminatorValue: "my-custom-discriminator-value-for-A",
    columns: {
        ...BaseSchema.options.columns,
        a: {
            type: Boolean,
        },
    },
})

const BSchema = new EntitySchema<B>({
    target: B,
    name: "B",
    type: "entity-child",
    discriminatorValue: undefined, // 默认为类名 (如 "B")
    columns: {
        ...BaseSchema.options.columns,
        b: {
            type: Number,
        },
    },
})

const CSchema = new EntitySchema<C>({
    target: C,
    name: "C",
    type: "entity-child",
    discriminatorValue: "my-custom-discriminator-value-for-C",
    columns: {
        ...BaseSchema.options.columns,
        c: {
            type: String,
        },
    },
})
```

## 使用 Schema 查询 / 插入数据

当然，你可以在仓库或实体管理器中像使用装饰器一样使用定义好的 schema。考虑之前定义的 `Category` 示例（包括其接口和 `CategoryEntity` schema），用来获取数据或操作数据库。

```ts
// 请求数据
const categoryRepository = dataSource.getRepository<Category>(CategoryEntity)
const category = await categoryRepository.findOneBy({
    id: 1,
}) // category 类型正确！

// 向数据库插入新类别
const categoryDTO = {
    // 注意 ID 是自动生成的，参见上面的 schema
    name: "new category",
}
const newCategory = await categoryRepository.save(categoryDTO)
```