import { topUpQueue } from "@/queues";
import { ServerHelpers, ServerTypes } from "cromio";
import shortUUID from "short-uuid";


const topUp = ServerHelpers.triggerDefinition()

topUp.onTrigger("createTopUp", async ({body}: ServerTypes.OnTriggerType) => {
    try {
        const jobId = `queueTopUp@${shortUUID.generate()}${shortUUID.generate()}`
        const job = await topUpQueue.queue.add(jobId, body, {
            jobId,
            removeOnComplete: {
                age: 20 // 30 minutes
            },
            removeOnFail: {
                age: 60 * 30 // 24 hours
            }
        });

        return job.asJSON().id

    } catch (error) {
        console.log({ createTransaction: error });
        throw error
    }
})

export default topUp