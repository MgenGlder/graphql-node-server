import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

// Using type: module in package.json allows for the use of 
// ESModules 'import' instead of CommonJS require
const app = express();
const port = 4000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

const data = {
    warriors: [
        { id: '001', name: 'Jaime' },
        { id: '002', name: 'Joriah' },
    ],
    horsemen: [
        { id: '001', name: 'Kunle' },
        { id: '002', name: 'Justice' }
    ],
    pikemen: [
        { __typename: 'Pikeman', id: '002', name: 'Brittany' }
    ]
}

app.get('/', (request, response) => {
    response.send('Hello, GraphQL!');
});

app.listen(port, () => {
    console.log(`Running a server at http://localhost:${port}`);
});

const typeDefs = `
type Warrior {
    id: ID!
    name: String!
}

type Horsemen {
    id: ID!
    name: String!
}

type Pikeman {
    id: ID!
    name: String!
}

type Query {
    warriors: [Warrior]
    horsemen(num: Int!): [Horsemen]
    pikemen: [UnionType]
}

union UnionType = Horsemen | Pikeman | Warrior
`
/**
 * Resolvers object that contains logic that generates the response for each field.
 * 
 * @remarks
 * Very much incomplete, just trying to get things working at this point.
 */
const resolvers = {
    Query: {
        warriors: (obj, args, context, info) => context.warriors,
        horsemen: (obj, args, context, info) => {
            if (args['num']) {
                context.horsemen.forEach((man) => {
                    man.id = args['num'];
                })
                return context.horsemen
            }
        },
        pikemen: (obj, args, context, info) => {
            return context.pikemen
        }
    },
}

const executableSchema = makeExecutableSchema({
    typeDefs,
    resolvers
});

app.use(
    '/graphql',
    graphqlHTTP({
        schema: executableSchema,
        context: data,
        graphql: true
    })
)