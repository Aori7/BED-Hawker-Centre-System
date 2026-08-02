const hawkerCentreModel = require("../models/hawkerCentreModel");

async function getAllHawkerCentres(req, res) {
  try {
    const hawkerCentres = await hawkerCentreModel.getAllHawkerCentres();

    res.status(200).json(hawkerCentres);
  } catch (error) {
    console.error("Controller error:", error);

    res.status(500).json({
      error: "Error retrieving hawker centres",
    });
  }
}

async function getHawkerCentreById(req, res) {
  try {
    const hawkerCentreID = parseInt(req.params.id);

    if (isNaN(hawkerCentreID) || hawkerCentreID <= 0) {
      return res.status(400).json({
        error: "Invalid hawker centre ID",
      });
    }

    const hawkerCentre =
      await hawkerCentreModel.getHawkerCentreById(hawkerCentreID);

    if (!hawkerCentre) {
      return res.status(404).json({
        error: "Hawker centre not found",
      });
    }

    res.status(200).json(hawkerCentre);
  } catch (error) {
    console.error("Get hawker centre by ID error:", error);

    res.status(500).json({
      error: "Error retrieving hawker centre",
    });
  }
}

async function getAvailableHawkerCentres(req, res) {
  try {
    const hawkerCentres = await hawkerCentreModel.getAvailableHawkerCentres();

    res.status(200).json(hawkerCentres);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Error retrieving available hawker centres",
    });
  }
}
async function getFavouriteHawkerCentres(req, res) {
  try {
    const userID = req.user.userID;

    const favourites =
      await hawkerCentreModel.getFavouriteHawkerCentres(userID);

    res.status(200).json(favourites);
  } catch (error) {
    console.error("Get favourites error:", error);

    res.status(500).json({
      error: "Error retrieving favourite hawker centres",
    });
  }
}

async function addFavouriteHawkerCentre(req, res) {
  try {
    const userID = req.user.userID;
    const hawkerCentreID = parseInt(req.params.id);

    if (isNaN(hawkerCentreID) || hawkerCentreID <= 0) {
      return res.status(400).json({
        error: "Invalid hawker centre ID",
      });
    }

    const hawkerCentre =
      await hawkerCentreModel.getHawkerCentreById(hawkerCentreID);

    if (!hawkerCentre) {
      return res.status(404).json({
        error: "Hawker centre not found",
      });
    }

    const result =
      await hawkerCentreModel.addFavouriteHawkerCentre(
        userID,
        hawkerCentreID
      );

    if (!result) {
      return res.status(404).json({
        error: "Customer account not found",
      });
    }

    if (result.alreadyFavourite) {
      return res.status(200).json({
        message: "Hawker centre is already in favourites",
      });
    }

    res.status(201).json({
      message: "Hawker centre added to favourites",
    });
  } catch (error) {
    console.error("Add favourite error:", error);

    res.status(500).json({
      error: "Error adding favourite hawker centre",
    });
  }
}

async function removeFavouriteHawkerCentre(req, res) {
  try {
    const userID = req.user.userID;
    const hawkerCentreID = parseInt(req.params.id);

    if (isNaN(hawkerCentreID) || hawkerCentreID <= 0) {
      return res.status(400).json({
        error: "Invalid hawker centre ID",
      });
    }

    const rowsAffected =
      await hawkerCentreModel.removeFavouriteHawkerCentre(
        userID,
        hawkerCentreID
      );

    if (rowsAffected === null) {
      return res.status(404).json({
        error: "Customer account not found",
      });
    }

    if (rowsAffected === 0) {
      return res.status(404).json({
        error: "Favourite hawker centre not found",
      });
    }

    res.status(200).json({
      message: "Hawker centre removed from favourites",
    });
  } catch (error) {
    console.error("Remove favourite error:", error);

    res.status(500).json({
      error: "Error removing favourite hawker centre",
    });
  }
}

module.exports = {
  getAllHawkerCentres,
  getHawkerCentreById,
  getAvailableHawkerCentres,
  getFavouriteHawkerCentres,
  addFavouriteHawkerCentre,
  removeFavouriteHawkerCentre,
};
