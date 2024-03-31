// const admin = require("firebase-admin");
// const { Timestamp} = require("firebase-admin/firestore");

// exports.message = async (req, res, next) => {
//   try {
//     const { title, body, token, uid } = req.body;
//     const now = Timestamp.now();
//     // 送信するメッセージの定義;
//     const message = {
//       token,
//       data: {
//         title,
//         body,
//         uid,
//       },
//     };

//     const detailLog = {
//       collectionName: "",
//       docId: "",
//       actionName: "sendMessage",
//       prevData: "",
//       message,
//     };
//     console.log(message);

//     req.detailLogs = [detailLog];

//     admin
//       .messaging()
//       .send(message)
//       .then((response) => {
//         console.log("Notification sent successfully:", response);
//         res.status(200).send("Notification sent successfully");
//       })
//       .catch((error) => {
//         res.status(500).json({
//           error,
//         });
//         req.detailLogs = [...req.detailLogs, error];
//       })
//       .finally(() => {
//         next();
//       });
//   } catch (error) {
//     res.status(500).json({
//       error,
//     });
//     next();
//   }
// };
