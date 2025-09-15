import { server } from "./src/server";
import { triggers } from "./src/triggers";


server.registerTriggerDefinition(triggers)

server.start((url) => {
    console.log(`Server running at ${url}`);
})