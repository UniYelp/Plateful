SQL, NoSQL, and graph databases are distinct database management systems, each designed for different data storage, retrieval, and relationship needs. SQL databases are relational and ideal for structured data and complex queries, while NoSQL databases, including document and key-value stores, offer flexibility for unstructured data and high-volume, fast operations. Graph databases, a type of NoSQL, specialize in managing and querying highly interconnected data. 

#### **SQL (relational) databases**

SQL (Structured Query Language) databases are the traditional standard, organizing data into tables with predefined schemas. 

- **Data model:** Stores data in a structured, table-based format with rows and columns. Relationships between tables are defined using primary and foreign keys.
- **Schema:** Uses a rigid, predefined schema that must be defined before data is stored. Any change to the schema can be complex and cause significant downtime.
- **Scalability:** Traditionally scales vertically by increasing the power of a single server. Horizontal scaling (adding more servers) is possible but more complex.
- **Data integrity:** Strongly adheres to ACID (Atomicity, Consistency, Isolation, Durability) properties, ensuring reliable and consistent transactions.
- **Best for:** Applications with well-defined, structured data where data integrity and complex, multi-row transactions are critical. Examples include banking systems, financial applications, and legacy systems. 

#### **NoSQL (non-relational) databases**

The term "NoSQL" (often interpreted as "Not only SQL") covers a variety of database types that are better suited for managing unstructured or semi-structured data. Graph databases are one type of NoSQL database. 

##### Common types of NoSQL databases

- **Document databases:** Store data in flexible, semi-structured documents, often in JSON or BSON format. Each document is self-contained and can have a different structure, allowing for flexible schema changes.
    - **Examples:** MongoDB, CouchDB.
- **Key-value stores:** The simplest type of NoSQL database, storing data as a collection of key-value pairs. Optimized for fast, efficient lookups using a unique key.
    - **Examples:** Redis, Amazon DynamoDB.
- **Column-family stores:** Store data in columns rather than rows, organizing related columns into "families." Designed for wide datasets and fast access to specific columns across a large number of rows.
    - **Examples:** Apache Cassandra, HBase. 

##### NoSQL characteristics

- **Data model:** Uses flexible, non-tabular models (documents, key-value, etc.), which allows developers to quickly adapt to changing data requirements.
- **Schema:** Has a dynamic, flexible schema, meaning new fields can be added without affecting existing data or requiring major downtime.
- **Scalability:** Scales horizontally by distributing data across multiple servers, making it ideal for handling large volumes of data and high traffic.
- **Data integrity:** Many NoSQL databases prioritize availability and partition tolerance over strict consistency (following the CAP theorem), though some support ACID properties.
- **Best for:** Applications with large, rapidly changing datasets, such as e-commerce product catalogs, content management systems, and real-time analytics. 

#### **Graph databases**

Graph databases are a specialized subset of NoSQL databases designed to manage data where the relationships are as important as the data itself. 

- **Data model:** Uses graph structures to store data.
    - **Nodes:** Represent entities (e.g., people, places).
    - **Edges:** Represent the relationships between nodes (e.g., "knows," "worked with").
    - **Properties:** Key-value pairs that store information on both nodes and edges.
- **Schema:** Flexible, allowing for easy updates and modifications to the graph structure over time.
- **Scalability:** Optimized for relationship traversal. Performance remains consistent even as the dataset grows because the relationships are stored directly in the database, avoiding expensive join operations.
- **Query language:** Uses specialized query languages like Cypher (Neo4j) or Gremlin (Apache TinkerPop), which are more intuitive for relationship-heavy queries than SQL.
- **Best for:** Use cases where complex relationships are central to the application. Examples include social networks (connections between users), fraud detection (transaction patterns), and recommendation engines. 

#### **Comparison summary**

