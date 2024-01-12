const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const { google } = require("googleapis");
const androidManagement = google.androidmanagement("v1");
const admin = require("firebase-admin");
const db = admin.firestore();
const { generateAuthClient } = require("../emmUtils");

const generateResponse = async ({ authClient, enterpriseId }) => {
  google.options({ auth: authClient });
  const res = await androidManagement.enterprises.devices.list({
    // The requested page size. The actual page size may be fixed to a min or max value.
    // pageSize: "placeholder-value",
    // A token identifying a page of results returned by the server.
    // pageToken: "placeholder-value",
    // The name of the enterprise in the form enterprises/{enterpriseId\}.
    parent: enterpriseId,
  });
  // console.log(res.data);
  return res;
};

const recordDeviceList = async (req, { uid, enterpriseId, response }) => {
  // enterprisesIdからID部分を抽出
  const docId = enterpriseId.split("/")[1];
  await db
    .collection("devices")
    .doc(docId)
    .set({ uid, updatedAt: Timestamp.now() });
  const devices = response.data.devices;
  if (!req.detailLogs) {
    req.detailLogs = [];
  }
  // console.log("devices", devices);
  for (const device of devices) {
    const deviceName = device.name.split("/devices/")[1];
    console.log("deviceName", deviceName);

    // const data = {
    //   uid,
    //   updatedAt: Timestamp.now(),
    //   deviceName,
    // };
    // console.log(data);
    const docRef = db
      .collection("devices")
      .doc(docId)
      .collection("deviceList")
      .doc(deviceName);
    const docSnapshot = await docRef.get();
    await docRef.set(device);
    // console.log(res);

    const nextData = device;
    const prevData = docSnapshot.data();
    // const prevData = null;
    req.detailLogs.push(generateDetailLog({ uid, nextData, prevData }));
  }
};

const generateDetailLog = ({ uid, nextData, prevData, error }) => {
  return {
    collectionName: "devices",
    docId: uid,
    actionName: "deviceList",
    nextData,
    prevData,
    error,
  };
};

module.exports = async (req, res, next) => {
  try {
    const { uid, enterpriseId } = req.body;
    // console.log(req.body);
    const authClient = await generateAuthClient();
    const response = await generateResponse({
      authClient,
      enterpriseId,
    });

    // console.log("res", response.data.devices);
    // res.json(response.data);
    await recordDeviceList(req, {
      uid,
      enterpriseId,
      response,
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error });
    console.log(error);
    req.detailLogs = [generateDetailLog({ error })];
  } finally {
    next();
  }
};
