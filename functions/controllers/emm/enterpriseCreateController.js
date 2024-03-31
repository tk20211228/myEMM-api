const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const { google } = require("googleapis");
const androidManagement = google.androidmanagement("v1");
const admin = require("firebase-admin");
const db = admin.firestore();
const { generateAuthClient } = require("./emmUtils");
const { generateDetailLog } = require('../../utils/logUtils');
const { domain ,googleEmmProjectId} = require('../../config');


const logUrl =`https://${domain}/resized_image512_1.3_2023_0421_100844.png`;
const axios = require("axios");
const crypto = require("crypto");

async function calculateHash(logUrl) {
  const response = await axios.get(logUrl, { responseType: "arraybuffer" });
  const hash = crypto.createHash("sha256");
  hash.update(response.data);
  return hash.digest("base64");
}

const generateResponse = async ({
  authClient,
  enterpriseToken,
  signupUrlName,
  enterpriseDisplayName,
}) => {
  const hash = await calculateHash(logUrl);

  google.options({ auth: authClient });
  const res = await androidManagement.enterprises.create({
    // agreementAccepted: true,
    enterpriseToken,
    projectId: googleEmmProjectId,
    signupUrlName,
    // Request body metadata
    //　https://developers.google.com/android/management/reference/rest/v1/enterprises?hl=ja#Enterprise
    requestBody: {
      // request body parameters
      // {
      //   "contactInfo": {},
      //   "enabledNotificationTypes": [],
      enterpriseDisplayName,
      logo: {
        url: logUrl,
        sha256Hash: hash,
      },
      //   "name": "my_name",
      primaryColor: (255 << 16) | (243 << 8) | 224,
      //   "pubsubTopic": "my_pubsubTopic",
      //   "signinDetails": [],
      //   "termsAndConditions": []
      // }
    },
  });
  console.log("enterprises.create");
  console.log(res);
  return res;
};

const recordEnterpriseID = async ({ docId, response }) => {
  const data = {
    updatedAt: Timestamp.now(),
    enterpriseId: response.data.name,
  };
  // console.log(data);
  const docRef = db.collection("users").doc(docId);
  const docSnapshot = await docRef.get();

  await docRef.update(data);
  const nextData = data;
  const prevData = docSnapshot.data();
  return { nextData, prevData };
};

exports.enterpriseCreate = async (req, res, next) => {
  try {
    const {  uid: docId, enterpriseToken, signupUrlName, enterpriseDisplayName } =
      req.body;
    const authClient = await generateAuthClient();
    const response = await generateResponse({
      authClient,
      enterpriseToken,
      signupUrlName,
      enterpriseDisplayName,
    });
    const { nextData, prevData } = await recordEnterpriseID({
      docId,
      response,
    });
    const actionName = "enterpriseCreate";
    const collectionName = "users";
    const detailLog = generateDetailLog({ actionName , collectionName , docId , nextData , prevData });
    req.detailLogs = [detailLog];
    res.json({ success: true, data: response.data, message: "" });
  } catch (error) {
    res.status(500).json({ success: false, data: error, message: "内部サーバーエラーが発生しました。" });
    console.log(error.message);
    req.detailLogs = [generateDetailLog({ error })];
  } finally {
    next();
  }
};
