const admin = require("firebase-admin");
const { getFsBoolDocs } = require("../models/firestoreModel");
const collectionName = "fcmTokens";


exports.announcementNotification = async (req,createdAnnouncement) => {
  try {
    const data = {
      title : createdAnnouncement.title,
      body : createdAnnouncement.body,
      url: "/information",
      uid : createdAnnouncement.uid,
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
      data,
    }));

    // console.log(messages);

    admin
      .messaging()
      .sendEach(messages)
      .then((response) => {
        // console.log(response)
      })
      .catch((error) => {
        console.log("error", error);
      });

      const detailLog = {
        collectionName,
        docId: !(fcmList.length === 0) ? fcmList : null,
        actionName: "notification",
        nextData: postData ? postData : null,
        uid : createdAnnouncement.uid,
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