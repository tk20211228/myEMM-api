const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const { google } = require("googleapis");
const androidManagement = google.androidmanagement("v1");
const admin = require("firebase-admin");
const db = admin.firestore();
const { generateAuthClient } = require("./emmUtils");

const generateResponse = async ({ authClient, enterpriseId, policyName }) => {
  google.options({ auth: authClient });
  const res = await androidManagement.enterprises.policies.patch({
    name: `${enterpriseId}/policies/${policyName}`,
    requestBody: {
      cameraDisabled: false,
      bluetoothDisabled: true,
      playStoreMode: "BLACKLIST",
      modifyAccountsDisabled: false,
      mountPhysicalMediaDisabled: true,
      locationMode: "LOCATION_ENFORCED",
      advancedSecurityOverrides: {
        developerSettings: "DEVELOPER_SETTINGS_ALLOWED",
      },
    },
  });
  return res;
};

const generateEnrollmentTokens = async ({
  authClient,
  enterpriseId,
  policyName,
}) => {
  google.options({ auth: authClient });
  console.log("policyName", `${enterpriseId}/policies/${policyName}`);
  // https://developers.google.com/android/management/reference/rest/v1/enterprises.enrollmentTokens?hl=ja
  const res = await androidManagement.enterprises.enrollmentTokens.create({
    parent: enterpriseId,
    requestBody: {
      policyName: `${enterpriseId}/policies/${policyName}`,
      oneTimeOnly: false,
      allowPersonalUsage: "ALLOW_PERSONAL_USAGE_UNSPECIFIED",
      qrCode: "123",
    },
  });

  return res;
};

const recordPolicyCreate = async ({
  uid,
  enterpriseId,
  policyName,
  response,
}) => {
  const data = {
    uid,
    updatedAt: Timestamp.now(),
    policy: response.data.name,
  };
  // enterprisesIdからID部分を抽出
  const docId = enterpriseId.split("/")[1];
  // console.log(data);
  const docRef = db
    .collection("polices")
    .doc(docId)
    .collection("policyList")
    .doc(policyName);
  // const docSnapshot = await docRef.get();

  await docRef.set(response.data);

  const nextData = data;
  // const prevData = docSnapshot.data();
  const prevData = null;
  return { nextData, prevData };
};

const generateDetailLog = ({ uid, response, nextData, prevData, error }) => {
  return {
    collectionName: "users",
    docId: uid,
    actionName: "policyCreate",
    nextData,
    prevData,
    error,
  };
};

exports.policyCreate = async (req, res, next) => {
  try {
    const { uid, enterpriseId } = req.body;
    console.log(req.body);
    const policyName = "policy1";
    const authClient = await generateAuthClient();
    const response = await generateResponse({
      authClient,
      enterpriseId,
      policyName,
    });
    const response1 = await generateEnrollmentTokens({
      authClient,
      enterpriseId,
      policyName,
    });

    // レスポンスの qrCode フィールドをオブジェクトに変換（パース）
    let qrCodeObj = JSON.parse(response1.data.qrCode);

    // 新たなプロパティを追加
    qrCodeObj[
      "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED"
    ] = true;

    // オブジェクトを文字列に戻す（文字列化）
    response1.data.qrCode = JSON.stringify(qrCodeObj);

    console.log("response1.data", response1.data);

    res.json(response1.data);
    const { nextData, prevData } = await recordPolicyCreate({
      uid,
      enterpriseId,
      policyName,
      response,
    });

    req.detailLogs = [generateDetailLog({ uid, response, nextData, prevData })];
  } catch (error) {
    res.status(500).json({ error });
    req.detailLogs = [generateDetailLog({ error })];
  } finally {
    next();
  }
};
