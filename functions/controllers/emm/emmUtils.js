const path = require("path");
const { google } = require("googleapis");
const { googleEmmServiceAccountKey, googleEmmApiScope } = require('../../config');

const generateAuthClient = async () => {
  
  console.log(googleEmmServiceAccountKey, googleEmmApiScope)
  const auth = new google.auth.GoogleAuth({
    keyFilename: path.join(
      __dirname, // __dirname（現在のスクリプトのディレクトリ）を基準にして指定
      "../../",
      googleEmmServiceAccountKey
    ),
    scopes: [googleEmmApiScope],
  });
  // console.dir(auth);
  const authClient = await auth.getClient();
  return authClient;
};

module.exports = { generateAuthClient };
