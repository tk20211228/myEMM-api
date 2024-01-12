// models/announcementModel.js
const admin = require("firebase-admin");
const db = admin.firestore();

exports.addDocFirestore = async (collectionName,data) => {
  const docRef = await db.collection(collectionName).add(data);
  const docSnapshot = await docRef.get(); 
  return {
    docId: docSnapshot.id,
    ...docSnapshot.data(),
  };
};

exports.updateDocFirestore = async (collectionName,docId, data) => {
  return await db.collection(collectionName).doc(docId).update(data);
};

exports.deleteDocFirestore = async (collectionName,docId) => {
  return await db.collection(collectionName).doc(docId).delete();
};

exports.getFsBoolDocs = async (collectionName,key,bool) => {
  return await db.collection(collectionName).where(key, "==", bool).get();
};