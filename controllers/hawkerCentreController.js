const hawkerCentreModel = require("../models/hawkerCentreModel");

async function getAllHawkerCentres(req, res) {
  try {
    const hawkerCentres =
      await hawkerCentreModel.getAllHawkerCentres();

    res.status(200).json(hawkerCentres);
  } catch (error) {
    console.error("Controller error:", error);

    res.status(500).json({
      error: "Error retrieving hawker centres",
    });
  }
}

module.exports = {
  getAllHawkerCentres,
};