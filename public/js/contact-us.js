document.addEventListener(
    "DOMContentLoaded",
    () => {
        const contactForm =
            document.getElementById(
                "contact-form"
            );

        const submitButton =
            document.getElementById(
                "submitbtn"
            );

        contactForm.addEventListener(
            "submit",
            async (event) => {
                event.preventDefault();

                const name =
                    document
                        .getElementById("name")
                        .value
                        .trim();

                const email =
                    document
                        .getElementById("email")
                        .value
                        .trim();

                const subject =
                    document
                        .getElementById("subject")
                        .value
                        .trim();

                const submissionType =
                    document
                        .getElementById(
                            "submission-type"
                        )
                        .value;

                const message =
                    document
                        .getElementById("message")
                        .value
                        .trim();

                const customerID =
                    sessionStorage.getItem(
                        "customerID"
                    );

                const submissionData = {
                    customerID:
                        customerID
                            ? parseInt(customerID)
                            : null,

                    name,
                    email,
                    subject,
                    submissionType,
                    message
                };

                try {
                    submitButton.disabled = true;
                    submitButton.value =
                        "Submitting...";

                    const response =
                        await fetch(
                            "/contact-submissions",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body:
                                    JSON.stringify(
                                        submissionData
                                    )
                            }
                        );

                    const data =
                        await response.json();

                    if (!response.ok) {
                        throw new Error(
                            data.error ||
                            "Unable to submit form"
                        );
                    }

                    alert(
                        "Your submission has been sent successfully."
                    );

                    contactForm.reset();

                } catch (error) {
                    console.error(
                        "Contact submission error:",
                        error
                    );

                    alert(error.message);

                } finally {
                    submitButton.disabled = false;
                    submitButton.value =
                        "Submit";
                }
            }
        );
    }
);