const contactSubmissionModel = require("../models/contactSubmissionModel");

// target refers to directing submission to a specific stall, hawker centre or operator etc
async function getContactTargets(req, res) {
  try {
    const targets = await contactSubmissionModel.getContactTargets();

    res.status(200).json(targets);
  } catch (error) {
    console.error("Get contact targets controller error:", error);

    res.status(500).json({
      error: "Unable to retrieve contact targets",
    });
  }
}
//creating a new submission
async function createContactSubmission(req, res) {
  try {
    const {
      customerID,
      name,
      email,
      subject,
      message,
      submissionType,
      targetType,
      stallID,
      hawkerCentreID,
      operatorID,
    } = req.body; // get the data from the frontend

    if (
      !name ||
      !email ||
      !subject ||
      !message ||
      !submissionType ||
      !targetType
    ) {
      return res.status(400).json({
        error:
          "Name, email, subject, message, submission type and target type are required",
      });
    }

    const allowedSubmissionTypes = [
      "Complaint",
      "Feedback",
      "Suggestion",
      "Others",
    ];

    const allowedTargetTypes = ["Stall", "HawkerCentre", "Operator", "General"];

    if (!allowedSubmissionTypes.includes(submissionType)) {
      return res.status(400).json({
        error: "Invalid submission type",
      });
    }

    if (!allowedTargetTypes.includes(targetType)) {
      return res.status(400).json({
        error: "Invalid target type",
      });
    }

    const parsedStallID = stallID ? parseInt(stallID) : null;

    const parsedHawkerCentreID = hawkerCentreID
      ? parseInt(hawkerCentreID)
      : null;

    const parsedOperatorID = operatorID ? parseInt(operatorID) : null;

    if (
      targetType === "Stall" &&
      (!parsedStallID || parsedHawkerCentreID || parsedOperatorID)
    ) {
      return res.status(400).json({
        error: "Please select one valid stall",
      });
    }

    if (
      targetType === "HawkerCentre" &&
      (!parsedHawkerCentreID || parsedStallID || parsedOperatorID)
    ) {
      return res.status(400).json({
        error: "Please select one valid hawker centre",
      });
    }

    if (
      targetType === "Operator" &&
      (!parsedOperatorID || parsedStallID || parsedHawkerCentreID)
    ) {
      return res.status(400).json({
        error: "Please select one valid operator",
      });
    }

    if (
      targetType === "General" &&
      (parsedStallID || parsedHawkerCentreID || parsedOperatorID)
    ) {
      return res.status(400).json({
        error:
          "General submissions cannot include a stall, hawker centre or operator",
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return res.status(400).json({
        error: "Please enter a valid email address",
      });
    }

    const result = await contactSubmissionModel.createContactSubmission({
      customerID: customerID ? parseInt(customerID) : null,

      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      submissionType,
      targetType,

      stallID: parsedStallID,

      hawkerCentreID: parsedHawkerCentreID,

      operatorID: parsedOperatorID,
    });

    res.status(201).json({
      message: "Contact submission sent successfully",

      submissionID: result.SubmissionID,
    });
  } catch (error) {
    console.error("Create contact submission controller error:", error);

    res.status(500).json({
      error: "Unable to submit contact form",
    });
  }
}

module.exports = {
  getContactTargets,
  createContactSubmission,
};
