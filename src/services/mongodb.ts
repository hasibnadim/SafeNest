import { MongoClient } from "mongodb";
import { SessionData, UserAccount } from "./auth/interface";
import { PropertyDocument } from "./properties";

const uri = process.env.MONGODB_URI as string;
const dbName = process.env.MONGODB_DB as string;
const dbClient = new MongoClient(uri);
const db = dbClient.db(dbName);
export enum CName {
  User = "users",
  Session = "sessions",
  Property = "properties",
}
export const migrate = async () => {
  // CName.User
  const userCollection = db.collection<UserAccount>(CName.User);
  await userCollection.createIndex({ email: 1 }, { unique: true });
  await userCollection.createIndex({ uid: 1 }, { unique: true, sparse: true });

  // CName.Session
  await db.collection<SessionData>(CName.Session).createIndex({ userId: 1 }, { unique: false });

  // CName.Property
  // The slug is the document's primary key and the public URL segment.
  const propertyCollection = db.collection<PropertyDocument>(CName.Property);
  await propertyCollection.createIndex({ id: 1 }, { unique: true });
  // Powers the dashboard's "my properties" list.
  await propertyCollection.createIndex({ ownerUid: 1, updatedAt: -1 });
  // Powers the public listing page's sort and verification filter.
  await propertyCollection.createIndex({ listedAt: -1 });
  await propertyCollection.createIndex({ type: 1 });
  await propertyCollection.createIndex({ verified: 1 });
  // For unit code lookups within a property
  await propertyCollection.createIndex({ "units.code": 1 });

 
};

export default db;