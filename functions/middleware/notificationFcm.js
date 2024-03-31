const admin = require("firebase-admin");
const { getFsBoolDocs } = require("../models/firestoreModel");
const { generateDetailLog } = require('../utils/logUtils');
const collectionName = "fcmTokens";
const actionName = "notification";

exports.announcementNotification = async (req,createdAnnouncement) => {
  try {
    const data = {
      title : createdAnnouncement.title,
      body : createdAnnouncement.body,
      url: "/information",
      // uid : createdAnnouncement.uid,
      author : createdAnnouncement.author,
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

    admin
      .messaging()
      .sendEach(messages)
      .then((response) => {
        // console.log(response)
      })
      .catch((error) => {
        // console.log("error", error);
      });
      
      const detailLog = generateDetailLog({ actionName , collectionName , fcmList , data });
      req.detailLogs = [...req.detailLogs, detailLog];

  } catch (error) {
    console.log("error", error);
    const detailLog = generateDetailLog({ actionName , collectionName , error });
    req.detailLogs = [...req.detailLogs, detailLog];
  } 
};