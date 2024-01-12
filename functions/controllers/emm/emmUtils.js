const path = require("path");
const { google } = require("googleapis");
const generateAuthClient = async () => {
  const auth = new google.auth.GoogleAuth({
    keyFilename: path.join(
      __dirname, // __dirname（現在のスクリプトのディレクトリ）を基準にして指定
      "../../",
      process.env.GOOGLE_EMM_SERVICE_ACCOUNT_KEY
    ),
    scopes: [process.env.GOOGLE_EMM_API_SCOPE],
  });
  // console.dir(auth);
  const authClient = await auth.getClient();
  return authClient;
};

module.exports = { generateAuthClient };
