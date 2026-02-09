import type { ReactNode } from "react"
import React from "react"
import clsx from "clsx"
import Link from "@docusaurus/Link"
import useDocusaurusContext from "@docusaurus/useDocusaurusContext"
import Layout from "@theme/Layout"
import Heading from "@theme/Heading"
import CodeBlock from "@theme/CodeBlock"

import styles from "./index.module.css"

// Feature section data
const features = [
    {
        title: "灵活的模式",
        description:
            "支持 DataMapper 和 ActiveRecord 两种模式，让您可以灵活选择最适合项目的方案。",
        icon: "⚙️",
    },
    {
        title: "TypeScript 优先",
        description:
            "从头开始构建，支持 TypeScript，为您的数据库模型提供完整的类型安全。",
        icon: "📝",
    },
    {
        title: "多数据库支持",
        description:
            "支持 MySQL、PostgreSQL、MariaDB、SQLite、MS SQL Server、Oracle、MongoDB 等多种数据库。",
        icon: "🗄️",
    },
    {
        title: "强大的查询构建器",
        description:
            "优雅的语法用于构建包含连接、分页和缓存的复杂查询。",
        icon: "🔍",
    },
    {
        title: "迁移与模式",
        description:
            "对数据库迁移提供一流支持，并自动生成。",
        icon: "🚀",
    },
    {
        title: "跨平台",
        description:
            "适用于 Node.js、浏览器、移动端和桌面应用程序。",
        icon: "🌐",
    },
]

// Code examples for tabs
const codeExamples = {
    entity: `import { Entity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string

    @Column()
    age: number
}`,
    dataMapper: `// Data Mapper approach
const userRepository = dataSource.getRepository(User)

// Create and save a user
const user = new User()
user.firstName = "Timber"
user.lastName = "Saw"
user.age = 25
await userRepository.save(user)

// Find all users
const allUsers = await userRepository.find()

// Find user by ID
const user = await userRepository.findOneBy({ id: 1 })`,
    activeRecord: `// Active Record approach
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "typeorm"

@Entity()
export class User extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    firstName: string

    @Column()
    lastName: string
}

// Create and save
const user = new User()
user.firstName = "Timber"
user.lastName = "Saw"
await user.save()

// Find all users
const users = await User.find()

// Find specific user
const user = await User.findOneBy({ firstName: "Timber" })`,
}

function HomepageHeader() {
    const { siteConfig } = useDocusaurusContext()
    return (
        <header className={clsx("hero hero--primary", styles.heroBanner)}>
            <div className="container">
                <div className={styles.heroContent}>
                    <div className={styles.heroText}>
                        <Heading as="h1" className="hero__title">
                            {siteConfig.title}
                        </Heading>
                        <p className="hero__subtitle">{siteConfig.tagline}</p>
                        <div className={styles.buttons}>
                            <Link
                                className="button button--secondary button--lg"
                                to="/docs/getting-started"
                            >
                                开始使用
                            </Link>
                            <Link
                                className="button button--outline button--lg"
                                href="https://github.com/typeorm/typeorm"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                在 GitHub 上查看
                            </Link>
                        </div>
                    </div>
                    <div className={styles.heroImage}>
                        <img
                            src="/img/typeorm-logo-white.svg"
                            alt="TypeORM Logo"
                        />
                    </div>
                </div>
            </div>
        </header>
    )
}

function Feature({ title, description, icon }) {
    return (
        <div className={clsx("col col--4", styles.featureItem)}>
            <div className={styles.featureIcon}>{icon}</div>
            <div className={styles.featureContent}>
                <Heading as="h3">{title}</Heading>
                <p>{description}</p>
            </div>
        </div>
    )
}

function HomepageFeatures() {
    return (
        <section className={styles.features}>
            <div className="container">
                <div className="row">
                    {features.map((props, idx) => (
                        <Feature key={idx} {...props} />
                    ))}
                </div>
            </div>
        </section>
    )
}

