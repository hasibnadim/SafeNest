import { ObjectId } from "mongodb";

export interface UserAccount {
  firstName: string;
  lastName: string; 
  uid: string;  // Google account subject (`sub` claim)
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "other" | "";
  photoURL?: string;
  emailVerified?: boolean;
  createdAt: Date;
  lastActivity: Date | null;
  sellerId?:ObjectId;
  systemRole?: "user" | "admin" | "superadmin";
  followers?: ObjectId[]; // Array of User IDs who follow this user
  following?: ObjectId[]; // Array of User IDs this user is following
}

export interface SessionData {
  uid: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  [key: string]: string | number | boolean | null; // Index signature for JWT compatibility
}
