const express = require("express");
const router = express.Router();
const announcementsController = require("../controllers/announcements/announcementsController");

router.route("/")
  .get(announcementsController.getAnnouncements)
  .post(announcementsController.createAnnouncement);

router.route("/:id")
  .put(announcementsController.updateAnnouncement)
  .delete(announcementsController.deleteAnnouncement);

module.exports = router;
