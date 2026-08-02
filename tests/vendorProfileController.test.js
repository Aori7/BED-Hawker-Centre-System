/*
npm test -- vendorProfileController.test.js
*/
// vendorProfileController.test.js
const vendorProfileController = require("../controllers/vendorProfileController");
const vendorProfileModel = require("../models/vendorProfileModel");

jest.mock("../models/vendorProfileModel"); // Mock the vendor profile model

describe("vendorProfileController.getVendorProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve the vendor profile and return a JSON response", async () => {
    const mockProfile = {
      UserID: 1,
      Email: "vendor@gmail.com",
      OwnerID: 1,
      OwnerName: "John Tan",
      ContactNo: "91234567",
      NRIC: "S1234567A",
    };

    vendorProfileModel.getVendorProfile.mockResolvedValue(mockProfile);

    const req = {
      user: {
        userID: 1,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorProfileController.getVendorProfile(req, res);

    expect(vendorProfileModel.getVendorProfile).toHaveBeenCalledTimes(1);
    expect(vendorProfileModel.getVendorProfile).toHaveBeenCalledWith(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockProfile);
  });

  it("should return a 404 status when the vendor profile is not found", async () => {
    vendorProfileModel.getVendorProfile.mockResolvedValue(null);

    const req = {
      user: {
        userID: 999,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorProfileController.getVendorProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Vendor profile not found.",
    });
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorProfileModel.getVendorProfile.mockRejectedValue(
      new Error(errorMessage),
    );

    const req = {
      user: {
        userID: 1,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorProfileController.getVendorProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve profile.",
    });
  });
});

describe("vendorProfileController.updateVendorProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update the vendor profile and return a JSON response", async () => {
    const mockUpdatedProfile = {
      UserID: 1,
      Email: "vendor@gmail.com",
      OwnerID: 1,
      OwnerName: "John Tan Updated",
      ContactNo: "98765432",
      NRIC: "S1234567A",
    };

    vendorProfileModel.updateVendorProfile.mockResolvedValue(
      mockUpdatedProfile,
    );

    const req = {
      user: {
        userID: 1,
      },
      body: {
        OwnerName: "John Tan Updated",
        ContactNo: "98765432",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorProfileController.updateVendorProfile(req, res);

    expect(vendorProfileModel.updateVendorProfile).toHaveBeenCalledTimes(1);
    expect(vendorProfileModel.updateVendorProfile).toHaveBeenCalledWith(
      1,
      req.body,
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockUpdatedProfile);
  });

  it("should return a 404 status when the vendor profile is not found", async () => {
    vendorProfileModel.updateVendorProfile.mockResolvedValue(null);

    const req = {
      user: {
        userID: 999,
      },
      body: {
        OwnerName: "John Tan Updated",
        ContactNo: "98765432",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorProfileController.updateVendorProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Vendor profile not found.",
    });
  });

  it("should return the error status when the contact number is already in use", async () => {
    const duplicateError = new Error("Contact number is already in use.");

    duplicateError.statusCode = 409;

    vendorProfileModel.updateVendorProfile.mockRejectedValue(duplicateError);

    const req = {
      user: {
        userID: 1,
      },
      body: {
        OwnerName: "John Tan Updated",
        ContactNo: "98765432",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorProfileController.updateVendorProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Contact number is already in use.",
    });
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorProfileModel.updateVendorProfile.mockRejectedValue(
      new Error(errorMessage),
    );

    const req = {
      user: {
        userID: 1,
      },
      body: {
        OwnerName: "John Tan Updated",
        ContactNo: "98765432",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorProfileController.updateVendorProfile(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to update profile.",
    });
  });
});

describe("vendorProfileController.changePassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should change the password and return a JSON response", async () => {
    vendorProfileModel.changePassword.mockResolvedValue(undefined);

    const req = {
      user: {
        userID: 1,
      },
      body: {
        CurrentPassword: "OldPassword123",
        NewPassword: "NewPassword123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorProfileController.changePassword(req, res);

    expect(vendorProfileModel.changePassword).toHaveBeenCalledTimes(1);
    expect(vendorProfileModel.changePassword).toHaveBeenCalledWith(1, req.body);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Password updated successfully.",
    });
  });

  it("should return the error status when the current password is incorrect", async () => {
    const passwordError = new Error("Current password is incorrect.");

    passwordError.statusCode = 400;

    vendorProfileModel.changePassword.mockRejectedValue(passwordError);

    const req = {
      user: {
        userID: 1,
      },
      body: {
        CurrentPassword: "WrongPassword123",
        NewPassword: "NewPassword123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorProfileController.changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Current password is incorrect.",
    });
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorProfileModel.changePassword.mockRejectedValue(
      new Error(errorMessage),
    );

    const req = {
      user: {
        userID: 1,
      },
      body: {
        CurrentPassword: "OldPassword123",
        NewPassword: "NewPassword123",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorProfileController.changePassword(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to change password.",
    });
  });
});
