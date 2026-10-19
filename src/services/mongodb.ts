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
  Unlock = "unlocks",
}
export const migrate = async () => {
  // CName.User
  const userCollection = db.collection<UserAccount>(CName.User);
  await userCollection.createIndex({ email: 1 }, { unique: true });
  await userCollection.createIndex({ uid: 1 }, { unique: true, sparse: true });
  // Powers the Customers screen: the sign-up windows are createdAt ranges and
  // the list itself sorts newest-first.
  await userCollection.createIndex({ createdAt: -1 });

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

  // CName.Unlock
  const unlockCollection = db.collection(CName.Unlock);
  await unlockCollection.createIndex({ user: 1, property: 1, unit: 1 }, { unique: true });
  await unlockCollection.createIndex({ user: 1, lastUnlockedAt: -1 });
  await unlockCollection.createIndex({ property: 1 });
};

export default db;