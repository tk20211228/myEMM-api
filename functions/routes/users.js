const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

router.post("/login", usersController.recordLogin); //usersController.jsでエクスポートされた関数を使用

module.exports = router;
