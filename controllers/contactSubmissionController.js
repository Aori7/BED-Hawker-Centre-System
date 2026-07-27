const contactSubmissionModel =
    require("../models/contactSubmissionModel");

async function createContactSubmission(req, res) {
    try {
        const {
            customerID,
            name,
            email,
            subject,
            message,
            submissionType
        } = req.body;

        if (
            !name ||
            !email ||
            !subject ||
            !message ||
            !submissionType
        ) {
            return res.status(400).json({
                error:
                    "Name, email, subject, message and submission type are required"
            });
        }

        const allowedSubmissionTypes = [
            "Complaint",
            "Feedback",
            "Suggestion",
            "Others"
        ];

        if (
            !allowedSubmissionTypes.includes(
                submissionType
            )
        ) {
            return res.status(400).json({
                error: "Invalid submission type"
            });
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return res.status(400).json({
                error: "Please enter a valid email address"
            });
        }

        if (name.length > 100) {
            return res.status(400).json({
                error:
                    "Name cannot exceed 100 characters"
            });
        }

        if (subject.length > 150) {
            return res.status(400).json({
                error:
                    "Subject cannot exceed 150 characters"
            });
        }

        if (message.length > 1000) {
            return res.status(400).json({
                error:
                    "Message cannot exceed 1000 characters"
            });
        }

        const result =
            await contactSubmissionModel
                .createContactSubmission({
                    customerID:
                        customerID
                            ? parseInt(customerID)
                            : null,

                    name:
                        name.trim(),

                    email:
                        email.trim(),

                    subject:
                        subject.trim(),

                    message:
                        message.trim(),

                    submissionType
                });

        res.status(201).json({
            message:
                "Contact submission sent successfully",

            submissionID:
                result.SubmissionID
        });

    } catch (error) {
        console.error(
            "Create contact submission controller error:",
            error
        );

        res.status(500).json({
            error:
                "Unable to submit contact form"
        });
    }
}

module.exports = {
    createContactSubmission
};