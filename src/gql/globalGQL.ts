import { CardsController, GlobalController } from '@/controllers'


const type = () => {
    return `
       
    `
}


const query = () => {
    return `
    `
}

const mutation = () => {
    return `  
        signData(hash: String): String      
    `
}

const subscription = () => {
    return ``
}

const { signData } = GlobalController
const resolvers = {
    query: {},
    mutation: {
        signData
    },
    subscription: {}
}

export default {
    type,
    query,
    mutation,
    subscription,
    resolvers
}