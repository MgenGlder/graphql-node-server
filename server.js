import express from 'express';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import { makeExecutableSchema } from '@graphql-tools/schema';
const { composeResolvers } = require('@graphql-tools/resolvers-composition')

// Using type: module in package.json allows for the use of 
// ESModules 'import' instead of CommonJS require
const app = express();

const PIKEMEN_TYPES = {
    sister: 'sister',
    brother: 'brother'
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

app.listen(process.env.PORT || 8080, () => {
    console.log(`Running a server at http://localhost:${port}`);
});

const typeDefs = `
"""
Warriors Definition
"""
type Warrior {
    id: ID!
    name: String!
}

"""
Horsemen Definition
"""
type Horsemen {
    id: ID!
    name: String!
}

"""
Pikemen Definition
"""
type Pikeman {
    id: ID!
    name: String!
}

"""
Nationality Definition
"""
type Nationality {
    born: String
    ethnicity: String
}

"""
SpecialPerson Definition
"""
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

"""
Query Definition
"""
type Query {
    warriors: [Warrior]
    horsemen(num: Int!): [Horsemen]
    pikemen(type: String): UnionType
    special: SpecialPerson
}

"""
Union type Definition
"""
union UnionType = Horsemen | Pikeman | Warrior
`
/**
 * Resolvers object that contains logic that generates the response for each field.
 * 
 * @remarks
 * Very much incomplete, just trying to get things working at this point.
 */
const resolvers = {
    Mutation: {
        changeWarriors()
    },
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
                    case PIKEMEN_TYPES.sister:
                        return sister;
                    case PIKEMEN_TYPES.brother:
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

const contest = {};

const isAuthenticated = () => next => (root, args, context, info) => {
    if (!context.currentUser) {
      throw new Error('You are not authenticated!')
    }
   
    return next(root, args, context, info)
};

const hasRole = (role) => next => (root, args, context, info) => {
    if (!context.currentUser.roles?.includes(role)) {
      throw new Error('You are not authorized!')
    }
   
    return next(root, args, context, info)
}

const resolversComposition = {
    'Query.*': [isAuthenticated(), hasRole('EDITOR')]
}

const composeResolvers = composeResolvers(resolvers, resolversComposition);

const executableSchema = makeExecutableSchema({
    typeDefs,
    composeResolvers
});

app.use(
    '/graphql',
    graphqlHTTP({
        schema: executableSchema,
        context: data,
        graphql: true
    })
)