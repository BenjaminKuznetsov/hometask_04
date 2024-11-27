import { app } from "./app"
import { runDb } from "./db/mongo"
import { appConfig } from "./common/config/config"

const port = appConfig.port

app.listen(port, async () => {
    const success = await runDb()
    if (!success) {
        process.exit(1)
    }
    console.log(`Example app listening on port ${port}`)
})
