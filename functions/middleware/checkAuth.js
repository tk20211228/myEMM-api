const admin = require("firebase-admin");

async function checkAuth(req, res, next) {
  // console.log(req.headers);

  if (!req.headers.authorization) {
    return res.status(403).json({ error: "No credentials sent!" });
  }
  const idToken = req.headers.authorization.split("Bearer ")[1];
  // console.log(idToken);
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;
    // console.log("req.user",req.user.uid)
    next();
  } catch (error) {
    res.status(401).send("Unauthorized");
  }
}

module.exports = checkAuth;