function CodeExampleSection() {
    const [activeTab, setActiveTab] = React.useState("entity")

    const handleTabClick = (tab) => {
        setActiveTab(tab)
    }

    return (
        <section className={styles.codeExampleSection}>
            <div className="container">
                <div className={styles.codeExampleContent}>
                    <div className={styles.codeExampleText}>
                        <Heading as="h2">优雅且类型安全的 API</Heading>
                        <p>
                            TypeORM 提供了一个美观、简单的 API，用于与数据库交互，充分利用了 TypeScript 的类型系统。你可以选择 DataMapper 或 ActiveRecord 模式——两者都完全支持。
                        </p>
                        <div className={styles.codeTabs}>
                            <div className={styles.codeTabHeader}>
                                <div
                                    className={clsx(
                                        activeTab === "entity" &&
                                            styles.codeTabActive,
                                    )}
                                    onClick={() => handleTabClick("entity")}
                                >
                                    实体定义
                                </div>
                                <div
                                    className={clsx(
                                        activeTab === "dataMapper" &&
                                            styles.codeTabActive,
                                    )}
                                    onClick={() => handleTabClick("dataMapper")}
                                >
                                    数据映射器
                                </div>
                                <div
                                    className={clsx(
                                        activeTab === "activeRecord" &&
                                            styles.codeTabActive,
                                    )}
                                    onClick={() =>
                                        handleTabClick("activeRecord")
                                    }
                                >
                                    活动记录
                                </div>
                            </div>
                            <div className={styles.codeTabContent}>
                                <CodeBlock language="typescript">
                                    {codeExamples[activeTab]}
                                </CodeBlock>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function SupportedDatabases() {
    const databases = [
        { name: "MySQL", icon: "/img/databases/mysql.png", category: "core" },
        {
            name: "PostgreSQL",
            icon: "/img/databases/postgresql.png",
            category: "core",
        },
        {
            name: "MariaDB",
            icon: "/img/databases/mariadb.png",
            category: "core",
        },
        { name: "SQLite", icon: "/img/databases/sqlite.png", category: "core" },
        {
            name: "MS SQL Server",
            icon: "/img/databases/mssql.png",
            category: "core",
        },
        { name: "Oracle", icon: "/img/databases/oracle.png", category: "core" },
        {
            name: "MongoDB",
            icon: "/img/databases/mongodb.png",
            category: "core",
        },
        {
            name: "CockroachDB",
            icon: "/img/databases/cockroachdb.png",
            category: "core",
        },
        { name: "SAP HANA", icon: "/img/databases/sap.png", category: "core" },
        {
            name: "Google Spanner",
            icon: "/img/databases/spanner.svg",
            category: "core",
        },
    ]

    return (
        <section className={styles.databasesSection}>
            <div className="container">
                <Heading as="h2" className={styles.sectionTitle}>
                    支持的数据库
                </Heading>
                <div className={styles.databasesGrid}>
                    {databases.map((db, index) => (
                        <div key={index} className={styles.databaseItem}>
                            <div className={styles.databaseLogo}>
                                <img src={db.icon} alt={`${db.name} logo`} />
                            </div>
                            <span className={styles.databaseName}>
                                {db.name}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

function PlatformsSection() {
    return (
        <section className={styles.platformsSection}>
            <div className="container">
                <Heading as="h2" className={styles.sectionTitle}>
                    适用于所有平台
                </Heading>
                <p className={styles.platformsDescription}>
                    TypeORM 可以在 NodeJS、浏览器、Cordova、Ionic、React Native、NativeScript、Expo 和 Electron 平台运行。
                </p>
                <div className={styles.platformsIcons}>
                    <span>🖥️ NodeJS</span>
                    <span>🌐 Browser</span>
                    <span>📱 Mobile</span>
                    <span>⚛️ React Native</span>
                    <span>🖼️ Electron</span>
                </div>
            </div>
        </section>
    )
}

function CallToAction() {
    return (
        <section className={styles.ctaSection}>
            <div className="container">
                <Heading as="h2">准备好开始了吗？</Heading>
                <p>
                    TypeORM 让数据库交互变得轻而易举。加入已经在使用 TypeORM 构建更好应用程序的数千名开发者的行列吧。
                </p>
                <div className={styles.ctaButtons}>
                    <Link
                        className={clsx(
                            "button button--secondary button--lg margin-right--md",
                            styles.noHorizontalMarginTablet,
                        )}
                        to="/docs/getting-started"
                    >
                        阅读文档
                    </Link>
                    <Link
                        className="button button--outline button--lg"
                        href="https://github.com/typeorm/typeorm"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        在 GitHub 上点赞
                    </Link>
                </div>
            </div>
        </section>
    )
}

export default function Home(): ReactNode {
    const { siteConfig } = useDocusaurusContext()
    return (
        <Layout
            title={`${siteConfig.title} - ${siteConfig.tagline}`}
            description="TypeORM is an ORM that can run in NodeJS, Browser, Cordova, Ionic, React Native, NativeScript, Expo, and Electron platforms and can be used with TypeScript and JavaScript."
        >
            <HomepageHeader />
            <main>
                <HomepageFeatures />
                <CodeExampleSection />
                <SupportedDatabases />
                <PlatformsSection />
                <CallToAction />
            </main>
        </Layout>
    )
}
