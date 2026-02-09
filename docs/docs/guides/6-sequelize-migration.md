# 从 Sequelize 迁移到 TypeORM

## 设置数据源

在 sequelize 中，你这样创建数据源：

```javascript
const sequelize = new Sequelize("database", "username", "password", {
    host: "localhost",
    dialect: "mysql",
})

sequelize
    .authenticate()
    .then(() => {
        console.log("Data Source has been initialized successfully.")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })
```

在 TypeORM 中，你这样创建数据源：

```typescript
import { DataSource } from "typeorm"

const dataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    username: "username",
    password: "password",
})

dataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized successfully.")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })
```

之后你可以在应用的任何地方使用 `dataSource` 实例。

了解更多关于 [数据源](../data-source/1-data-source.md)

## 模式同步

在 sequelize 中你这样做模式同步：

```javascript
Project.sync({ force: true })
Task.sync({ force: true })
```

在 TypeORM 中，只需在数据源选项中添加 `synchronize: true`：

```typescript
const dataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    username: "username",
    password: "password",
    synchronize: true,
})
```

## 创建模型

在 sequelize 中模型的定义方式如下：

```javascript
module.exports = function (sequelize, DataTypes) {
    const Project = sequelize.define("project", {
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
    })

    return Project
}
```

```javascript
module.exports = function (sequelize, DataTypes) {
    const Task = sequelize.define("task", {
        title: DataTypes.STRING,
        description: DataTypes.TEXT,
        deadline: DataTypes.DATE,
    })

    return Task
}
```

在 TypeORM 中，这些模型称为实体，定义方式如下：

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Project {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column()
    description: string
}
```

```typescript
import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class Task {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column("text")
    description: string

    @Column()
    deadline: Date
}
```

强烈建议每个实体类单独放一个文件。  
TypeORM 允许你使用类作为数据库模型，并提供声明式的方式定义模型中哪些部分将成为数据库表的一部分。  
TypeScript 的强大之处在于提供类型提示和其他有用的特性，你可以在类中使用。

了解更多关于 [实体和列](../entity/1-entities.md)

## 其他模型设置

在 sequelize 中：

```javascript
flag: { type: Sequelize.BOOLEAN, allowNull: true, defaultValue: true },
```

在 TypeORM 中可以这样实现：

```typescript
@Column({ nullable: true, default: true })
flag: boolean;
```

sequelize 中：

```javascript
flag: { type: Sequelize.DATE, defaultValue: Sequelize.NOW }
```

在 TypeORM 中写法为：

```typescript
@Column({ default: () => "NOW()" })
myDate: Date;
```

sequelize 中：

```javascript
someUnique: { type: Sequelize.STRING, unique: true },
```

在 TypeORM 中这样写：

```typescript
@Column({ unique: true })
someUnique: string;
```

sequelize 中：

```javascript
fieldWithUnderscores: { type: Sequelize.STRING, field: "field_with_underscores" },
```

在 TypeORM 中对应：

```typescript
@Column({ name: "field_with_underscores" })
fieldWithUnderscores: string;
```

sequelize 中：

```javascript
incrementMe: { type: Sequelize.INTEGER, autoIncrement: true },
```

TypeORM 中这样实现：

```typescript
@Column()
@Generated()
incrementMe: number;
```

sequelize 中：

```javascript
identifier: { type: Sequelize.STRING, primaryKey: true },
```

在 TypeORM 中：

```typescript
@Column({ primary: true })
identifier: string;
```

要创建类似 `createDate` 和 `updateDate` 的列，你需要在实体中定义两个列（名字随你）：

```typescript
@CreateDateColumn();
createDate: Date;

@UpdateDateColumn();
updateDate: Date;
```

### 使用模型

在 sequelize 中创建并保存新模型：

```javascript
const employee = await Employee.create({
    name: "John Doe",
    title: "senior engineer",
})
```

在 TypeORM 中有几种方法创建并保存新模型：

```typescript
const employee = new Employee() // 你也可以使用构造函数参数
employee.name = "John Doe"
employee.title = "senior engineer"
await dataSource.getRepository(Employee).save(employee)
```

或者使用 Active Record 模式：

```typescript
const employee = Employee.create({ name: "John Doe", title: "senior engineer" })
await employee.save()
```

如果你想从数据库加载已有实体并替换其部分属性，可以使用：

```typescript
const employee = await Employee.preload({ id: 1, name: "John Doe" })
```

了解更多关于 [Active Record 与 Data Mapper](./1-active-record-data-mapper.md) 以及 [Repository API](../working-with-entity-manager/6-repository-api.md)。

在 sequelize 中访问属性：

```typescript
console.log(employee.get("name"))
```

在 TypeORM 中你直接这样：

```typescript
console.log(employee.name)
```

在 sequelize 中创建索引：

```typescript
sequelize.define(
    "user",
    {},
    {
        indexes: [
            {
                unique: true,
                fields: ["firstName", "lastName"],
            },
        ],
    },
)
```

在 TypeORM 中：

```typescript
@Entity()
@Index(["firstName", "lastName"], { unique: true })
export class User {}
```

了解更多关于 [索引](../advanced-topics/3-indices.md)