const DevEmmSignupCallbackUrl = process.env.GOOGLE_EMM_SIGNUP_CALLBACK_URL
const ProdEmmSignupCallbackUrl = `https://${process.env.PROD_DOMAIN}/setting/emm`

// 環境に応じてコールバック関数を変更
const callbackUrl = process.env.NODE_ENV === 'production' ? ProdEmmSignupCallbackUrl : DevEmmSignupCallbackUrl;

const config = {
  ipDataApiKey: process.env.IPDATA_API_KEY,
  ipInfoIoApiKey: process.env.IPINFO_IO_API_KEY,
  ipGeolocationIoApiKey: process.env.IPGEOLOCATION_IO_API_KEY,
  ipStackIoApiKey: process.env.IPSTACK_IO_API_KEY,
  googleEmmServiceAccountKey: process.env.GOOGLE_EMM_SERVICE_ACCOUNT_KEY,
  googleEmmApiScope: process.env.GOOGLE_EMM_API_SCOPE,
  domain: process.env.PROD_DOMAIN,
  googleEmmProjectId:process.env.GOOGLE_EMM_PROJECT_ID,
  callbackUrl,
  allowedOrigins: ["http://localhost:3000", `https://${process.env.PROD_DOMAIN}`],
};

module.exports = config;