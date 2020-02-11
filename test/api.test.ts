import _ from "lodash";
import request from "supertest";
import app from "../src/app";
import { Org } from "../src/models/Org";

describe("API >", () => {
  jest.setTimeout(20000); // 20 seconds before timeout, for the 3rd party

  const orgName = "xendit";

  beforeAll((done) => {
    app.locals.dbCon.on("connected", () => {
      app.locals.dbCon.db.dropCollection(Org.collection.collectionName, () => {
        done();
      });
    });
  });

  afterAll(async () => {
    await app.locals.dbCon.close();
  });

  it("should return 200 OK when GET /", () => {
    return request(app).get("/").expect(200);
  });

  describe("POST /api/orgs/:org/comments", () => {
    it("should return 200 OK if request is valid", async () => {
      const url = `/api/orgs/${orgName}/comments`;
      const res = await request(app).post(url)
        .send({ comment: "abc" })
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res).toHaveProperty("body");
      expect(res.body).toHaveProperty("data.item.name", orgName);
      expect(res.body).toHaveProperty("data.item.comments");
      const comments = _.get(res.body, "data.item.comments", []);
      expect(comments).toHaveLength(1);
      expect(comments[0]).toHaveProperty("comment", "abc");
      const total = await Org.countDocuments().exec();
      expect(total).toBe(1);
    });

    it("should return 400/422 if request is not valid", async () => {
      let url = "/api/orgs/non-existing-org/comments";
      let res = await request(app).post(url)
        .send({ comment: "abc" })
        .expect("Content-Type", /json/)
        .expect(400);
      expect(res).toHaveProperty("body");
      expect(res).toHaveProperty("body.error", true);

      url = `/api/orgs/${orgName}/comments`;
      res = await request(app).post(url)
        .expect("Content-Type", /json/)
        .expect(422);
      expect(res).toHaveProperty("body");
      expect(res).toHaveProperty("body.error", true);
    });
  });

  describe("GET /api/orgs/:org/comments", () => {
    it("should return 200 OK if request is valid", async () => {
      const url = `/api/orgs/${orgName}/comments`;
      const res = await request(app).get(url)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res).toHaveProperty("body");
      expect(res.body).toHaveProperty("data.items");
      const comments = _.get(res.body, "data.items", []);
      expect(comments).toHaveLength(1);
      expect(comments[0]).toHaveProperty("comment", "abc");
    });
    it("should return 400/422 if request is not valid", async () => {
      const url = "/api/orgs/non-existing-org/comments";
      const res = await request(app).get(url)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(res).toHaveProperty("body");
      expect(res).toHaveProperty("body.error", true);
    });
  });

  describe("DELETE /api/orgs/:org/comments", () => {
    it("should return 200 OK if request is valid", async () => {
      const url = `/api/orgs/${orgName}/comments`;
      const res = await request(app).delete(url)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res).toHaveProperty("body");
      expect(res.body).toHaveProperty("data.items");
      const comments = _.get(res.body, "data.items");
      expect(comments).toHaveLength(0);
    });
    it("should return 400/422 if request is not valid", async () => {
      const url = "/api/orgs/non-existing-org/comments";
      const res = await request(app).delete(url)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(res).toHaveProperty("body");
      expect(res).toHaveProperty("body.error", true);
    });
  });

  describe("GET /api/orgs/:org/members", () => {
    it("should return 200 OK if request is valid", async () => {
      const url = `/api/orgs/${orgName}/members`;
      const res = await request(app).get(url)
        .expect("Content-Type", /json/)
        .expect(200);

      expect(res).toHaveProperty("body");
      expect(res.body).toHaveProperty("data.items");
      const members = _.get(res.body, "data.items");
      expect(members).toBeInstanceOf(Array);
      expect(members[0]).toHaveProperty("login");
      expect(members[0]).toHaveProperty("avatarUrl");
      expect(members[0]).toHaveProperty("countFollowers");
      expect(members[0]).toHaveProperty("countFollowing");
    });
    it("should return 400/422 if request is not valid", async () => {
      const url = "/api/orgs/non-existing-org/members";
      const res = await request(app).get(url)
        .expect("Content-Type", /json/)
        .expect(400);
      expect(res).toHaveProperty("body");
      expect(res).toHaveProperty("body.error", true);
    });
  });
});
