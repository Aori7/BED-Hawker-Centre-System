document.addEventListener("DOMContentLoaded", () => {
  const API_BASE_URL = "http://localhost:3000";

  const operatorID =
    Number(localStorage.getItem("operatorID")) || 1;

  // Your protected routes require this token.
  const accessToken =
    localStorage.getItem("accessToken");

  const hawkerCentres = {
    laupasat: {
      id: 1,
      name: "Lau Pa Sat",
      description:
        "Lau Pa Sat is a historic food market in the CBD.",
      image: "../images/bg-img2.jpg"
    },

    maxwell: {
      id: 2,
      name: "Maxwell Food Centre",
      description:
        "Maxwell Food Centre is located near Chinatown.",
      image: "../images/bg-img2.jpg"
    },

    tanjongpagar: {
      id: 3,
      name: "Tanjong Pagar Plaza",
      description:
        "Tanjong Pagar Plaza is a neighbourhood hawker centre.",
      image: "../images/bg-img2.jpg"
    }
  };

  // ==================================================
  // SHARED API FUNCTIONS
  // ==================================================

  function getHeaders(hasBody = false) {
    const headers = {};

    if (hasBody) {
      headers["Content-Type"] = "application/json";
    }

    if (accessToken) {
      headers.Authorization = `Bearer ${accessToken}`;
    }

    return headers;
  }

  async function apiRequest(path, options = {}) {
    const response = await fetch(
      `${API_BASE_URL}${path}`,
      {
        ...options,

        headers: {
          ...getHeaders(Boolean(options.body)),
          ...(options.headers || {})
        }
      }
    );

    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
        data?.message ||
        `Request failed with status ${response.status}`
      );
    }

    return data;
  }

  function formatDate(value) {
    if (!value) {
      return "N/A";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString("en-SG", {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
  }

  function formatTime(value) {
    if (!value) {
      return "";
    }

    const text = String(value);

    if (/^\d{2}:\d{2}/.test(text)) {
      return text.slice(0, 5);
    }

    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date.toLocaleTimeString("en-SG", {
        hour: "2-digit",
        minute: "2-digit"
      });
    }

    return text;
  }

  function getDateKey(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, "0");

    const day = String(
      date.getDate()
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function getHawkerKey(value) {
    if (hawkerCentres[value]) {
      return value;
    }

    const numericID = Number(value);

    const match =
      Object.entries(hawkerCentres).find(
        ([, centre]) =>
          centre.id === numericID
      );

    return match?.[0] || "laupasat";
  }

  function startOfToday() {
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    return today;
  }

  // ==================================================
  // LOGOUT
  // ==================================================

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("operatorID");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");

    sessionStorage.clear();

    window.location.href = "login.html";
  }

  document
    .getElementById("login-btn")
    ?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        logout();
      }
    );

  document
    .getElementById("logout-btn")
    ?.addEventListener(
      "click",
      logout
    );

  document
    .getElementById("login-link")
    ?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        logout();
      }
    );

  // ==================================================
  // HOME PAGE — ANNOUNCEMENTS
  // ==================================================

  const announcementPanel =
    document.querySelector(
      ".announcement-panel"
    );

  if (announcementPanel) {
    loadAnnouncements();
  }

  async function loadAnnouncements() {
    try {
      const announcements =
        await apiRequest(
          "/announcements"
        );

      const activeAnnouncements =
        announcements
          .filter((announcement) => {
            const status =
              String(
                announcement.Status || ""
              ).toLowerCase();

            return (
              !status ||
              status === "active"
            );
          })
          .slice(0, 5);

      announcementPanel.innerHTML =
        "<h2>Announcements</h2>";

      if (
        activeAnnouncements.length === 0
      ) {
        announcementPanel.insertAdjacentHTML(
          "beforeend",
          `
            <div class="announcement-item">
              <p>No active announcements.</p>
            </div>
          `
        );

        return;
      }

      activeAnnouncements.forEach(
        (announcement) => {
          const item =
            document.createElement("div");

          item.className =
            "announcement-item";

          item.innerHTML = `
            <strong>
              📢 ${escapeHtml(
                announcement.Title
              )}
            </strong>

            <p>
              ${escapeHtml(
                announcement.Content
              )}
            </p>

            <small>
              Posted by
              ${escapeHtml(
                announcement.CreatedBy ||
                "Management"
              )}

              ${
                announcement.ExpiryDate
                  ? ` • Expires ${formatDate(
                      announcement.ExpiryDate
                    )}`
                  : ""
              }
            </small>
          `;

          announcementPanel.appendChild(
            item
          );
        }
      );
    } catch (error) {
      announcementPanel.innerHTML = `
        <h2>Announcements</h2>

        <div class="announcement-item">
          <p>
            Unable to load announcements:
            ${escapeHtml(error.message)}
          </p>
        </div>
      `;

      console.error(error);
    }
  }

  // ==================================================
  // HAWKER STATISTICS PAGE
  // LEAFLET IS NOT INITIALISED HERE
  // ==================================================

  const pieCanvas =
    document.getElementById("pieChart");

  if (pieCanvas) {
    initialiseDashboardPage();
  }

  function initialiseDashboardPage() {
    const hawkerSelect =
      document.getElementById(
        "hawkerCentreSelect"
      );

    const metricSelect =
      document.getElementById(
        "metricSelect"
      );

    const hawkerName =
      document.querySelector(
        ".hawker-details h3"
      );

    const hawkerDescription =
      document.querySelector(
        ".hawker-desc"
      );

    const hawkerImage =
      document.querySelector(
        ".hawker-img img"
      );

    const chartSummary =
      document.getElementById(
        "chartSummary"
      );

    const chartClickInfo =
      document.getElementById(
        "chartClickInfo"
      );

    const context =
      pieCanvas.getContext("2d");

    let dashboardData = null;
    let pieSegments = [];

    function drawPie(segments) {
      const safeSegments =
        segments.map((segment) => ({
          ...segment,

          value: Math.max(
            0,
            Number(segment.value) || 0
          )
        }));

      pieSegments = safeSegments;

      const total =
        safeSegments.reduce(
          (sum, segment) =>
            sum + segment.value,
          0
        );

      const centreX =
        pieCanvas.width / 2;

      const centreY =
        pieCanvas.height / 2;

      const radius =
        Math.min(
          pieCanvas.width,
          pieCanvas.height
        ) * 0.4;

      context.clearRect(
        0,
        0,
        pieCanvas.width,
        pieCanvas.height
      );

      if (total === 0) {
        context.beginPath();

        context.arc(
          centreX,
          centreY,
          radius,
          0,
          Math.PI * 2
        );

        context.fillStyle = "#dddddd";
        context.fill();

        context.fillStyle = "#333333";
        context.font =
          "16px Archivo, sans-serif";
        context.textAlign = "center";
        context.textBaseline = "middle";

        context.fillText(
          "No data",
          centreX,
          centreY
        );

        return;
      }

      const colours = [
        "#ff8c1a",
        "#111111",
        "#f2c14e",
        "#5c8001",
        "#9c89b8"
      ];

      let startAngle =
        -Math.PI / 2;

      safeSegments.forEach(
        (segment, index) => {
          const sliceAngle =
            (
              segment.value /
              total
            ) *
            Math.PI *
            2;

          context.beginPath();
          context.moveTo(
            centreX,
            centreY
          );

          context.arc(
            centreX,
            centreY,
            radius,
            startAngle,
            startAngle + sliceAngle
          );

          context.closePath();

          context.fillStyle =
            colours[
              index % colours.length
            ];

          context.fill();

          segment.startAngle =
            startAngle;

          segment.endAngle =
            startAngle +
            sliceAngle;

          startAngle += sliceAngle;
        }
      );
    }

    function displaySummary(items) {
      chartSummary.innerHTML =
        items
          .map(
            (item) => `
              <p>
                <strong>
                  ${escapeHtml(item.label)}
                </strong>
                -
                ${escapeHtml(item.value)}
              </p>
            `
          )
          .join("");
    }

    function renderSelectedMetric() {
      if (!dashboardData) {
        return;
      }

      const selectedMetric =
        metricSelect.value;

      if (
        selectedMetric ===
          "profitLost" ||
        selectedMetric ===
          "profitLoss"
      ) {
        const revenue =
          Number(
            dashboardData.profitLoss
              .totalRevenue || 0
          );

        const expenses =
          Number(
            dashboardData.profitLoss
              .totalExpenses || 0
          );

        const net =
          Number(
            dashboardData.profitLoss
              .netProfitLoss || 0
          );

        drawPie([
          {
            label: "Revenue",
            value: revenue
          },

          {
            label: "Expenses",
            value: expenses
          }
        ]);

        displaySummary([
          {
            label: "Revenue",
            value: `$${revenue.toFixed(2)}`
          },

          {
            label: "Expenses",
            value: `$${expenses.toFixed(2)}`
          },

          {
            label: "Net Profit/Loss",
            value: `$${net.toFixed(2)}`
          }
        ]);

        return;
      }

      if (
        selectedMetric === "reviews"
      ) {
        const reviews =
          dashboardData.reviews;

        const resolved =
          Number(
            reviews.resolvedComplaints ||
            0
          );

        const pending =
          Number(
            reviews.pendingComplaints ||
            0
          );

        const inProgress =
          Number(
            reviews.inProgressComplaints ||
            0
          );

        const closed =
          Number(
            reviews.closedComplaints ||
            0
          );

        drawPie([
          {
            label: "Resolved",
            value: resolved
          },

          {
            label: "Pending",
            value: pending
          },

          {
            label: "In Progress",
            value: inProgress
          },

          {
            label: "Closed",
            value: closed
          }
        ]);

        displaySummary([
          {
            label: "Total Complaints",
            value: String(
              reviews.totalComplaints ||
              0
            )
          },

          {
            label: "Resolved",
            value: String(resolved)
          },

          {
            label: "Pending",
            value: String(pending)
          },

          {
            label: "In Progress",
            value: String(inProgress)
          },

          {
            label: "Closed",
            value: String(closed)
          }
        ]);

        return;
      }

      const hygiene =
        dashboardData.hygieneGrades;

      const gradeA =
        Number(hygiene.gradeA || 0);

      const gradeB =
        Number(hygiene.gradeB || 0);

      const gradeC =
        Number(hygiene.gradeC || 0);

      const gradeD =
        Number(hygiene.gradeD || 0);

      drawPie([
        {
          label: "Grade A",
          value: gradeA
        },

        {
          label: "Grade B",
          value: gradeB
        },

        {
          label: "Grade C",
          value: gradeC
        },

        {
          label: "Grade D",
          value: gradeD
        }
      ]);

      displaySummary([
        {
          label: "Total Inspections",
          value: String(
            hygiene.totalInspections ||
            0
          )
        },

        {
          label: "Average Score",
          value: Number(
            hygiene
              .averageInspectionScore ||
            0
          ).toFixed(1)
        },

        {
          label: "Grade A",
          value: String(gradeA)
        },

        {
          label: "Grade B",
          value: String(gradeB)
        },

        {
          label: "Grade C",
          value: String(gradeC)
        },

        {
          label: "Grade D",
          value: String(gradeD)
        }
      ]);
    }

    async function loadDashboard(
      hawkerCentreID
    ) {
      chartSummary.innerHTML = `
        <p>Loading statistics...</p>
      `;

      chartClickInfo.textContent = "";

      try {
        dashboardData =
          await apiRequest(
            `/operator-dashboard/${operatorID}/hawker-centre/${hawkerCentreID}`
          );

        renderSelectedMetric();
      } catch (error) {
        dashboardData = null;

        drawPie([]);

        chartSummary.innerHTML = `
          <p>Unable to load statistics.</p>
        `;

        chartClickInfo.textContent =
          error.message;

        console.error(error);
      }
    }

    function selectHawker(value) {
      const key =
        getHawkerKey(value);

      const hawker =
        hawkerCentres[key];

      hawkerName.textContent =
        hawker.name;

      hawkerDescription.textContent =
        hawker.description;

      hawkerImage.src =
        hawker.image;

      hawkerImage.alt =
        hawker.name;

      // Leaflet remains controlled by leaflet.js.
      loadDashboard(hawker.id);
    }

    hawkerSelect.addEventListener(
      "change",
      (event) => {
        selectHawker(
          event.target.value
        );
      }
    );

    metricSelect.addEventListener(
      "change",
      renderSelectedMetric
    );

    pieCanvas.addEventListener(
      "click",
      (event) => {
        if (!pieSegments.length) {
          return;
        }

        const rectangle =
          pieCanvas.getBoundingClientRect();

        const scaleX =
          pieCanvas.width /
          rectangle.width;

        const scaleY =
          pieCanvas.height /
          rectangle.height;

        const x =
          (
            event.clientX -
            rectangle.left
          ) *
          scaleX;

        const y =
          (
            event.clientY -
            rectangle.top
          ) *
          scaleY;

        const centreX =
          pieCanvas.width / 2;

        const centreY =
          pieCanvas.height / 2;

        const radius =
          Math.min(
            pieCanvas.width,
            pieCanvas.height
          ) * 0.4;

        const distance =
          Math.sqrt(
            (x - centreX) ** 2 +
            (y - centreY) ** 2
          );

        if (distance > radius) {
          return;
        }

        let angle =
          Math.atan2(
            y - centreY,
            x - centreX
          );

        if (
          angle < -Math.PI / 2
        ) {
          angle += Math.PI * 2;
        }

        const selected =
          pieSegments.find(
            (segment) =>
              angle >=
                segment.startAngle &&
              angle <
                segment.endAngle
          );

        if (selected) {
          chartClickInfo.textContent =
            `${selected.label}: ${selected.value}`;
        }
      }
    );

    const initialValue =
      hawkerSelect.value &&
      hawkerSelect.value !== ""
        ? hawkerSelect.value
        : "laupasat";

    selectHawker(initialValue);
  }

  // ==================================================
  // PROFILE PAGE
  // ==================================================

  if (
    document.getElementById(
      "displayName"
    )
  ) {
    initialiseProfilePage();
  }

  function initialiseProfilePage() {
    const displayName =
      document.getElementById(
        "displayName"
      );

    const displayRole =
      document.getElementById(
        "displayRole"
      );

    const infoName =
      document.getElementById(
        "infoName"
      );

    const infoEmail =
      document.getElementById(
        "infoEmail"
      );

    const infoPhone =
      document.getElementById(
        "infoPhone"
      );

    const infoManaged =
      document.getElementById(
        "infoManaged"
      );

    const leaseActive =
      document.getElementById(
        "leaseActive"
      );

    const leasePayments =
      document.getElementById(
        "leasePayments"
      );

    const leaseExpiring =
      document.getElementById(
        "leaseExpiring"
      );

    const modalBackdrop =
      document.getElementById(
        "modalBackdrop"
      );

    const modalForm =
      document.getElementById(
        "modalForm"
      );

    const modalTitle =
      document.getElementById(
        "modalTitle"
      );

    const rentalTableSection =
      document.getElementById(
        "rentalTableSection"
      );

    const rentalTableBody =
      document.getElementById(
        "rentalTableBody"
      );

    const viewLeasesButton =
      document.getElementById(
        "btnViewLeases"
      );

    let operatorProfile = null;
    let rentalAgreements = [];
    let tableLoaded = false;

    async function loadProfile() {
      try {
        operatorProfile =
          await apiRequest(
            `/operators/${operatorID}`
          );

        displayName.textContent =
          operatorProfile.OperatorName ||
          "Operator";

        displayRole.textContent =
          "Operator";

        infoName.textContent =
          operatorProfile.OperatorName ||
          "N/A";

        infoEmail.textContent =
          localStorage.getItem(
            "userEmail"
          ) ||
          "Not available";

        infoPhone.textContent =
          operatorProfile.ContactNo ||
          "N/A";

        infoManaged.textContent =
          localStorage.getItem(
            "hawkerCentresManaged"
          ) ||
          Object.keys(
            hawkerCentres
          ).length;

        await loadRentalStatistics();
      } catch (error) {
        console.error(
          "Unable to load operator profile:",
          error
        );
      }
    }

    async function loadRentalStatistics() {
      try {
        const agreements =
          await apiRequest(
            "/rental-agreements"
          );

        rentalAgreements =
          agreements.filter(
            (agreement) =>
              Number(
                agreement.OperatorID
              ) === operatorID
          );

        const now = new Date();

        const thirtyDaysLater =
          new Date();

        thirtyDaysLater.setDate(
          now.getDate() + 30
        );

        const active =
          rentalAgreements.filter(
            (agreement) =>
              agreement
                .AgreementStatus ===
              "Active"
          );

        const pending =
          rentalAgreements.filter(
            (agreement) =>
              agreement
                .AgreementStatus ===
              "Pending"
          );

        const expiring =
          active.filter(
            (agreement) => {
              const endDate =
                new Date(
                  agreement.EndDate
                );

              return (
                endDate >= now &&
                endDate <=
                  thirtyDaysLater
              );
            }
          );

        leaseActive.textContent =
          active.length;

        leasePayments.textContent =
          pending.length;

        leaseExpiring.textContent =
          expiring.length;
      } catch (error) {
        leaseActive.textContent = "—";
        leasePayments.textContent = "—";
        leaseExpiring.textContent = "—";

        console.error(
          "Unable to load rental statistics:",
          error
        );
      }
    }

    function renderRentalTable() {
      rentalTableBody.innerHTML = "";

      if (
        rentalAgreements.length === 0
      ) {
        rentalTableBody.innerHTML = `
          <tr>
            <td colspan="9">
              No rental agreements found.
            </td>
          </tr>
        `;

        return;
      }

      rentalAgreements.forEach(
        (agreement) => {
          const row =
            document.createElement("tr");

          row.innerHTML = `
            <td>
              ${escapeHtml(
                agreement.AgreementID
              )}
            </td>

            <td>
              ${escapeHtml(
                agreement.StallName ||
                agreement.StallID ||
                "N/A"
              )}
            </td>

            <td>
              ${escapeHtml(
                agreement.StallUnitNo ||
                "N/A"
              )}
            </td>

            <td>
              ${escapeHtml(
                agreement.HCName ||
                agreement
                  .HawkerCentreID ||
                "N/A"
              )}
            </td>

            <td>
              ${escapeHtml(
                agreement.OwnerName ||
                agreement.OwnerID ||
                "N/A"
              )}
            </td>

            <td>
              ${formatDate(
                agreement.StartDate
              )}
            </td>

            <td>
              ${formatDate(
                agreement.EndDate
              )}
            </td>

            <td>
              $${Number(
                agreement.RentalPrice ||
                0
              ).toFixed(2)}
            </td>

            <td>
              ${escapeHtml(
                agreement
                  .AgreementStatus ||
                "Unknown"
              )}
            </td>
          `;

          rentalTableBody.appendChild(
            row
          );
        }
      );

      tableLoaded = true;
    }

    viewLeasesButton
      ?.addEventListener(
        "click",
        async () => {
          if (!rentalTableSection) {
            return;
          }

          const currentlyHidden =
            rentalTableSection.style
              .display === "none" ||
            getComputedStyle(
              rentalTableSection
            ).display === "none";

          if (currentlyHidden) {
            rentalTableSection.style
              .display = "block";

            viewLeasesButton.textContent =
              "Hide Leases";

            if (!tableLoaded) {
              if (
                rentalAgreements.length ===
                0
              ) {
                await loadRentalStatistics();
              }

              renderRentalTable();
            }
          } else {
            rentalTableSection.style
              .display = "none";

            viewLeasesButton.textContent =
              "View All Leases";
          }
        }
      );

    function openEditModal() {
      if (!operatorProfile) {
        return;
      }

      modalTitle.textContent =
        "Edit Personal Information";

      modalForm.innerHTML = `
        <label>
          Operator Name

          <input
            id="editOperatorName"
            type="text"
            value="${escapeHtml(
              operatorProfile
                .OperatorName || ""
            )}"
            maxlength="100"
            required
          >
        </label>

        <label>
          Contact Person

          <input
            id="editContactPerson"
            type="text"
            value="${escapeHtml(
              operatorProfile
                .ContactPerson || ""
            )}"
            maxlength="100"
            required
          >
        </label>

        <label>
          Contact Number

          <input
            id="editContactNo"
            type="text"
            value="${escapeHtml(
              operatorProfile
                .ContactNo || ""
            )}"
            maxlength="8"
            pattern="[0-9]{8}"
            required
          >
        </label>
      `;

      modalBackdrop.style.display =
        "flex";

      modalBackdrop.setAttribute(
        "aria-hidden",
        "false"
      );
    }

    function closeEditModal() {
      modalBackdrop.style.display =
        "none";

      modalBackdrop.setAttribute(
        "aria-hidden",
        "true"
      );

      modalForm.innerHTML = "";
    }

    async function updateProfile(
      event
    ) {
      event.preventDefault();

      const payload = {
        OperatorName:
          document
            .getElementById(
              "editOperatorName"
            )
            .value.trim(),

        ContactPerson:
          document
            .getElementById(
              "editContactPerson"
            )
            .value.trim(),

        ContactNo:
          document
            .getElementById(
              "editContactNo"
            )
            .value.trim()
      };

      try {
        const result =
          await apiRequest(
            `/operators/${operatorID}`,
            {
              method: "PUT",

              body:
                JSON.stringify(
                  payload
                )
            }
          );

        operatorProfile =
          result.data;

        closeEditModal();
        await loadProfile();

        alert(
          "Profile updated successfully."
        );
      } catch (error) {
        alert(
          `Unable to update profile: ${error.message}`
        );
      }
    }

    document
      .getElementById(
        "btnEditProfile"
      )
      ?.addEventListener(
        "click",
        openEditModal
      );

    document
      .getElementById(
        "btnEditPersonal"
      )
      ?.addEventListener(
        "click",
        openEditModal
      );

    document
      .getElementById(
        "btnCloseModal"
      )
      ?.addEventListener(
        "click",
        closeEditModal
      );

    document
      .getElementById(
        "btnCancelModal"
      )
      ?.addEventListener(
        "click",
        closeEditModal
      );

    modalBackdrop
      ?.addEventListener(
        "click",
        (event) => {
          if (
            event.target ===
            modalBackdrop
          ) {
            closeEditModal();
          }
        }
      );

    modalForm
      ?.addEventListener(
        "submit",
        updateProfile
      );

    loadProfile();
  }

  // ==================================================
  // SCHEDULE PAGE
  // ==================================================

  if (
    document.getElementById(
      "calendarGrid"
    )
  ) {
    initialiseSchedulePage();
  }

  function initialiseSchedulePage() {
    const hawkerSelect =
      document.getElementById(
        "hawkerCentreSelect"
      );

    const lists =
      document.querySelectorAll(
        ".bullet-list"
      );

    const cleaningList = lists[0];
    const inspectionList = lists[1];

    let hawkerCentreID = 1;

    let cleaningSchedules = [];
    let maintenanceSchedules = [];
    let inspections = [];

    const cleaningCalendar =
      createCalendar({
        gridElement:
          document.getElementById(
            "calendarGrid"
          ),

        titleElement:
          document.getElementById(
            "monthYear"
          ),

        previousButton:
          document.getElementById(
            "prevMonth"
          ),

        nextButton:
          document.getElementById(
            "nextMonth"
          ),

        getEvents: () =>
          cleaningSchedules.map(
            (schedule) => ({
              date:
                schedule.ScheduledDate,

              title:
                schedule.CleaningTitle,

              status:
                schedule.Status
            })
          )
      });

    const maintenanceCalendar =
      createCalendar({
        gridElement:
          document.getElementById(
            "maintenanceCalendarGrid"
          ),

        titleElement:
          document.getElementById(
            "monthYearMaintenance"
          ),

        previousButton:
          document.getElementById(
            "prevMonthMaintenance"
          ),

        nextButton:
          document.getElementById(
            "nextMonthMaintenance"
          ),

        getEvents: () =>
          maintenanceSchedules.map(
            (schedule) => ({
              date:
                schedule.ScheduledDate,

              title:
                schedule
                  .MaintenanceTitle,

              status:
                schedule.Status
            })
          )
      });

    async function loadSchedules() {
      try {
        const results =
          await Promise.all([
            apiRequest(
              "/cleaning-schedules"
            ),

            apiRequest(
              "/maintenance-schedules"
            ),

            apiRequest(
              `/inspections-schedules/hawker-centre/${hawkerCentreID}`
            )
          ]);

        cleaningSchedules =
          results[0].filter(
            (schedule) =>
              Number(
                schedule
                  .HawkerCentreID
              ) === hawkerCentreID
          );

        maintenanceSchedules =
          results[1].filter(
            (schedule) =>
              Number(
                schedule
                  .HawkerCentreID
              ) === hawkerCentreID
          );

        inspections = results[2];

        cleaningCalendar.render();
        maintenanceCalendar.render();

        renderCleaningList();
        renderInspectionList();
      } catch (error) {
        console.error(
          "Unable to load schedules:",
          error
        );

        cleaningList.innerHTML = `
          <li>
            Unable to load schedules:
            ${escapeHtml(error.message)}
          </li>
        `;
      }
    }

    function renderCleaningList() {
      const upcoming =
        cleaningSchedules
          .filter(
            (schedule) =>
              schedule.Status !==
                "Cancelled" &&
              new Date(
                schedule.ScheduledDate
              ) >= startOfToday()
          )
          .sort(
            (first, second) =>
              new Date(
                first.ScheduledDate
              ) -
              new Date(
                second.ScheduledDate
              )
          )
          .slice(0, 5);

      cleaningList.innerHTML = "";

      if (upcoming.length === 0) {
        cleaningList.innerHTML = `
          <li>
            No upcoming cleaning events.
          </li>
        `;

        return;
      }

      upcoming.forEach(
        (schedule) => {
          const item =
            document.createElement("li");

          const time =
            [
              formatTime(
                schedule.StartTime
              ),

              formatTime(
                schedule.EndTime
              )
            ]
              .filter(Boolean)
              .join("–");

          item.textContent =
            `${schedule.CleaningTitle} - ` +
            `${formatDate(
              schedule.ScheduledDate
            )}` +
            `${time ? ` (${time})` : ""}`;

          cleaningList.appendChild(
            item
          );
        }
      );
    }

    function renderInspectionList() {
      inspectionList.innerHTML = "";

      if (inspections.length === 0) {
        inspectionList.innerHTML = `
          <li>
            No inspection records found.
          </li>
        `;

        return;
      }

      inspections
        .sort(
          (first, second) =>
            new Date(
              second.InspectionDate
            ) -
            new Date(
              first.InspectionDate
            )
        )
        .slice(0, 5)
        .forEach((inspection) => {
          const item =
            document.createElement("li");

          item.textContent =
            `${
              inspection.StallName ||
              `Stall ${inspection.StallID}`
            } - ` +
            `${formatDate(
              inspection.InspectionDate
            )} - ` +
            `Grade ${
              inspection.HygieneGrade ||
              "N/A"
            } ` +
            `(${
              inspection
                .InspectionStatus ||
              "Unknown"
            })`;

          inspectionList.appendChild(
            item
          );
        });
    }

    hawkerSelect.addEventListener(
      "change",
      (event) => {
        const key =
          getHawkerKey(
            event.target.value
          );

        hawkerCentreID =
          hawkerCentres[key].id;

        loadSchedules();
      }
    );

    loadSchedules();
  }

  function createCalendar(config) {
    let currentMonth = new Date();

    function render() {
      const eventsByDate = {};

      config
        .getEvents()
        .forEach((event) => {
          const dateKey =
            getDateKey(event.date);

          if (!dateKey) {
            return;
          }

          if (
            !eventsByDate[dateKey]
          ) {
            eventsByDate[dateKey] =
              [];
          }

          eventsByDate[
            dateKey
          ].push(event);
        });

      config.gridElement.innerHTML =
        "";

      const year =
        currentMonth.getFullYear();

      const month =
        currentMonth.getMonth();

      config.titleElement.textContent =
        currentMonth.toLocaleString(
          "default",
          {
            month: "long",
            year: "numeric"
          }
        );

      const firstWeekday =
        new Date(
          year,
          month,
          1
        ).getDay();

      const daysInMonth =
        new Date(
          year,
          month + 1,
          0
        ).getDate();

      for (
        let index = 0;
        index < firstWeekday;
        index += 1
      ) {
        config.gridElement.appendChild(
          document.createElement("div")
        );
      }

      for (
        let day = 1;
        day <= daysInMonth;
        day += 1
      ) {
        const dateKey =
          `${year}-` +
          `${String(
            month + 1
          ).padStart(2, "0")}-` +
          `${String(day).padStart(
            2,
            "0"
          )}`;

        const cell =
          document.createElement("div");

        cell.className =
          "calendar-day";

        const date =
          document.createElement("div");

        date.className = "date";
        date.textContent = day;

        cell.appendChild(date);

        (
          eventsByDate[dateKey] ||
          []
        ).forEach((event) => {
          const eventElement =
            document.createElement("div");

          eventElement.className =
            "event";

          eventElement.textContent =
            `${event.title}` +
            `${
              event.status
                ? ` (${event.status})`
                : ""
            }`;

          cell.appendChild(
            eventElement
          );
        });

        config.gridElement.appendChild(
          cell
        );
      }
    }

    config.previousButton
      ?.addEventListener(
        "click",
        () => {
          currentMonth.setMonth(
            currentMonth.getMonth() -
            1
          );

          render();
        }
      );

    config.nextButton
      ?.addEventListener(
        "click",
        () => {
          currentMonth.setMonth(
            currentMonth.getMonth() +
            1
          );

          render();
        }
      );

    return {
      render
    };
  }
});