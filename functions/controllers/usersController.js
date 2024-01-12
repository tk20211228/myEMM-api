const admin = require("firebase-admin");
const { Timestamp } = require("firebase-admin/firestore");

const db = admin.firestore();
const userModel = require("../models/userModel");

const UAParser = require("ua-parser-js");
function parsedUserAgent(userAgent) {
  const parsedUserAgent = new UAParser(userAgent);
  const result = {
    os: {
      name: parsedUserAgent.getOS().name || null,
      version: parsedUserAgent.getOS().version || null,
    },
    device: {
      vendor: parsedUserAgent.getDevice().vendor || null,
      model: parsedUserAgent.getDevice().model || null,
      type: parsedUserAgent.getDevice().type || null,
    },
    browser: {
      name: parsedUserAgent.getBrowser().name || null,
      version: parsedUserAgent.getBrowser().version || null,
      major: parsedUserAgent.getBrowser().major || null,
    },
    engine: {
      name: parsedUserAgent.getEngine().name || null,
      version: parsedUserAgent.getEngine().version || null,
    },
    ua: parsedUserAgent.getUA() || null,
    cpu: {
      architecture: parsedUserAgent.getCPU().architecture || null,
    },
  };
  return result;
}

exports.recordLogin = async (req, res, next) => {
  try {
    const {
      id,
      pass,
      uid,
      firstName,
      lastName,
      icon,
      fcmToken,
      fcmError,
      isDisabled,
      isDeleted,
    } = req.body;
    const now = Timestamp.now();
    const userAgentInfo = parsedUserAgent(req.headers["user-agent"] || "");
    // console.log("userAgentInfo", userAgentInfo);
    const userRef = db.collection("users").doc(uid);
    const existDoc = await userRef.get();
    const prevDataUser = existDoc.data();
    let actionName;
    let nextDataUser;
    // console.log("existDoc.exists", existDoc.exists);
    // console.log("!existDoc.exists", !existDoc.exists);

    if (!existDoc.exists) {
      const newUser = userModel.User({
        id,
        pass,
        uid,
        fcmToken,
        fcmError,
        firstName,
        lastName,
        icon,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
      });
      // console.log("newUser");
      // console.log("newUser", newUser);
      await userRef.set(newUser);
      nextDataUser = newUser;
      actionName = "createdUserInfo";
    } else {
      const existData = existDoc.data();
      // 各プロパティが空文字列、null、undefined、またはfalseの場合、既存のデータ（existData）の値が使用されます。それ以外の場合、新しい値が使用されます。
      // ただし、isDisabledとisDeletedのプロパティは、明示的にundefinedでない場合にのみ更新が行われます。
      // console.log("pass", pass);
      const existUserInfo = userModel.User({
        id: id || existData.id,
        pass: pass || existData.pass,
        uid: existData.uid,
        fcmToken,
        fcmError,
        firstName: firstName || existData.firstName,
        lastName: lastName || existData.lastName,
        icon: icon || existData.icon,
        isDisabled:
          isDisabled !== undefined ? isDisabled : existData.isDisabled,
        isDeleted: isDeleted !== undefined ? isDeleted : existData.isDeleted,
        createdAt: existData.createdAt,
        updatedAt: now,
        lastLoginAt: now,
      });
      // console.log("existUserInfo");
      // console.log("existUserInfo", existUserInfo);

      // await userRef.set(existUserInfo);
      await userRef.update(existUserInfo);
      nextDataUser = existUserInfo;
      actionName = "updateUserInfo";
    }

    const changeUserData = {
      collectionName: "users",
      docId: uid,
      actionName: actionName,
      prevData: prevDataUser ? prevDataUser : "",
      nextData: nextDataUser ? nextDataUser : "",
    };

    req.detailLogs = [changeUserData];

    if (fcmToken) {
      const fcmTokenRef = db.collection("fcmTokens").doc(fcmToken);
      const existFcmDoc = await fcmTokenRef.get();
      let nextDataFcmToken;

      if (!existFcmDoc.exists) {
        // console.log(userAgentInfo.os);
        // console.log(JSON.stringify(userAgentInfo.os));
        // console.log(uid);
        const registerData = {
          createdAt: now,
          updatedAt: "",
          uid,
          isDeleted: false,
          isDisabled: false,
          userAgentInfo,
        };
        // console.log(registerData);
        await fcmTokenRef.set(registerData);
        nextDataFcmToken = registerData;
        const recordFcmTokenData = {
          collectionName: "fcmTokens",
          docId: fcmToken,
          actionName: "recordFcmToken",
          prevData: "",
          nextData: nextDataFcmToken ? nextDataFcmToken : "",
        };
        req.detailLogs = [...req.detailLogs, recordFcmTokenData];
      }
    }

    const recordData = {
      docID: uid,
      ...req.body,
      pass: undefined,
    };
    // console.log("recordData", recordData);

    res.json({
      user: "Called by the POST method",
      recordData,
    });
    next();
  } catch (error) {
    console.log(error, "ERRORです");
    res.status(500).json({
      error: "Something went wrong. Please try again later.",
    });
    next();
  }
};
