import {describe, test, before, after} from "node:test"
import assert from "node:assert/strict"
import request from "supertest"
import {create_app} from "../src/app.js"
import {client, init_indices} from "../src/elastic/client.js"
import {seed_admin} from "../src/middleware/auth/seed_admin.js"

let app = create_app()

let admin = {
    username: "admin",
    password: "admin123",
}

async function login(): Promise<string> {
    let res = await request(app)
        .post("/api/auth/login")
        .send(admin)
    return res.body.token
}

let token: string


function request_as_admin() {
    return request.agent(app).use((req) => req.set("Authorization", "Bearer " + token))
}

before(async () => {
    await init_indices()
    await seed_admin()
    token = await login()
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
            .send(admin)

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

describe("Protected routes reject without auth", () => {
    let cases = [
        {method: "post" as const, path: "/api/links", body: {url: "https://example.com"}},
        {method: "put" as const, path: "/api/links/some-id", body: {url: "https://updated.com"}},
        {method: "delete" as const, path: "/api/links/some-id"},
    ]
    for (let c of cases) {
        test(c.method.toUpperCase() + " " + c.path, async () => {
            let res = await request(app)[c.method](c.path).send(c.body || {})
            assert.equal(res.status, 401)
        })
    }
})

describe("Links CRUD - authenticated", () => {
    test("create link", async () => {
        let res = await request_as_admin()
            .post("/api/links")
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
        let res = await request_as_admin()
            .post("/api/links")
            .send({title: "No URL"})

        assert.equal(res.status, 400)
        assert.deepEqual(res.body, {error: "url is required"})
    })

    test("update link", async () => {
        let create_res = await request_as_admin()
            .post("/api/links")
            .send({url: "https://update-test.com", title: "Before Update"})

        let id = create_res.body.id

        let update_res = await request_as_admin()
            .put("/api/links/" + id)
            .send({title: "After Update"})

        assert.equal(update_res.status, 200)
        assert.equal(update_res.body.id, id)
        assert.equal(update_res.body.title, "After Update")
        assert.ok(update_res.body.updated_at)
    })

    test("delete link", async () => {
        let create_res = await request_as_admin()
            .post("/api/links")
            .send({url: "https://delete-test.com", title: "To Delete"})

        let id = create_res.body.id

        let delete_res = await request_as_admin()
            .delete("/api/links/" + id)

        assert.equal(delete_res.status, 200)
        assert.deepEqual(delete_res.body, {deleted: true})
    })

    test("full CRUD flow", async () => {
        let create_res = await request_as_admin()
            .post("/api/links")
            .send({url: "https://crud-flow.com", title: "CRUD Flow"})

        assert.equal(create_res.status, 201)
        let id = create_res.body.id

        let list_res = await request(app).get("/api/links")
        let found = list_res.body.find((l: { id: string }) => l.id === id)
        assert.ok(found)
        assert.equal(found.title, "CRUD Flow")

        await request_as_admin()
            .put("/api/links/" + id)
            .send({title: "CRUD Updated"})

        let list_after_update = await request(app).get("/api/links")
        let updated = list_after_update.body.find((l: { id: string }) => l.id === id)
        assert.equal(updated.title, "CRUD Updated")

        await request_as_admin()
            .delete("/api/links/" + id)

        let list_after_delete = await request(app).get("/api/links")
        let deleted = list_after_delete.body.find((l: { id: string }) => l.id === id)
        assert.equal(deleted, undefined)
    })
})
