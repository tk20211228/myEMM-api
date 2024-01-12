const express = require("express");
const router = express.Router();
const sendController = require("../controllers/sendController");
const apiRequestLog = require("../middleware/apiRequestLog");

router.post("/notification", sendController.message, apiRequestLog); 

module.exports = router;
