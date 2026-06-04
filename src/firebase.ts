/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

// Active Firebase project credentials provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyCMHkWjF1ovQgW51jd3xBpknypnrUHA2U0",
  authDomain: "nems-bakery.firebaseapp.com",
  projectId: "nems-bakery",
  storageBucket: "nems-bakery.firebasestorage.app",
  messagingSenderId: "B6006922843",
  appId: "1:86006922843:web:1d859b0878a49631e5097e",
  measurementId: "G-46VV931D02"
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
