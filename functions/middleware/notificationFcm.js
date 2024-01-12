const admin = require("firebase-admin");
const db = admin.firestore();
const { getFsBoolDocs } = require("../models/firestoreModel");
const collectionName = "fcmTokens";


exports.announcementNotification = async (req,createdAnnouncement) => {
  try {
    const postData = {
      title : createdAnnouncement.title,
      body : createdAnnouncement.body,
      url: "/information",
    }
    const fcmList = [];
    
    const key = "isDisabled";
    const bool = false;
    const docFcmList = await getFsBoolDocs(collectionName,key,bool);
    docFcmList.forEach((doc) => {
      fcmList.push(doc.id);
      });
      
    const messages = fcmList.map((token) => ({
      token,
      postData,
    }));

    admin
      .messaging()
      .sendEach(messages)
      .then((response) => {})
      .catch((error) => {
        console.log("error", error);
      });

      const detailLog = {
        collectionName,
        docId: !(fcmList.length === 0) ? fcmList : null,
        actionName: "notification",
        nextData: postData ? postData : null,
      };
      req.detailLogs = [...req.detailLogs, detailLog];

  } catch (error) {
    console.log("error", error);
    const detailLog = {
      collectionName,
      docId: null,
      actionName: "notification",
      error: error ? JSON.stringify(error) : "No errors",
      nextData: null,
    };
    req.detailLogs = [...req.detailLogs, detailLog];
  } 
};