import transactionsWorker from "./transactions";


export const initWorkers = async () => {
    await transactionsWorker()
}