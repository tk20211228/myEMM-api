const express = require("express");
const router = express.Router();
const signupUrlsCreate = require("../controllers/emm/signupUrlsCreateController");
const enterpriseCreate = require("../controllers/emm/enterpriseCreateController");
const policyCreate = require("../controllers/emm/policyCreateController");
const devicesList = require("../controllers/emm/devices/devicesListController");

router.post("/signupUrlsCreate", signupUrlsCreate);
router.post("/enterpriseCreate", enterpriseCreate.enterpriseCreate);
router.post("/policyCreate", policyCreate.policyCreate);;
router.get("/devices/list", devicesList);

module.exports = router;
