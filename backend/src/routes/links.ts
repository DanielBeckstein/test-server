import {Router, Request, Response} from "express"
import {client} from "../elastic/client"
import {auth_middleware, AuthRequest} from "../middleware/auth/jwt.js"
import {ApiError} from "../middleware/error"
import {MyAuthRequest} from "./types"

let router = Router()
let index = "links"

function hit_to_link(hit: { _id?: string; _source?: unknown }) {
    return {id: hit._id, ...hit._source as Record<string, unknown>}
}

async function get_max_position(): Promise<number> {
    let result = await client.search({
        index,
        size: 0,
        body: {
            aggs: {
                max_position: {max: {field: "position"}},
            },
        },
    })

    let aggs = result.aggregations as Record<string, {value: number | null}>
    return aggs?.max_position?.value || 0
}

router.get("/", async (_req: Request, res: Response) => {
    let result = await client.search({
        index,
        body: {
            query: {match_all: {}},
            sort: [{position: {order: "asc", unmapped_type: "long"}}],
        },
        size: 1000,
    })

    let links = result.hits.hits.map(hit_to_link)
    res.json(links)
})

router.post("/", auth_middleware, async (req: AuthRequest, res: Response) => {
    let body = req.body

    if (!body.url) {
        throw new ApiError(400, "url is required")
    }

    let max_position = await get_max_position()
    let now = new Date().toISOString()
    let doc = {
        ...body,
        position: max_position + 1,
        created_at: now,
        updated_at: now,
    }

    let result = await client.index({
        index,
        body: doc,
        refresh: true,
    })

    let link = {id: result._id, ...doc}
    res.status(201).json(link)
})

router.put("/:id", auth_middleware, async (req: MyAuthRequest, res: Response) => {
    let {id} = req.params
    let body = req.body

    let now = new Date().toISOString()
    let doc = {...body, updated_at: now}

    await client.update({
        index,
        id,
        body: {doc},
        refresh: true,
    })

    let link = {id, ...doc}
    res.json(link)
})

router.delete("/:id", auth_middleware, async (req: MyAuthRequest, res: Response) => {
    let {id} = req.params

    await client.delete({
        index,
        id,
        refresh: true,
    })

    let response = {deleted: true}
    res.json(response)
})

export default router
