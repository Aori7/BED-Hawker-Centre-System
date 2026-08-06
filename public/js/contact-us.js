document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contact-form");

  if (!contactForm) {
    return;
  }

  const submitButton = document.getElementById("submitbtn");

  const targetTypeSelect = document.getElementById("target-type");

  const targetSelectionGroup = document.getElementById(
    "target-selection-group",
  );

  const targetIDSelect = document.getElementById("target-id");

  const targetSelectionLabel = document.getElementById(
    "target-selection-label",
  );

  const targetHelpText = document.getElementById("target-help-text");

  let contactTargets = {
    hawkerCentres: [],
    stalls: [],
    operators: [],
  };

  function resetTargetSelection() {
    targetIDSelect.innerHTML = `
      <option value="">
        Select an option
      </option>
    `;

    targetIDSelect.value = "";
  }

  function createTargetOption(item, targetType) {
    const option = document.createElement("option");

    option.value = item.id;

    if (targetType === "Stall") {
      option.textContent = `${item.name} - ${item.hawkerCentreName}`;
    } else {
      option.textContent = item.name;
    }

    return option;
  }

  function updateTargetSelection() {
    const targetType = targetTypeSelect.value;

    resetTargetSelection();

    if (!targetType || targetType === "General") {
      targetSelectionGroup.hidden = true;
      targetIDSelect.required = false;

      targetHelpText.textContent =
        targetType === "General"
          ? "Your message will be sent to the HawkerSG support team."
          : "Choose who your message is about.";

      return;
    }

    targetSelectionGroup.hidden = false;
    targetIDSelect.required = true;

    let targetItems = [];

    if (targetType === "Stall") {
      targetSelectionLabel.textContent = "Select Stall";

      targetHelpText.textContent =
        "Choose the stall that your submission concerns.";

      targetItems = contactTargets.stalls;
    }

    if (targetType === "HawkerCentre") {
      targetSelectionLabel.textContent = "Select Hawker Centre";

      targetHelpText.textContent =
        "Choose the hawker centre that your submission concerns.";

      targetItems = contactTargets.hawkerCentres;
    }

    if (targetType === "Operator") {
      targetSelectionLabel.textContent = "Select Operator";

      targetHelpText.textContent =
        "Choose the operator that your submission concerns.";

      targetItems = contactTargets.operators;
    }

    targetItems.forEach((item) => {
      const option = createTargetOption(item, targetType);

      targetIDSelect.appendChild(option);
    });

    if (targetItems.length === 0) {
      targetIDSelect.innerHTML = `
        <option value="">
          No options available
        </option>
      `;
    }
  }

  async function loadContactTargets() {
    try {
      const response = await fetch("/contact-submissions/targets");

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to load contact targets");
      }

      contactTargets = data;

      updateTargetSelection();
    } catch (error) {
      console.error("Load contact targets error:", error);

      targetHelpText.textContent =
        "Unable to load target options. General submissions are still available.";
    }
  }

  targetTypeSelect.addEventListener("change", updateTargetSelection);

  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();

    const email = document.getElementById("email").value.trim();

    const subject = document.getElementById("subject").value.trim();

    const submissionType = document.getElementById("submission-type").value;

    const targetType = targetTypeSelect.value;

    const targetID = targetIDSelect.value
      ? parseInt(targetIDSelect.value)
      : null;

    const message = document.getElementById("message").value.trim();

    const customerID = sessionStorage.getItem("customerID");

    let stallID = null;
    let hawkerCentreID = null;
    let operatorID = null;

    if (targetType === "Stall") {
      stallID = targetID;
    }

    if (targetType === "HawkerCentre") {
      hawkerCentreID = targetID;
    }

    if (targetType === "Operator") {
      operatorID = targetID;
    }

    const submissionData = {
      customerID: customerID ? parseInt(customerID) : null,

      name,
      email,
      subject,
      submissionType,
      targetType,
      stallID,
      hawkerCentreID,
      operatorID,
      message,
    };

    try {
      submitButton.disabled = true;
      submitButton.value = "Submitting...";

      const response = await fetch("/contact-submissions", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        }, // sending a post request to the backend with the submission data in JSON format
        // asking the server (app.js) to handle the request

        body: JSON.stringify(submissionData),
      }); // send the submission data to the backend

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to submit form");
      }

      alert("Your submission has been sent successfully.");

      contactForm.reset();

      targetSelectionGroup.hidden = true;

      targetIDSelect.required = false;

      targetHelpText.textContent = "Choose who your message is about.";
    } catch (error) {
      console.error("Contact submission error:", error);

      alert(error.message);
    } finally {
      submitButton.disabled = false;
      submitButton.value = "Submit";
    }
  });

  loadContactTargets();
});