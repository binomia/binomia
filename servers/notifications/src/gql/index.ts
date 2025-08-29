

export const typeDefs = `
    type Query { 
        test: String
    }

`;


export const resolvers = {
    Query: {
        test: () => "test"
    }
}

