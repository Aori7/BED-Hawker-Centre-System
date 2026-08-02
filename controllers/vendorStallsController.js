const vendorStallsModel = require("../models/vendorStallsModel");

// Get stalls belonging to logged-in vendor [GET]
async function getVendorStalls(req, res) {
  try {
    const stalls = await vendorStallsModel.getVendorStalls(req.user.userID);

    res.status(200).json(stalls);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve vendor stalls.",
    });
  }
}

module.exports = {
  getVendorStalls,
};
