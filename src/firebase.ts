/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

// Active Firebase project credentials provided by the user
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCMHkWjf1ovQgW51jd3xBpknypnruHA2U0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "nems-bakery.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "nems-bakery",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "nems-bakery.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "86006922843",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:86006922843:web:1d859b0878a49631e5097e",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-46VV931D02"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Validation check to detect connection to Firestore
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Please check your Firebase configuration or internet connection:", error);
    }
  }
}
testConnection();

// Structured Error Handling according to the Firebase integration skill's strict requirements
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo?: {
    userId?: string | null;
    email?: string | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
