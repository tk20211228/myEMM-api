const rateLimit = require('express-rate-limit');
const admin = require("firebase-admin");
const db = admin.firestore();
const { Timestamp } = require("firebase-admin/firestore");
const { generateDetailLog } = require('../utils/logUtils');


const limiter =  rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 15分間に100リクエストまで許可
  validate: {ip: false},
  handler: async function(req, res, options) {
    try {
      const collectionName = "users"
      const docId = req.user.uid; // ユーザーIDを取得
      const now = Timestamp.now();

      const docRef = db.collection(collectionName).doc(docId);
      const docSnapshot = await docRef.get();
      const prevData = {
        apiLimitCount : docSnapshot.data().apiLimitCount || 0,
        apiLimitDate : docSnapshot.data().apiLimitDate || null,
      }
      const data = {
        apiLimitCount : prevData.apiLimitCount + 1,
        apiLimitDate : now,
      };

      await docRef.update(data)
      const error = `Rate limit hit recorded for user ${docId} at ${now.toDate()}`;
      console.log(error);
      const actionName = "apiLimitCheck";
      const detailLog = generateDetailLog({ actionName , collectionName , docId , nextData : data , prevData , error });
      req.detailLogs = [detailLog];
    } catch (error) {
      console.error("Error updating document: ", error);
    }
    res.status(429).json({ success: false, message: 'Too many requests, please try again later.' });
  }
});

function apiLimitCheck(req, res, next) {
  limiter(req, res, next);
}

module.exports = apiLimitCheck;