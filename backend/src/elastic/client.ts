import {Client} from "@elastic/elasticsearch"

let es_url = process.env.ELASTICSEARCH_URL || "http://localhost:9200"

export let client = new Client({node: es_url})

export async function init_indices() {
    let indices = ["links", "users"]

    for (let index of indices) {
        let exists = await client.indices.exists({index})
        if (!exists) {
            await client.indices.create({index})
            console.log("Created index: " + index)
        }
    }
}
