/*
npm test -- vendorFeedbackModel.test.js
*/
const vendorFeedbackModel = require("../models/vendorFeedbackModel");
const sql = require("mssql");

jest.mock("mssql"); // Mock the mssql library

describe("vendorFeedbackModel.getFeedbackByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve all feedback from the database", async () => {
    const mockFeedbackRows = [
      {
        SubmissionID: 1,
        CustomerID: 1,
        CustomerName: "John Tan",
        Name: "John Tan",
        Email: "john@gmail.com",
        Subject: "Food quality",
        Message: "The food was cold.",
        SubmissionType: "Complaint",
        Status: "Pending",
        CreatedAt: new Date("2026-08-01T12:00:00"),
        ReplyID: null,
        SenderType: null,
        ReplyMessage: null,
        ReplyCreatedAt: null,
      },
      {
        SubmissionID: 2,
        CustomerID: 2,
        CustomerName: "Mary Lim",
        Name: "Mary Lim",
        Email: "mary@gmail.com",
        Subject: "Good service",
        Message: "The service was very good.",
        SubmissionType: "Feedback",
        Status: "In Progress",
        CreatedAt: new Date("2026-08-01T13:00:00"),
        ReplyID: 1,
        SenderType: "Vendor",
        ReplyMessage: "Thank you for your feedback.",
        ReplyCreatedAt: new Date("2026-08-01T14:00:00"),
      },
    ];

    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: mockFeedbackRows,
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const feedback = await vendorFeedbackModel.getFeedbackByStallId(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockRequest.input).toHaveBeenCalledWith("stallId", sql.Int, 1);
    expect(feedback).toHaveLength(2);
    expect(feedback[0].SubmissionID).toBe(1);
    expect(feedback[0].CustomerName).toBe("John Tan");
    expect(feedback[0].Replies).toHaveLength(0);
    expect(feedback[1].SubmissionID).toBe(2);
    expect(feedback[1].CustomerName).toBe("Mary Lim");
    expect(feedback[1].Replies).toHaveLength(1);
    expect(feedback[1].Replies[0].ReplyMessage).toBe(
      "Thank you for your feedback.",
    );
  });

  it("should return an empty array when no feedback is found", async () => {
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

    const feedback = await vendorFeedbackModel.getFeedbackByStallId(1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(feedback).toEqual([]);
  });

  it("should handle errors when retrieving feedback", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(vendorFeedbackModel.getFeedbackByStallId(1)).rejects.toThrow(
      errorMessage,
    );
  });
});

describe("vendorFeedbackModel.createReply", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a vendor reply in the database", async () => {
    const mockInsertRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        recordset: [
          {
            id: 1,
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
        .mockReturnValueOnce(mockInsertRequest)
        .mockReturnValueOnce(mockUpdateRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const replyData = {
      ReplyMessage: "We apologise for the issue.",
    };

    const reply = await vendorFeedbackModel.createReply(1, replyData);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockInsertRequest.input).toHaveBeenCalledWith(
      "SubmissionID",
      sql.Int,
      1,
    );
    expect(mockInsertRequest.input).toHaveBeenCalledWith(
      "SenderType",
      sql.VarChar(20),
      "Vendor",
    );
    expect(mockInsertRequest.input).toHaveBeenCalledWith(
      "ReplyMessage",
      sql.VarChar(1000),
      "We apologise for the issue.",
    );
    expect(reply.ReplyID).toBe(1);
    expect(reply.SubmissionID).toBe(1);
    expect(reply.SenderType).toBe("Vendor");
    expect(reply.ReplyMessage).toBe("We apologise for the issue.");
  });

  it("should handle errors when creating a reply", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    const replyData = {
      ReplyMessage: "We apologise for the issue.",
    };

    await expect(vendorFeedbackModel.createReply(1, replyData)).rejects.toThrow(
      errorMessage,
    );
  });
});

describe("vendorFeedbackModel.deleteReply", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a vendor reply from the database", async () => {
    const mockRequest = {
      input: jest.fn().mockReturnThis(),
      query: jest.fn().mockResolvedValue({
        rowsAffected: [1],
      }),
    };

    const mockConnection = {
      request: jest.fn().mockReturnValue(mockRequest),
    };

    sql.connect.mockResolvedValue(mockConnection);

    const deleted = await vendorFeedbackModel.deleteReply(1, 1);

    expect(sql.connect).toHaveBeenCalledWith(expect.any(Object));
    expect(mockRequest.input).toHaveBeenCalledWith("SubmissionID", sql.Int, 1);
    expect(mockRequest.input).toHaveBeenCalledWith("ReplyID", sql.Int, 1);
    expect(mockRequest.input).toHaveBeenCalledWith(
      "SenderType",
      sql.VarChar(20),
      "Vendor",
    );
    expect(deleted).toBe(true);
  });

  it("should return false when the reply is not found", async () => {
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

    const deleted = await vendorFeedbackModel.deleteReply(1, 999);

    expect(deleted).toBe(false);
  });

  it("should handle errors when deleting a reply", async () => {
    const errorMessage = "Database Error";

    sql.connect.mockRejectedValue(new Error(errorMessage));

    await expect(vendorFeedbackModel.deleteReply(1, 1)).rejects.toThrow(
      errorMessage,
    );
  });
});
