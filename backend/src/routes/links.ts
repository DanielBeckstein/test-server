 import { Router, Response } from "express"
import { client } from "../elastic/client"
import { auth_middleware, AuthRequest } from "../middleware/jwt"
import { ApiError } from "../middleware/error"
import { MyAuthRequest } from "./types"

let router = Router()

router.get("/", async (_req: AuthRequest, res: Response) => {
  let result = await client.search({
    index: "links",
    body: {
      query: { match_all: {} },
      sort: [{ position: { order: "asc", unmapped_type: "long" } }],
    },
    size: 1000,
  })

  let links = result.hits.hits.map((hit) => {
    return { id: hit._id, ...hit._source as Record<string, unknown> }
  })

  res.json(links)
})

router.post("/", auth_middleware, async (req: AuthRequest, res: Response) => {
  let body = req.body

  if (!body.url) {
    throw new ApiError(400, "url is required")
  }

  let max_result = await client.search({
    index: "links",
    body: {
      query: { match_all: {} },
      sort: [{ position: { order: "desc", unmapped_type: "long" } }],
    },
    size: 1,
  })

  let max_position = 0
  if (max_result.hits.hits.length > 0) {
    let source = max_result.hits.hits[0]._source as Record<string, unknown>
    max_position = (source.position as number) || 0
  }

  let now = new Date().toISOString()
  let doc = {
    ...body,
    position: max_position + 1,
    created_at: now,
    updated_at: now,
  }

  let result = await client.index({
    index: "links",
    body: doc,
    refresh: true,
  })

  res.status(201).json({ id: result._id, ...doc })
})

router.put("/:id", auth_middleware, async (req: MyAuthRequest, res: Response) => {
  let { id } = req.params
  let body = req.body

  let now = new Date().toISOString()
  let doc = { ...body, updated_at: now }

  await client.update({
    index: "links",
    id,
    body: { doc },
    refresh: true,
  })

  res.json({ id, ...doc })
})

router.delete("/:id", auth_middleware, async (req: MyAuthRequest, res: Response) => {
  let { id } = req.params

  await client.delete({
    index: "links",
    id,
    refresh: true,
  })

  res.json({ deleted: true })
})

export default router
