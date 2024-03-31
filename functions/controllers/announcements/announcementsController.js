const admin = require("firebase-admin");
const db = admin.firestore();
const { Timestamp, FieldValue } = require("firebase-admin/firestore");
// const now = Timestamp.now();
const { addDocFirestore, updateDocFirestore, deleteDocFirestore } = require("../../models/firestoreModel");
const { announcementNotification } = require("../../middleware/notificationFcm");
const { generateDetailLog } = require('../../utils/logUtils');
const collectionName = "announcements";

function addDetailLog({req, actionName, collectionName, docId, data, error}) {
  const nextData = data;
  const detailLog = generateDetailLog({ actionName , collectionName , docId , nextData , error });
  req.detailLogs = [detailLog];
}

exports.getAnnouncements = async (req, res) => {
  const announcements = [];
  try {
    const querySnapshot = await db
      .collection(collectionName)
      .orderBy("createdAt", "asc")
      .get();
    querySnapshot.forEach((doc) => {
        announcements.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      res.json({
        announcement: "Called by the GET method",
        announcements,
      });
    } catch (error) {
      console.log(error, "ERRORです");
      next(error); // エラーハンドリング用のミドルウェアにエラーを渡す
    }
  };

exports.createAnnouncement = async (req, res, next) => {
  try {
    const { title, body, author, uid } = req.body;
    const actionName = "createdAnnouncement";
    const now = Timestamp.now();
    const createdAt = now;
    const updatedAt = now;
    let data = {
      title,
      body,
      // uid: author,
      author,
      createdAt,
      updatedAt,
    };
    const createdAnnouncement = await addDocFirestore(collectionName,data);
    const docId = createdAnnouncement.docId;
    addDetailLog({req, collectionName, docId, actionName, data});
    await announcementNotification(req,createdAnnouncement);
    res.json({
      announcement: "Called by the POST method",
      data: createdAnnouncement,
    });
    next(); // レスポンスを送信した後、次のミドルウェアに進む
  } catch (error) {
    console.log(error, "ERROR");
    // エラーメッセージをクライアントに返す
    res.status(500).json({
      error: "Something went wrong. Please try again later.",
    });
    addDetailLog({req, collectionName, docId, actionName, error});
    next(); // エラーハンドリング用のミドルウェアにエラーを渡す
  }
};

exports.updateAnnouncement = async (req, res) => {
    // const { docId } = req.params;
    const { title, content, author ,docId} = req.body;
    const actionName = "updateAnnouncement";
    const updatedAt = Timestamp.now();
    const data = {
      title,
      content,
      author,
      updatedAt,
    };
    try {
      const updateAnnouncement = await updateDocFirestore( collectionName, docId, data);
      addDetailLog({req, collectionName, docId, actionName, data});

      res.json({
        announcement: `Uqdated!!. ID:${id}`,
        data: updateAnnouncement,
      });
      next();
    } catch (error) {
      res.status(500).json({
        announcement: `サーバーエラーが発生しました。` + error, 
      });
      addDetailLog({req, collectionName, docId, actionName, data, error});
      next();
    }
}

exports.deleteAnnouncement = async (req, res) => {
    // const { id } = req.params;
    const {docId} = req.body;
    const actionName = "deleteAnnouncement";
    try {
      const deleteAnnouncement = await deleteDocFirestore(collectionName,docId);
      addDetailLog({req, collectionName, docId, actionName});
      res.json({
        announcement: `DELETE!!. ID:${id}`,
        data: deleteAnnouncement,
      });
      next();
    } catch (error) {
      res.status(500).json({
        announcement: `サーバーエラーが発生しました。` + error,
      });
      addDetailLog({req, collectionName, docId, actionName, error});
      next();
    }
};