| Aspect               | SQL (Relational)                                                                       | NoSQL (Non-Relational)                                                | Graph (Type of NoSQL)                                                     |
| -------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **Data Model**       | Tabular, with rows and columns.                                                        | Diverse models (Document, Key-Value, etc.).                           | Graph structure (Nodes, Edges, Properties).                               |
| **Schema**           | Rigid and predefined.                                                                  | Dynamic and flexible.                                                 | Flexible, can be schema-less.                                             |
| **Scalability**      | Primarily vertical (larger server); horizontal is complex.                             | Horizontal (adding more servers).                                     | Optimized for horizontal scaling.                                         |
| **Best for**         | Structured data, complex queries, and applications needing high data integrity.        | Large, fast-changing, or unstructured datasets and high write speeds. | Heavily interconnected data, such as social networks and fraud detection. |
| **Query Language**   | SQL.                                                                                   | Varies by database; often uses APIs or its own language.              | Specialized graph query languages like Cypher or Gremlin.                 |
| **Data Integrity**   | High (ACID compliant).                                                                 | Varies by database (often BASE compliant for higher availability).    | Varies, with some systems offering ACID properties.                       |
| **Example DBs**      | MySQL, PostgreSQL, Oracle, SQL Server.                                                 | MongoDB, Cassandra, Redis.                                            | Neo4j, Amazon Neptune.                                                    |
| **Hosted solutions** | [[Prisma\|Prisma Postgres]], CockroachDB, [[Vercel\|Vercel Postgres]], MariaDB, etc... | [[Redis]], [[Upstash]], MongoDB, [[Convex]], etc...                   |                                                                           |

### ORM varieties and ease of use by language

##### TypeScript

The [[Architecture/Stack/TypeScript]] ORM ecosystem is rapidly evolving, with modern, type-safe solutions leading the way. 

