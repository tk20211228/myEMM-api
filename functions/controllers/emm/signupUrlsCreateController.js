const { Timestamp } = require("firebase-admin/firestore");
const { google } = require("googleapis");
const androidManagement = google.androidmanagement("v1");
const admin = require("firebase-admin");
const db = admin.firestore();
const { generateAuthClient } = require("./emmUtils");
const { generateDetailLog } = require('../../utils/logUtils');
const { callbackUrl ,googleEmmProjectId} = require('../../config');


const generateResponse = async (authClient) => {
  console.log(callbackUrl ,googleEmmProjectId)
  google.options({ auth: authClient });
  const res = await androidManagement.signupUrls.create({
    callbackUrl,
    projectId: googleEmmProjectId,
  });
  return res;
};

const recordSignupUrlsName = async ({ docId, response }) => {
  const data = {
    updatedAt: Timestamp.now(),
    signupUrlName: response.data.name,
  };
  const docRef = db.collection("users").doc(docId);
  const docSnapshot = await docRef.get();

  await docRef.update(data);
  const nextData = data;
  const prevData = docSnapshot.data();
  return { nextData, prevData };
};

module.exports = async (req, res, next) => {
  try {
    console.log("TEST")
    const docId = req.body.uid;
    const authClient = await generateAuthClient();
    const response = await generateResponse(authClient);
    const { nextData, prevData } = await recordSignupUrlsName({
      docId,
      response,
    });
    const actionName = "signupUrlsCreate";
    const collectionName = "users";
    const detailLog = generateDetailLog({ actionName , collectionName , docId , nextData , prevData });
    req.detailLogs = [detailLog];
    // res.json(response.data);
    console.log("TEST2")
    // res.json(response.data);?

    res.json({ success: true, data: response.data, message: "" });

  } catch (error) {
    // res.status(500).json({ error });
    res.status(500).json({ success: false, data: error, message: "内部サーバーエラーが発生しました。" });

    req.detailLogs = [generateDetailLog({ error })];
    console.log(error)
  } finally {
    next();
  }
};
