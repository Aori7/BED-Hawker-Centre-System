/*
npm test -- vendorFeedbackController.test.js
*/
const vendorFeedbackController = require("../controllers/vendorFeedbackController");
const vendorFeedbackModel = require("../models/vendorFeedbackModel");

jest.mock("../models/vendorFeedbackModel"); // Mock the vendor feedback model

describe("vendorFeedbackController.getFeedbackByStallId", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should retrieve all feedback and return a JSON response", async () => {
    const mockFeedback = [
      {
        SubmissionID: 1,
        CustomerID: 1,
        CustomerName: "John Tan",
        Email: "john@gmail.com",
        Subject: "Food quality",
        Message: "The food was cold.",
        SubmissionType: "Complaint",
        Status: "Pending",
        Replies: [],
      },
      {
        SubmissionID: 2,
        CustomerID: 2,
        CustomerName: "Mary Lim",
        Email: "mary@gmail.com",
        Subject: "Good service",
        Message: "The service was very good.",
        SubmissionType: "Feedback",
        Status: "In Progress",
        Replies: [
          {
            ReplyID: 1,
            SenderType: "Vendor",
            ReplyMessage: "Thank you for your feedback.",
          },
        ],
      },
    ];

    vendorFeedbackModel.getFeedbackByStallId.mockResolvedValue(mockFeedback);

    const req = {
      params: {
        stallId: "1",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorFeedbackController.getFeedbackByStallId(req, res);

    expect(vendorFeedbackModel.getFeedbackByStallId).toHaveBeenCalledTimes(1);
    expect(vendorFeedbackModel.getFeedbackByStallId).toHaveBeenCalledWith("1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockFeedback);
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorFeedbackModel.getFeedbackByStallId.mockRejectedValue(
      new Error(errorMessage),
    );

    const req = {
      params: {
        stallId: "1",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorFeedbackController.getFeedbackByStallId(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to retrieve feedback.",
    });
  });
});

describe("vendorFeedbackController.createReply", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a reply and return a JSON response", async () => {
    const mockReply = {
      ReplyID: 1,
      SubmissionID: 1,
      SenderType: "Vendor",
      ReplyMessage: "We apologise for the issue.",
    };

    vendorFeedbackModel.createReply.mockResolvedValue(mockReply);

    const req = {
      params: {
        submissionId: "1",
      },
      body: {
        ReplyMessage: "We apologise for the issue.",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorFeedbackController.createReply(req, res);

    expect(vendorFeedbackModel.createReply).toHaveBeenCalledTimes(1);
    expect(vendorFeedbackModel.createReply).toHaveBeenCalledWith("1", req.body);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockReply);
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorFeedbackModel.createReply.mockRejectedValue(new Error(errorMessage));

    const req = {
      params: {
        submissionId: "1",
      },
      body: {
        ReplyMessage: "We apologise for the issue.",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorFeedbackController.createReply(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to create reply.",
    });
  });
});

describe("vendorFeedbackController.deleteReply", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a reply and return a JSON response", async () => {
    vendorFeedbackModel.deleteReply.mockResolvedValue(true);

    const req = {
      params: {
        submissionId: "1",
        replyId: "1",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorFeedbackController.deleteReply(req, res);

    expect(vendorFeedbackModel.deleteReply).toHaveBeenCalledTimes(1);
    expect(vendorFeedbackModel.deleteReply).toHaveBeenCalledWith("1", "1");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Reply deleted successfully.",
    });
  });

  it("should return a 404 status when the reply is not found", async () => {
    vendorFeedbackModel.deleteReply.mockResolvedValue(false);

    const req = {
      params: {
        submissionId: "1",
        replyId: "999",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorFeedbackController.deleteReply(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Reply not found.",
    });
  });

  it("should handle errors and return a 500 status with error message", async () => {
    const errorMessage = "Database Error";

    vendorFeedbackModel.deleteReply.mockRejectedValue(new Error(errorMessage));

    const req = {
      params: {
        submissionId: "1",
        replyId: "1",
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await vendorFeedbackController.deleteReply(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unable to delete reply.",
    });
  });
});
