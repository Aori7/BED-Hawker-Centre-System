const express = require("express");
const hawkerCentreController = require("../controllers/hawkerCentreController");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const router = express.Router();
// base path: /hawker-centres
router.get("/", hawkerCentreController.getAllHawkerCentres);

router.get(
  "/favourites",
  authenticateToken,
  authorizeRoles("Customer"),
  hawkerCentreController.getFavouriteHawkerCentres,
);

router.get("/available", hawkerCentreController.getAvailableHawkerCentres);

router.post(
  "/:id/favourite",
  authenticateToken,
  authorizeRoles("Customer"),
  hawkerCentreController.addFavouriteHawkerCentre,
);

router.delete(
  "/:id/favourite",
  authenticateToken,
  authorizeRoles("Customer"),
  hawkerCentreController.removeFavouriteHawkerCentre,
);

router.get("/:id", hawkerCentreController.getHawkerCentreById);

module.exports = router;
