function validateContactSubmission(req, res, next) {
    const {
        name,
        email,
        subject,
        message,
        submissionType,
        targetType
    } = req.body;

    if (!name || !email || !subject || !message) {
        return res.status(400).json({
            error: "Please complete all required fields."
        });
    }

    const submissionTypes = [
        "Complaint",
        "Feedback",
        "Suggestion",
        "Others"
    ];

    if (!submissionTypes.includes(submissionType)) {
        return res.status(400).json({
            error: "Invalid submission type."
        });
    }

    const targetTypes = [
        "Stall",
        "HawkerCentre",
        "Operator",
        "General"
    ];

    if (!targetTypes.includes(targetType)) {
        return res.status(400).json({
            error: "Invalid target type."
        });
    }

    next();
}

module.exports = {
    validateContactSubmission
};