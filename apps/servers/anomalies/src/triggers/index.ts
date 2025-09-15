import { triggerDefinition, ServerTypes } from "cromio"
import { iforest } from "../libs";

const triggers: ReturnType<typeof triggerDefinition> = triggerDefinition()

triggers.onTrigger("predictTransaction", ({ body, reply }: ServerTypes.OnTriggerType) => {
    const result = iforest.predictTransaction(body);
    reply(result)
})

export { triggers }

