const vendorProfileModel = require("../models/vendorProfileModel");

// Get vendor profile [GET]
// test run: http://localhost:3000/vendor-profile
async function getVendorProfile(req, res) {
  try {
    const profile = await vendorProfileModel.getVendorProfile(req.user.userID);

    if (!profile) {
      return res.status(404).json({
        error: "Vendor profile not found.",
      });
    }

    res.status(200).json(profile);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve profile.",
    });
  }
}

// Update vendor profile [PUT]
// test run: http://localhost:3000/vendor-profile
async function updateVendorProfile(req, res) {
  try {
    const updatedProfile = await vendorProfileModel.updateVendorProfile(
      req.user.userID,
      req.body,
    );

    if (!updatedProfile) {
      return res.status(404).json({
        error: "Vendor profile not found.",
      });
    }

    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error(error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Unable to update profile.",
    });
  }
}

// Change password [PUT]
// test run: http://localhost:3000/vendor-profile/password
async function changePassword(req, res) {
  try {
    await vendorProfileModel.changePassword(req.user.userID, req.body);

    res.status(200).json({
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error(error);

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Unable to change password.",
    });
  }
}

module.exports = {
  getVendorProfile,
  updateVendorProfile,
  changePassword,
};
