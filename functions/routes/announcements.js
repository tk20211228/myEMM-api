const express = require("express");
const router = express.Router();
const announcementsController = require("../controllers/announcements/announcementsController");
const apiRequestLog = require("../middleware/apiRequestLog");

router.route("/")
  .get(announcementsController.getAnnouncements, apiRequestLog)
  .post(announcementsController.createAnnouncement, apiRequestLog);

router.route("/:id")
  .put(announcementsController.updateAnnouncement, apiRequestLog)
  .delete(announcementsController.deleteAnnouncement, apiRequestLog);

module.exports = router;
