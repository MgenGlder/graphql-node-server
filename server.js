import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';

// Using type: module in package.json allows for the use of 
// ESModules 'import' instead of CommonJS require
const app = express();
const port = 4000;

const PIKEMEN_TYPES = {
    SISTER: 'sister',
    BROTHER: 'brother'
}

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
        { __typename: 'Pikeman', id: '002', name: 'Brittany' },
        { __typename: 'Pikeman', id: '005', name: 'Justice' }
    ],
    specialPerson: {
            id: '1',
            nickname: 'Chino', 
            governmentName: 'Chinonyeleleumlem Ekwueme',
            height: "4'11",
            age: 13,
            favoriteColor: 'purple',
            favoriteTvShow: 'Misfits',
            nationality: {
                born: 'America',
                ethnicity: 'Nigerian'
            },
            hobbies: [
                'dance',
                'draw',
                'cook',
                'guitar',
                'jokes',
                'learn about systemic oppression of minoritized populations'
            ],
            location: 'Ann Arbor'
    }
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

type Nationality {
    born: String
    ethnicity: String
}

type SpecialPerson {
    id: String
    nickname: String
    governmentName: String
    height: String
    age: Int
    favoriteColor: String
    favoriteTvShow: String
    nationality: Nationality
    hobbies: [ String ]
    location: String
}

type Query {
    warriors: [Warrior]
    horsemen(num: Int!): [Horsemen]
    pikemen(type: String): UnionType
    special: SpecialPerson
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
        horsemen: (obj, {num}, {horsemen}, info) => {
            if(num) {
                horsemen.forEach((man) => {
                    man.id = num;
                });
                return horsemen
            }
        },
        pikemen: (obj, args, context, info) => {
            const {pikemen} = context;
            const [sister, brother] = pikemen;
            const {type} = args;
            if(type) {
                switch(type) {
                    case PIKEMEN_TYPES.SISTER:
                        return sister;
                    case PIKEMEN_TYPES.BROTHER:
                        return brother;
                    default:
                        return sister;
                }
            }
            return pikemen;
        },
        special: (obj, args, {specialPerson}, info) => {
            return specialPerson;
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