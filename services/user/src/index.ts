import { ApolloServer, gql } from 'apollo-server';
import { buildFederatedSchema } from '@apollo/federation';

// Construct a schema, using GraphQL schema language
const typeDefs = gql`
  type User @key(fields: "id") {
    id: ID!
    firstName: String!
    lastName: String!
    address: String
  }
  type Query {
    user(id: ID!): User
  }
  # This was originally in the stitched gateway
  extend type Reservation @key(fields: "id") {
    id: ID! @external
    userId: ID! @external
    user: User @requires(fields: "userId")
  }
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const lookupUser = (args?: any): any => ({
  id: 1,
  firstName: 'Jake',
  lastName: 'Dawkins',
  address: 'everywhere'
});

const resolvers = {
  Query: {
    user: (): any => lookupUser()
  },
  User: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    __resolveReference(object: any): any {
      return lookupUser();
    }
  },
  Reservation: {
    user: ({ userId }: any): any =>
      /**
       * The old stitched resolvers called the Query.user resolver to lookup
       * a user, but since we're in this service, we can just use whatever we
       * need to lookup a user.
       */
      lookupUser(userId)
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([
    {
      typeDefs,
      resolvers
    }
  ])
});

// eslint-disable-next-line @typescript-eslint/no-floating-promises
server.listen(4001).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
