import { ApolloServerBase, ContextFunction } from '../../dist';
import gql from 'graphql-tag';
import type { GraphQLResponse } from 'apollo-server-types';

const typeDefs = gql`
  type Query {
    hello: String
  }
`;

const resolvers = {
  Query: {
    hello() {
      return 'world';
    },
  },
};

describe('formatResponse', () => {
  it('has access to the provided context', async () => {
    type Context = {
      responseLogger: (response: GraphQLResponse) => void;
    };

    const responseLogger = jest.fn();

    type ContextFunctionParams = {};

    const createContext: ContextFunction<
      ContextFunctionParams,
      Context
    > = () => {
      return { responseLogger };
    };

    const server = new ApolloServerBase<ContextFunctionParams, Context>({
      typeDefs,
      resolvers,
      context: createContext,
      formatResponse: (response, requestContext) => {
        // this is expected not to result in a TS error
        requestContext.context.responseLogger(response);

        return response;
      },
    });

    await server.start();

    await server.executeOperation({ query: '{ hello }' }, { fooIn: 'bla' });

    expect(responseLogger).toHaveBeenCalled();
  });
});
