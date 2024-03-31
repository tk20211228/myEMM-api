const cors = require("cors");
const { allowedOrigins } = require('../config');

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); //POSTMANでデバックするため設定
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = `このオリジンからのCORSは許可されていません : ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

module.exports = cors(corsOptions);
