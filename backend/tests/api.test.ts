import {describe, test, before, after} from "node:test"
import assert from "node:assert/strict"
import request from "supertest"
import {create_app} from "../src/app.js"
import {client, init_indices} from "../src/elastic/client.js"
import {seed_admin} from "../src/seed.js"

let app = create_app()

async function login(): Promise<string> {
    let res = await request(app)
        .post("/api/auth/login")
        .send({username: "admin", password: "admin123"})
    return res.body.token
}

before(async () => {
    await init_indices()
    await seed_admin()
})

after(async () => {
    await client.deleteByQuery({
        index: "links",
        body: {query: {match_all: {}}},
        refresh: true,
    })
})

describe("POST /api/auth/login", () => {
    test("login with valid credentials", async () => {
        let res = await request(app)
            .post("/api/auth/login")
            .send({username: "admin", password: "admin123"})

        assert.equal(res.status, 200)
        assert.equal(typeof res.body.token, "string")
        assert.ok(res.body.token.length > 0)
    })

    test("login with wrong password", async () => {
        let res = await request(app)
            .post("/api/auth/login")
            .send({username: "admin", password: "wrong"})

        assert.equal(res.status, 401)
        assert.deepEqual(res.body, {error: "Invalid credentials"})
    })

    test("login with missing fields", async () => {
        let res = await request(app)
            .post("/api/auth/login")
            .send({})

        assert.equal(res.status, 400)
        assert.deepEqual(res.body, {error: "Username and password required"})
    })
})

describe("GET /api/links", () => {
    test("returns array without auth", async () => {
        let res = await request(app).get("/api/links")
        assert.equal(res.status, 200)
        assert.ok(Array.isArray(res.body))
    })
})

describe("POST /api/links", () => {
    test("rejects without auth token", async () => {
        let res = await request(app)
            .post("/api/links")
            .send({url: "https://example.com"})

        assert.equal(res.status, 401)
    })
})

describe("PUT /api/links/:id", () => {
    test("rejects without auth token", async () => {
        let res = await request(app)
            .put("/api/links/some-id")
            .send({url: "https://updated.com"})

        assert.equal(res.status, 401)
    })
})

describe("DELETE /api/links/:id", () => {
    test("rejects without auth token", async () => {
        let res = await request(app)
            .delete("/api/links/some-id")

        assert.equal(res.status, 401)
    })
})

describe("Links CRUD - authenticated", () => {
    test("create link", async () => {
        let token = await login()
        let res = await request(app)
            .post("/api/links")
            .set("Authorization", "Bearer " + token)
            .send({url: "https://create-test.com", title: "Create Test"})

        assert.equal(res.status, 201)
        assert.ok(res.body.id)
        assert.equal(res.body.url, "https://create-test.com")
        assert.equal(res.body.title, "Create Test")
        assert.ok(res.body.position)
        assert.ok(res.body.created_at)
        assert.ok(res.body.updated_at)
    })

    test("create link without url returns 400", async () => {
        let token = await login()
        let res = await request(app)
            .post("/api/links")
            .set("Authorization", "Bearer " + token)
            .send({title: "No URL"})

        assert.equal(res.status, 400)
        assert.deepEqual(res.body, {error: "url is required"})
    })

    test("update link", async () => {
        let token = await login()

        let create_res = await request(app)
            .post("/api/links")
            .set("Authorization", "Bearer " + token)
            .send({url: "https://update-test.com", title: "Before Update"})

        let id = create_res.body.id

        let update_res = await request(app)
            .put("/api/links/" + id)
            .set("Authorization", "Bearer " + token)
            .send({title: "After Update"})

        assert.equal(update_res.status, 200)
        assert.equal(update_res.body.id, id)
        assert.equal(update_res.body.title, "After Update")
        assert.ok(update_res.body.updated_at)
    })

    test("delete link", async () => {
        let token = await login()

        let create_res = await request(app)
            .post("/api/links")
            .set("Authorization", "Bearer " + token)
            .send({url: "https://delete-test.com", title: "To Delete"})

        let id = create_res.body.id

        let delete_res = await request(app)
            .delete("/api/links/" + id)
            .set("Authorization", "Bearer " + token)

        assert.equal(delete_res.status, 200)
        assert.deepEqual(delete_res.body, {deleted: true})
    })

    test("full CRUD flow", async () => {
        let token = await login()

        let create_res = await request(app)
            .post("/api/links")
            .set("Authorization", "Bearer " + token)
            .send({url: "https://crud-flow.com", title: "CRUD Flow"})

        assert.equal(create_res.status, 201)
        let id = create_res.body.id

        let list_res = await request(app).get("/api/links")
        let found = list_res.body.find((l: { id: string }) => l.id === id)
        assert.ok(found)
        assert.equal(found.title, "CRUD Flow")

        await request(app)
            .put("/api/links/" + id)
            .set("Authorization", "Bearer " + token)
            .send({title: "CRUD Updated"})

        let list_after_update = await request(app).get("/api/links")
        let updated = list_after_update.body.find((l: { id: string }) => l.id === id)
        assert.equal(updated.title, "CRUD Updated")

        await request(app)
            .delete("/api/links/" + id)
            .set("Authorization", "Bearer " + token)

        let list_after_delete = await request(app).get("/api/links")
        let deleted = list_after_delete.body.find((l: { id: string }) => l.id === id)
        assert.equal(deleted, undefined)
    })
})
