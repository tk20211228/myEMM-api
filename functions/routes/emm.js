const express = require("express");
const router = express.Router();
const signupUrlsCreate = require("../controllers/emm/signupUrlsCreateController");
const enterpriseCreate = require("../controllers/emm/enterpriseCreateController");
const policyCreate = require("../controllers/emm/policyCreateController");
const devicesList = require("../controllers/emm/devices/devicesListController");
const apiRequestLog = require("../middleware/apiRequestLog");

router.post("/signupUrlsCreate", signupUrlsCreate, apiRequestLog);
router.post(
  "/enterpriseCreate",
  enterpriseCreate.enterpriseCreate,
  apiRequestLog
);
router.post("/policyCreate", policyCreate.policyCreate, apiRequestLog);
router.get("/devices/list", devicesList, apiRequestLog);

module.exports = router;
