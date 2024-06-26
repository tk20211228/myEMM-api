require("dotenv").config();
const express = require("express");
const corsSettings = require("./middleware/corsSettings");
const serviceAccount = require("./serviceAccountKey.json");
const functions = require("firebase-functions");


const admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const printMemoryUsage = require("./middleware/printMemoryUsage");
const app = express();

app.use(corsSettings);

const apiRequestLog = require("./middleware/apiRequestLog");
app.use(apiRequestLog);

const deployTime = functions.config().deploy.time || "デプロイ時間が設定されていません";
const { callbackUrl} = require('./config');

app.get("/server-time", (req, res) => {
    const currentTime = new Date().toISOString();
    res.json({
        serverTime: currentTime,
        deployTime: deployTime,
        callbackUrl,
    });
});


const checkAuth = require("./middleware/checkAuth");
app.use(checkAuth);

const apiLimitCheck =require("./middleware/apiLimit")
app.use(apiLimitCheck);

const announcementRouter = require("./routes/announcements");
app.use("/announcements", printMemoryUsage, announcementRouter);

const usersRouter = require("./routes/users");
app.use("/users", printMemoryUsage, usersRouter);

//現在未使用
// const sendRouter = require("./routes/send");
// app.use("/send", printMemoryUsage, sendRouter);

const emmRouter = require("./routes/emm");
app.use("/emm", printMemoryUsage, emmRouter);

exports.api = functions
    .region("asia-northeast1")
    .runWith({ memory: "512MB" })
    .https.onRequest(app);
