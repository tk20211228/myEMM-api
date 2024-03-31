const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const { google } = require("googleapis");
const androidManagement = google.androidmanagement("v1");
const admin = require("firebase-admin");
const db = admin.firestore();
const { generateAuthClient } = require("./emmUtils");
const { generateDetailLog } = require('../../utils/logUtils');

const generateResponse = async ({ authClient, enterpriseId, policyName }) => {
  google.options({ auth: authClient });
  const res = await androidManagement.enterprises.policies.patch({
    name: `enterprises/${enterpriseId}/policies/${policyName}`,
    requestBody: {
      // cameraDisabled: false,
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
  // console.log("policyName", `enterprises/${enterpriseId}/policies/${policyName}`);
  // https://developers.google.com/android/management/reference/rest/v1/enterprises.enrollmentTokens?hl=ja
  const res = await androidManagement.enterprises.enrollmentTokens.create({
    parent: `enterprises/${enterpriseId}`,
    requestBody: {
      policyName: `enterprises/${enterpriseId}/policies/${policyName}`,
      oneTimeOnly: false,
      allowPersonalUsage: "ALLOW_PERSONAL_USAGE_UNSPECIFIED",
      qrCode: "123",
    },
  });
  return res;
};

const recordPolicyCreate = async ({
  docId,
  enterpriseId,
  policyName,
  response,
}) => {
  const data = {
    docId,
    updatedAt: Timestamp.now(),
    policy: response.data.name,
  };
  // console.log(data);
  const docRef = db
    .collection("polices")
    .doc(enterpriseId)
    .collection("policyList")
    .doc(policyName);

  // const docSnapshot = await docRef.get();
  // const prevData = docSnapshot.data();
  const prevData = null;

  await docRef.set(response.data);
  const nextData = data;
  return { nextData, prevData };
};

exports.policyCreate = async (req, res, next) => {
  try {
    const { uid: docId } = req.body;
    let { enterpriseId } = req.body;
    // enterprisesIdからID部分を抽出　ex)'enterprises/LC038hydn8' ⇒　'LC038hydn8'
    enterpriseId = enterpriseId.split("/")[1];
    const policyName = "policy1";
    const authClient = await generateAuthClient();
    const response = await generateResponse({
      authClient,
      enterpriseId,
      policyName,
    });
    // console.log("response",response);
    const EnrollmentToken = await generateEnrollmentTokens({
      authClient,
      enterpriseId,
      policyName,
    });

    // レスポンスの qrCode フィールドをオブジェクトに変換
    let qrCodeObj = JSON.parse(EnrollmentToken.data.qrCode);

    // 新たなプロパティを追加
    qrCodeObj[
      "android.app.extra.PROVISIONING_LEAVE_ALL_SYSTEM_APPS_ENABLED"
    ] = true;

    // オブジェクトを文字列に戻す（文字列化）
    EnrollmentToken.data.qrCode = JSON.stringify(qrCodeObj);

    // console.log("EnrollmentToken.data", EnrollmentToken.data);
    // res.json(EnrollmentToken.data);
    res.json({ success: true, data: EnrollmentToken.data, message: "ポリシーの作成に成功しました。" });

    const { nextData, prevData } = await recordPolicyCreate({
      docId,
      enterpriseId,
      policyName,
      response,
    });
    const actionName = "policyCreate";
    const collectionName = "users";
    const detailLog = generateDetailLog({ actionName , collectionName , docId , nextData , prevData });
    req.detailLogs = [detailLog];
  } catch (error) {
    res.status(500).json({ success: false, data: error, message: "内部サーバーエラーが発生しました。" });
    req.detailLogs = [generateDetailLog({ error })];
    // console.log(error)
  } finally {
    next();
  }
};
