const geoip = require("geoip-lite");
const IPData = require("ipdata").default;
const axios = require("axios");
const admin = require("firebase-admin");
const db = admin.firestore();
const { Timestamp } = require("firebase-admin/firestore");
const { generateDetailLog } = require('../utils/logUtils');
const { ipDataApiKey, ipInfoIoApiKey, ipGeolocationIoApiKey, ipStackIoApiKey } = require('../config');

function getClientIp(req) {
  const ipSources = [
    { type: "x-forwarded-for", value: req.headers?.["x-forwarded-for"] },
    { type: "remoteAddress", value: req.connection?.remoteAddress },
    { type: "socketAddress", value: req.socket?.remoteAddress },
  ];

  for (const { type, value } of ipSources) {
    if (value && value.trim() !== "") {
      return { ipType: type, ip: value.split(",")[0].trim() };
    }
  }

  return { ipType: "", ip: "" };
}

async function getGeoInfo(ip) {
  const geoSources = [
    { type: "geoip", fetchGeo: () => geoip.lookup(ip) },
    {
      type: "ipdata",
      fetchGeo: async () => {
        const ipdata = new IPData(ipDataApiKey);
        return await ipdata.lookup(ip);
      },
    },
    {
      type: "ipinfo.io",
      fetchGeo: async () => {
        const response = await axios.get(
          `https://ipinfo.io/${ip}?/json?token=` + ipInfoIoApiKey
        );
        return response.data;
      },
    },
    {
      type: "ipgeolocation.io",
      fetchGeo: async () => {
        const response = await axios.get(
          `https://api.ipgeolocation.io/ipgeo?apiKey=${ipGeolocationIoApiKey}&ip=${ip}`
        );
        return response.data;
      },
    },
    {
      type: "ipstack",
      fetchGeo: async () => {
        const response = await axios.get(
          `http://api.ipstack.com/${ip}?access_key=${ipStackIoApiKey}`
        );
        return response.data;
      },
    },
  ];

  for (const { type, fetchGeo } of geoSources) {
    try {
      const geo = await fetchGeo();
      if (geo) {
        return { geoType: type, geo };
      }
    } catch (error) {
      console.log(error.message);
    }
  }

  return { geoType: "failed request", geo: { location: "unknown" } };
}

async function saveChangeLog({ log, requestID }) {
  try {
    const detailLog = generateDetailLog(log);

    const docRef = db
      .collection("apiRequestLogs")
      .doc(requestID)
      .collection("detailLogs");
    // .doc();
    await docRef.add(detailLog);

    // console.log("変更ログを保存しました。");
  } catch (error) {
    console.error("変更ログの保存に失敗しました:", error);
  }
}

function apiRequestLog(req, res, next) {
  res.on("finish", async() => {

      // ユーザーIDが存在しない場合は空文字列を設定
      let uid = (req.user && req.user.uid) || req.body.uid || "";
      if (!uid && req.headers.hasOwnProperty("uid")) {
        // ヘッダーからユーザーIDを取得する前に、その存在を確認します
        uid = req.headers.uid;
      }
      // HTTPメソッドとURLを組み合わせてアクションを定義
      const action = req.method + " " + req.originalUrl;
    
      let { ip, ipType } = getClientIp(req);
    
      // IPが取得できなかった場合、空文字列を設定
      if (!ip || ip === "::1" || ip === "127.0.0.1") {
        ip = ""; // IPが取得できなかった場合は空文字列に設定
      }
    
      // IPアドレスがIPv6形式であれば、IPv4形式に変換
      if (ip.substring(0, 7) == "::ffff:") {
        ip = ip.substring(7);
      }
    
      // IPが空でない場合のみ地理情報を取得
      let { geo, geoType } = ip ? await getGeoInfo(ip) : { geo: {}, geoType: "" };
    
      const logData = {
        uid,
        action,
        ip,
        ipType,
        geo,
        geoType,
        timestamp: Timestamp.now(),
        userAgent: req.headers["user-agent"] || "", // userAgentが存在しない場合は空文字列を設定
        host: req.headers.host || "", // hostが存在しない場合は空文字列を設定
      };
      try {
        const docRef = await db.collection("apiRequestLogs").add(logData);
        const docSnapshot = await docRef.get();
        const requestID = docSnapshot.id; // ここでドキュメントIDを取得します。
        const detailLogs = req.detailLogs;
        // console.log("detailLogs", detailLogs);
        for (const log of detailLogs) {
          // console.log("detailLog", detailLog);
          await saveChangeLog({ log, requestID });
        }
      } catch (error) {
        console.error("Failed to record auth log:", error);
      }
    });
    next();
  }

module.exports = apiRequestLog;
