import mongoose from "mongoose";
import _ from "lodash";
import { catchWrapper as cw } from "../util/promise";

export type OrgComment = mongoose.Document & {
  comment: string;
  deleted: boolean;
};

export interface OrgDocument extends mongoose.Document {
  name: string;
  comments: OrgComment[];

  insertComment(s: string): Promise<OrgModel>;
  getAllComments(): Promise<OrgComment[]>;
  deleteAllComments(f?: boolean): Promise<OrgModel>;
};

export interface OrgModel extends mongoose.Model<OrgDocument> {
  findOneOrCreate(c: Record<string, any>): Promise<OrgDocument>;
}

const commentSchema = new mongoose.Schema({
  comment: String,
  deleted: Boolean
});

const orgSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  comments: [commentSchema]
}, { timestamps: true });

// findOneOrCreate - create if does not exists
orgSchema.statics.findOneOrCreate = async function (condition: object) {
  const model = await this.findOne(condition).exec()
    .catch(cw("findOne query error"));
  if (model) return model; // return if exist

  // create if not
  return this.create(condition).catch(cw("create query error"));
};

orgSchema.methods.insertComment = async function (comment: string) {
  this.comments = this.comments || [] as OrgComment[];
  this.comments.push({ deleted: false, comment });
  return this.save().catch(cw("save query error"));
};

orgSchema.methods.getAllComments = async function () {
  this.comments = this.comments || [] as OrgComment[];
  return _.filter(this.comments, ["deleted", false]);
};

orgSchema.methods.deleteAllComments = async function (forceDelete: boolean = false) {
  this.comments = this.comments || [] as OrgComment[];
  if (forceDelete) this.comments = [];
  else {
    this.comments = this.comments.map((x: OrgComment) => _.set(x, "deleted", true));
  }
  return this.save().catch(cw("save query error"));
};

export const Org: OrgModel = mongoose.model<OrgDocument, OrgModel>("Org", orgSchema);
