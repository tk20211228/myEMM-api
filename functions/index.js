require("dotenv").config();
const express = require("express");

const corsSettings = require("./middleware/corsSettings");
const serviceAccount = require("./serviceAccountKey.json");
// const emmServiceAccount = require("./emm-test-20230624-c0cd1c3d2ff3.json");
const functions = require("firebase-functions");


const admin = require("firebase-admin");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const printMemoryUsage = require("./middleware/printMemoryUsage");
const app = express();

app.use(corsSettings);


const checkAuth = require("./middleware/checkAuth");
app.use(checkAuth);

const announcementRouter = require("./routes/announcements");
app.use("/announcements", printMemoryUsage, announcementRouter);

const usersRouter = require("./routes/users");
app.use("/users", printMemoryUsage, usersRouter);

const sendRouter = require("./routes/send");
app.use("/send", printMemoryUsage, sendRouter); //

const emmRouter = require("./routes/emm");
app.use("/emm", printMemoryUsage, emmRouter); //

exports.api = functions
    .region("asia-northeast1")
    .runWith({ memory: "512MB" })
    .https.onRequest(app);