| ORM                | Supported Database | Ease of Use                                                                                                                                                                                          | Key Characteristics                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[[DrizzleORM]]** | SQL                | **High.** Lightweight, serverless-friendly, and SQL-centric. It is designed for developers comfortable with SQL but who also want the benefits of type safety.                                       | • **Lightweight:** Has a very small footprint and no dependencies.  <br>• **SQL-first:** Queries are very similar to SQL, making the learning curve shallow for those with SQL knowledge.  (also has a relational client similar to Prisma's) <br>• **Tooling:** Includes `drizzle-kit` for schema migrations, drizzle-seed for data seeding, a mock client api and `drizzle Studio` for a GUI. <br>• **Serverless-ready:** Optimized for modern, serverless architectures. |
| **[[PrismaORM]]**  | SQL, MongoDB       | **High.** Emphasizes developer experience with a schema-first approach. The auto-generated client provides an intuitive, type-safe API for queries and migrations, which can reduce boilerplate.     | • **Schema-first:** A declarative schema acts as the single source of truth.  <br>• **Type safety:** Excellent, with generated types for both queries and results.  <br>• **Tooling:** Includes `Prisma Migrate` for schema evolution and `Prisma Studio` for a GUI.                                                                                                                                                                                                        |
| **TypeORM**        | SQL, MongoDB       | **Medium.** Offers great flexibility but can be more complex to set up and configure, especially with advanced features and relationships. Supports both the Active Record and Data Mapper patterns. | • **Flexibility:** Supports a wide range of database types and both primary architectural patterns.  <br>• **Decorators:** Uses decorators (`@Entity`, `@Column`) for defining models, which is familiar to many TypeScript developers.                                                                                                                                                                                                                                     |
| MikroORM           |                    |                                                                                                                                                                                                      |                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

##### Python

The [[Python]] ORM landscape includes powerful, mature libraries as well as newer, async-focused options. 

|ORM|Supported Database|Ease of Use|Key Characteristics|
|---|---|---|---|
|**Django ORM**|SQL|**High.** Exceptionally easy to use and tightly integrated with the Django framework. The "batteries-included" philosophy means migrations and admin interfaces are built-in.|• **High-level:** Offers a simple, high-level abstraction perfect for standard web application use cases.  <br>• **Framework-dependent:** Primarily used within the Django ecosystem, making it less suitable for standalone projects.|
|**SQLAlchemy**|SQL|**Medium to low.** The "Swiss Army knife" of Python ORMs, renowned for its power and flexibility. It has a steeper learning curve than Django ORM but offers a lower-level, more explicit control over SQL.|• **Highly flexible:** Consists of two parts—a SQL expression language (Core) and a full ORM.  <br>• **Robust:** Mature, production-ready, and supports a vast array of database features.  <br>• **Async support:** Includes solid support for asynchronous applications.|
|**Tortoise ORM**|SQL|**High.** An async-first ORM inspired by the simplicity of Django ORM. It is specifically designed for modern asynchronous web frameworks like FastAPI.|• **Async native:** Built from the ground up for asynchronous operations.  <br>• **Intuitive:** Provides a familiar, easy-to-learn API for those with Django experience.|
|**PonyORM**|SQL|**High.** Features a unique, Pythonic query syntax using generator expressions, which many developers find intuitive and concise. However, it has a smaller community and less mature features like migration support.|• **Pythonic syntax:** Allows for writing queries directly in Python.  <br>• **Concise:** Reduces boilerplate code for common query patterns.|

##### Elixir

For [[Elixir]], the ORM story is dominated by one official and highly integrated solution. 

| ORM          | Supported Database            | Ease of Use                                                                                                                                                                                                                                                                                   | Key Characteristics                                                                                                                                                                                                                                                                                                   |
| ------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[[Ecto]]** | SQL, NoSQL (through adapters) | **Medium.** While it has a slightly higher learning curve than some other ORMs, Ecto is considered the gold standard in the Elixir community. It is not a traditional ORM but a "Data Mapper" that separates the data layer from the business logic, providing explicit control over queries. | • **Data Mapper:** Offers explicit control, avoiding many of the "magic" issues associated with traditional ORMs.  <br>• **Functional paradigm:** Designed to integrate seamlessly with Elixir's functional nature.  <br>• **Composable queries:** Allows building complex queries from smaller, readable components. |

#### ORM use with different database types

The best ORM for a project depends on the database you choose (SQL, NoSQL, or Graph) and the language you are using.

- **For SQL databases,** the widest variety of ORMs is available. You can choose based on trade-offs between ease of use (e.g., Django ORM, Prisma) and power/flexibility (e.g., SQLAlchemy).
- **For NoSQL databases** (like MongoDB), ORMs are often called ODMs (Object-Document Mappers). Libraries like Mongoose for TypeScript or MongoEngine for Python abstract the document-based data, though some general-purpose ORMs like Prisma also support them.
- **For Graph databases,** traditional ORMs are not a good fit due to the highly relational nature of the data. Developers typically use graph-native libraries that interact with the database using its specific query language, such as the Cypher-based drivers for Neo4j.

---

We ended up choosing a combination of [[Convex]], [[Prisma|Prisma Postgres]] / [[Vercel|Vercel Postgres]], and [[Redis]] (via [[Upstash]]), each covering a different part of the system. Convex is at the core of our [[Web]] and [[Mobile]] apps, providing a serverless backend with a built-in database, real-time queries, and reactive state management. This lets us move quickly without managing infrastructure while ensuring the apps stay consistent and responsive.

Alongside that, we’re using Prisma Postgres for a separate [[Recipe Recommendations Service]]. It maintains its own set of relational tables, giving us strong ACID guarantees, complex querying power, and the flexibility to run recommendation logic while still being able to query Convex when needed. Finally, Redis through Upstash supports the [[Barcode Service]], dedicated to caching data from external APIs required by the apps. With its low-latency key-value model and serverless pricing, it’s a great fit for handling ephemeral data and speeding up integrations. Together, this setup gives us a balanced architecture: Convex for app logic and real-time data, Prisma Postgres for structured recommendation workloads, and Redis for high-performance caching of external data.
