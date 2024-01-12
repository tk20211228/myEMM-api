const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const { google } = require("googleapis");
const androidManagement = google.androidmanagement("v1");
const admin = require("firebase-admin");
const db = admin.firestore();
const { generateAuthClient } = require("./emmUtils");

const generateResponse = async (authClient) => {
  google.options({ auth: authClient });
  const res = await androidManagement.signupUrls.create({
    callbackUrl: process.env.GOOGLE_EMM_SIGNUP_CALLBACK_URL,
    projectId: process.env.GOOGLE_EMM_PROJECT_ID,
  });
  return res;
};

const recordSignupUrlsName = async ({ uid, response }) => {
  const data = {
    updatedAt: Timestamp.now(),
    signupUrlName: response.data.name,
  };
  // console.log(data);
  const docRef = db.collection("users").doc(uid);
  const docSnapshot = await docRef.get();

  await docRef.update(data);
  const nextData = data;
  const prevData = docSnapshot.data();
  return { nextData, prevData };
};

const generateDetailLog = ({ uid, response, nextData, prevData, error }) => {
  return {
    collectionName: "users",
    docId: uid,
    actionName: "signupUrlsCreate",
    nextData,
    prevData,
    signupUrlName: response ? response.data.name : null,
    error,
  };
};

module.exports = async (req, res, next) => {
  try {
    const uid = req.body.uid;
    const authClient = await generateAuthClient();
    const response = await generateResponse(authClient);
    const { nextData, prevData } = await recordSignupUrlsName({
      uid,
      response,
    });
    req.detailLogs = [generateDetailLog({ uid, response, nextData, prevData })];
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error });
    req.detailLogs = [generateDetailLog({ error })];
  } finally {
    next();
  }
};
