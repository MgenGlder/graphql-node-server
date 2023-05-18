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

type Query {
    warriors: [Warrior]
}
`
const resolvers = {
    Query: {
        warriors: (obj, args, context, info) => context.warriors,
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