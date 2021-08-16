# graphql-microservice-demo

An Example using Apollo Federation

## 目录结构

```
├── gateway                     # 网关
├── common                      # 公用函数
│   ├── middleware             # apollo 中间件
│   ├── page.dao.js             # 分页dao
│   └── util.js                # 工具类
├── prisma                      # prisma ORM
│   ├── schema.prisma          # 数据库连接、模型定义文件
├── services                    # 服务
│   ├── reservation              # reservation 服务
│   ├── user                     # user 服务
│   │   ├── src
│   │   │   ├── dao             # 封装数据库操作
│   │   │   ├── resolvers       # query对应的处理器 相当于controller
│   │   │   └── typedefs        # 各种类型的定义。包括分页Connection、输入参数、接口、mutation、查询、实体等
│   │   │   └── server.js       # 入口
│   │   └── test               # 测试脚本

```

## 本地运行

```
$ yarn run test:up    # run mongodb

$ cd common
$ yarn link

$ cd prisma
$ yarn link

$ cd services/<service-name>
$ yarn install
$ yarn link @dao/prisma
$ yarn link @graphql/common
$ yarn run start:dev:service:<service-name>  # run service

$ cd gateway
$ yarn install
$ yarn link @dao/prisma
$ yarn link @graphql/common
$ yarn run start:dev:gateway # run gateway

# yarn run test       # run test case
```

## 开发流程

1.定义实体

- 在 prisma/schema.prisma 中定义实体

```
model User {
  id          String       @id @default(dbgenerated()) @map("_id") @db.ObjectId
  username    String       @unique
  reservation Reservation?
}

model Reservation {
  id       String @id @default(dbgenerated()) @map("_id") @db.ObjectId
  location String
  reservationDate String
  status   String
  userId   String @db.ObjectId
  user     User   @relation(fields: [userId], references: [id])
}
```

- 在 service/\<service-name\>/typedefs/objects 中定义 GraphQL 的实体。

```
const objects = gql`
  type User implements Node @key(fields: "id") {
    id: ID!
    username: String!
    reservations(first: Int, last: Int, before: String, after: String): ReservationConnection
  }

  extend type Reservation implements Node @key(fields: "id") {
    id: ID! @external
    location: String
    userId: ID! @external
    user: User @requires(fields: "userId")
  }
`;
```

如果该实体存在于其他 service 中，想要在当前 service 中扩展字段，可以加上 extend 关键字。如果某个字段需要分页，给这个字段加上 first, last, before, after 分页参数，并把返回值设置为 xxxConnection。xxxConnection 定义在 service/\<service-name\>/typedefs/connections 里面，比如 reservations 需要分页的结果,则需要定义 Reservation、ReservationConnection、ReservationEdge 三个类型。如果该结果不需要分页，则 reservations 的返回值设置为普通数组 [Reservation] 即可。

2.定义 query

- 在 service/\<service-name\>/typedefs/queries 中定义想要查询的结构体和返回值。

```
const queries = gql`
  extend type Query {
    user(id: ID!): User
    viewer: User!
    users(first: Int, after: String): UserConnection
    getUserWhere(user: searchUser): [User]
  }
`;
```

3.定义 resolver

- 在 service/\<service-name\>/resolvers/queries 中定义 query 对应的 resolver

```
Query: {
    user: (parent, args, context) => findUser({ id: args.userId }, context.prisma.user),
    viewer(parent, args, { user }) {
      return user;
    },
    users: (parent, args, context) => connectionResolver(args, context.prisma.user),
    getUserWhere: (parent, args, context) => findUsers(args.user, context.prisma.user)
  }
```

GraphQL 会对返回值是实体的字段进行单独的 query，所以，比如每个 user 的 reservations 返回的是实体，那么需要在 resolver 中定义根据当前 user 找到对应 reservations 的处理方法。

```
User: {
    reservations: (parent, args, context) => connectionResolver({ userId: parent.id, ...args }, context.prisma.reservation)
  },
```

4.查询

- 分页参数
  - first Int: 从前往后取多少条
  - last Int: 从后往前取多少条
  - before String: 从某个 cursor 往前取数据
  - after String: 从某个 cursor 往后取数据
- 查询语句

```
query Query($userId: ID!, $reservationsAfter: String, $reservationsFirst: Int) {
  user(id: $userId) {
    id
    username
    reservations(after: $reservationsAfter, first: $reservationsFirst) {
      totalCount
      pageInfo {
        endCursor
        hasNextPage
        hasPrevPage
        startCursor
      }
      nodes {
        location
        reservationDate
      }
    }
  }
}
```

## 测试工具

- 官方 Sanbox：[Apollo Studio](https://studio.apollographql.com/sandbox/explorer)
- 客户端工具：Postman、Altair
- npm 包：[HTTP Link](https://www.apollographql.com/docs/react/api/link/apollo-link-http/)、[apollo-server-integration-testing](https://www.npmjs.com/package/apollo-server-integration-testing)、[SuperTest](https://www.npmjs.com/package/supertest)
- ApolloServer 的 server.executeOperation() 该方式只会触发一个 GraphQL 的语句，并不会发送 http 请求。
