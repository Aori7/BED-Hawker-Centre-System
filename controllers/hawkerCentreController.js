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

async function getHawkerCentreById(req, res) {
    try {
        const hawkerCentreID =
            parseInt(req.params.id);

        if (
            isNaN(hawkerCentreID) ||
            hawkerCentreID <= 0
        ) {
            return res.status(400).json({
                error: "Invalid hawker centre ID"
            });
        }

        const hawkerCentre =
            await hawkerCentreModel.getHawkerCentreById(
                hawkerCentreID
            );

        if (!hawkerCentre) {
            return res.status(404).json({
                error: "Hawker centre not found"
            });
        }

        res.status(200).json(hawkerCentre);

    } catch (error) {
        console.error(
            "Get hawker centre by ID error:",
            error
        );

        res.status(500).json({
            error: "Error retrieving hawker centre"
        });
    }
}

module.exports = {
  getAllHawkerCentres,
  getHawkerCentreById
};