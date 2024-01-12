const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");
const apiRequestLog = require("../middleware/apiRequestLog");

router.post("/login", usersController.recordLogin, apiRequestLog); //usersController.jsでエクスポートされた関数を使用

module.exports = router;
