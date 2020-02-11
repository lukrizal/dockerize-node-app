import mongoose from "../src/config/db";
import { Org, OrgDocument } from "../src/models/Org";

describe("Models > Org ", () => {
  beforeAll((done) => {
    mongoose.connection.on("connected", () => {
      mongoose.connection.db.dropCollection(Org.collection.collectionName, () => {
        done();
      });
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it("crud", async () => {
    const orgName = "xendit";
    const props = {
      name: orgName
    } as OrgDocument;
    const model = new Org(props);
    await model.save();

    expect(model).toBeTruthy();
    expect(model).toHaveProperty("name", orgName);

    let total = await Org.countDocuments().exec();
    expect(total).toBe(1);

    expect(model.comments).toHaveLength(0);
    await model.insertComment("test");
    expect(model.comments).toHaveLength(1);

    let comments = await model.getAllComments();
    expect(comments).toHaveLength(1);

    await model.deleteAllComments();
    comments = await model.getAllComments();
    expect(comments).toHaveLength(0);
    expect(model.comments).toHaveLength(1);

    await model.remove();
    total = await Org.countDocuments().exec();
    expect(total).toBe(0);

    await Org.findOneOrCreate({ name: orgName });
    total = await Org.countDocuments().exec();
    expect(total).toBe(1);

    await Org.findOneOrCreate({ name: orgName });
    total = await Org.countDocuments().exec();
    expect(total).toBe(1);
  });
});