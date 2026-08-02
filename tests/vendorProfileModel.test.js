/*
npm test -- vendorProfileModel.test.js
*/
// vendorProfileModel.test.js
const vendorProfileModel = require("../models/vendorProfileModel");
const sql = require("mssql");
const bcrypt = require("bcrypt");

jest.mock("mssql"); // Mock the mssql library
jest.mock("bcrypt"); // Mock the bcrypt library

describe("vendorProfileModel.getVendorProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve the vendor profile from the database", async () => {
    const mockProfile = {
      UserID: 1,
      Email: "vendor@gmail.com",
      OwnerID: 1,
      OwnerName: "John Tan",
      ContactNo: "91234567",
      NRIC: "S1234567A",
    };

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [mockProfile],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const profile = await vendorProfileModel.getVendorProfile(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockRequest.input).toHaveBeenCalledWith("UserID", sql.Int, 1);
    expect(profile.UserID).toBe(1);
    expect(profile.Email).toBe("vendor@gmail.com");
    expect(profile.OwnerName).toBe("John Tan");
    expect(profile.ContactNo).toBe("91234567");
  });

  it("should return null when the vendor profile is not found", async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const profile = await vendorProfileModel.getVendorProfile(999);

    expect(profile).toBeNull();
  });

  it("should handle errors when retrieving the vendor profile", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(vendorProfileModel.getVendorProfile(1)).rejects.toThrow(
      errorMessage,
    );
  });
});

describe("vendorProfileModel.updateVendorProfile", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update and return the vendor profile", async () => {
    const mockUpdatedProfile = {
      UserID: 1,
      Email: "vendor@gmail.com",
      OwnerID: 1,
      OwnerName: "John Tan Updated",
      ContactNo: "98765432",
      NRIC: "S1234567A",
    };

    const mockUpdateRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        rowsAffected: [1],
      }),
    };

    const mockGetRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [mockUpdatedProfile],
      }),
    };

    const mockUpdateConnection = {
      request: jest.fn().mockReturnValue(mockUpdateRequest),
    };

    const mockGetConnection = {
      request: jest.fn().mockReturnValue(mockGetRequest),
    };

    sql.connect
      .mockResolvedValueOnce(mockUpdateConnection)
      .mockResolvedValueOnce(mockGetConnection);

    const profileData = {
      OwnerName: "John Tan Updated",
      ContactNo: "98765432",
    };

    const updatedProfile = await vendorProfileModel.updateVendorProfile(
      1,
      profileData,
    );

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockUpdateRequest.input).toHaveBeenCalledWith("UserID", sql.Int, 1);
    expect(mockUpdateRequest.input).toHaveBeenCalledWith(
      "OwnerName",
      sql.VarChar(100),
      "John Tan Updated",
    );
    expect(mockUpdateRequest.input).toHaveBeenCalledWith(
      "ContactNo",
      sql.Char(8),
      "98765432",
    );
    expect(updatedProfile).toEqual(mockUpdatedProfile);
  });

  it("should return null when the vendor profile is not found", async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        rowsAffected: [0],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const profileData = {
      OwnerName: "John Tan Updated",
      ContactNo: "98765432",
    };

    const updatedProfile = await vendorProfileModel.updateVendorProfile(
      999,
      profileData,
    );

    expect(updatedProfile).toBeNull();
  });

  it("should handle duplicate contact numbers", async () => {
    const duplicateError = new Error("Duplicate contact number");

    duplicateError.number = 2627;

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockRejectedValue(duplicateError),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const profileData = {
      OwnerName: "John Tan Updated",
      ContactNo: "98765432",
    };

    await expect(
      vendorProfileModel.updateVendorProfile(1, profileData),
    ).rejects.toThrow("Contact number is already in use.");
  });

  it("should handle errors when updating the vendor profile", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    const profileData = {
      OwnerName: "John Tan Updated",
      ContactNo: "98765432",
    };

    await expect(
      vendorProfileModel.updateVendorProfile(1, profileData),
    ).rejects.toThrow(errorMessage);
  });
});

describe("vendorProfileModel.changePassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should change the vendor password in the database", async () => {
    const mockPasswordHash = "$2b$10$oldPasswordHash";
    const mockNewPasswordHash = "$2b$10$newPasswordHash";

    const mockSelectRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [
          {
            PasswordHash: mockPasswordHash,
          },
        ],
      }),
    };

    const mockUpdateRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        rowsAffected: [1],
      }),
    };

    const mockConnection = {
      request: jest
        .fn()
        .mockReturnValueOnce(mockSelectRequest)
        .mockReturnValueOnce(mockUpdateRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue(mockNewPasswordHash);

    const passwordData = {
      CurrentPassword: "OldPassword123",
      NewPassword: "NewPassword123",
    };

    await vendorProfileModel.changePassword(1, passwordData);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockSelectRequest.input).toHaveBeenCalledWith("UserID", sql.Int, 1);
    expect(bcrypt.compare).toHaveBeenCalledWith(
      "OldPassword123",
      mockPasswordHash,
    );
    expect(bcrypt.hash).toHaveBeenCalledWith("NewPassword123", 10);
    expect(mockUpdateRequest.input).toHaveBeenCalledWith(
      "PasswordHash",
      sql.VarChar(255),
      mockNewPasswordHash,
    );
  });

  it("should return an error when the user is not found", async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const passwordData = {
      CurrentPassword: "OldPassword123",
      NewPassword: "NewPassword123",
    };

    await expect(
      vendorProfileModel.changePassword(999, passwordData),
    ).rejects.toThrow("User not found.");
  });

  it("should return an error when the current password is incorrect", async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [
          {
            PasswordHash: "$2b$10$oldPasswordHash",
          },
        ],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);
    bcrypt.compare.mockResolvedValue(false);

    const passwordData = {
      CurrentPassword: "WrongPassword123",
      NewPassword: "NewPassword123",
    };

    await expect(
      vendorProfileModel.changePassword(1, passwordData),
    ).rejects.toThrow("Current password is incorrect.");
  });

  it("should handle errors when changing the password", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    const passwordData = {
      CurrentPassword: "OldPassword123",
      NewPassword: "NewPassword123",
    };

    await expect(
      vendorProfileModel.changePassword(1, passwordData),
    ).rejects.toThrow(errorMessage);
  });
});
