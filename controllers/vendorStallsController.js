const vendorStallModel = require("../models/vendorStallModel");

// Get stalls belonging to logged-in vendor [GET]
// test run: http://localhost:3000/vendor-stalls
async function getVendorStalls(req, res) {
  try {
    const stalls = await vendorStallModel.getVendorStalls(req.user.userID);

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
