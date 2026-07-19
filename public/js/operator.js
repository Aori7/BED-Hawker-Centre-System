document.addEventListener("DOMContentLoaded", () => {

    // ==================================================
    // HAWKER PAGE
    // ==================================================
  
    if (document.getElementById("pieChart")) {
  
      const hawkerSelect = document.getElementById("hawkerCentreSelect");
      const metricSelect = document.getElementById("metricSelect");
  
      const hawkerNameEl = document.querySelector(".hawker-details h3");
      const hawkerDescEl = document.querySelector(".hawker-desc");
      const hawkerImgEl = document.querySelector(".hawker-img img");
  
      const chartSummary = document.getElementById("chartSummary");
  
      const canvas = document.getElementById("pieChart");
      const ctx = canvas.getContext("2d");
  
      let map = null;
      let marker = null;
  
      if (document.getElementById("map")) {
        map = L.map("map").setView([1.2800, 103.8500], 14);
  
        L.tileLayer(
          "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
          {
            attribution: "&copy; OpenStreetMap contributors"
          }
        ).addTo(map);
      }
  
      const hawkers = {
        laupasat: {
          name: "Lau Pa Sat",
          desc: "Lau Pa Sat is a historic food market in the CBD.",
          img: "images/bg-img2.jpg",
          latlng: [1.2800, 103.8500],
          metrics: {
            profitLost: { aLabel: "Profit", a: 55, bLabel: "Lost", b: 45 },
            reviews: { aLabel: "Positive", a: 70, bLabel: "Negative", b: 30 },
            hygiene: { aLabel: "A", a: 80, bLabel: "Non-A", b: 20 }
          }
        },
  
        maxwell: {
          name: "Maxwell Food Centre",
          desc: "Maxwell Food Centre near Chinatown.",
          img: "images/bg-img2.jpg",
          latlng: [1.2802, 103.8443],
          metrics: {
            profitLost: { aLabel: "Profit", a: 65, bLabel: "Lost", b: 35 },
            reviews: { aLabel: "Positive", a: 60, bLabel: "Negative", b: 40 },
            hygiene: { aLabel: "A", a: 75, bLabel: "Non-A", b: 25 }
          }
        },
  
        tanjongpagar: {
          name: "Tanjong Pagar Plaza",
          desc: "Neighbourhood hawker centre.",
          img: "images/bg-img2.jpg",
          latlng: [1.2766, 103.8435],
          metrics: {
            profitLost: { aLabel: "Profit", a: 58, bLabel: "Lost", b: 42 },
            reviews: { aLabel: "Positive", a: 68, bLabel: "Negative", b: 32 },
            hygiene: { aLabel: "A", a: 70, bLabel: "Non-A", b: 30 }
          }
        }
      };
  
      function drawPie(a, b) {
        const total = a + b;
        const ratio = a / total;
  
        const cx = canvas.width / 2;
        const cy = canvas.height / 2;
        const r = 110;
  
        ctx.clearRect(0, 0, canvas.width, canvas.height);
  
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = "#111";
        ctx.fill();
  
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(
          cx,
          cy,
          r,
          -Math.PI / 2,
          -Math.PI / 2 + Math.PI * 2 * ratio
        );
        ctx.fillStyle = "#ff8c1a";
        ctx.fill();
      }
  
      function updateSummary(metric) {
        chartSummary.innerHTML = `
          <p><strong>${metric.aLabel}</strong> - ${metric.a}</p>
          <p><strong>${metric.bLabel}</strong> - ${metric.b}</p>
        `;
      }
  
      let currentHawker = "laupasat";
  
      function renderMetric() {
        const metric = hawkers[currentHawker].metrics[
          metricSelect.value
        ];
  
        drawPie(metric.a, metric.b);
        updateSummary(metric);
      }
  
      function setHawker(key) {
        currentHawker = key;
  
        const hawker = hawkers[key];
  
        hawkerNameEl.textContent = hawker.name;
        hawkerDescEl.textContent = hawker.desc;
  
        hawkerImgEl.src = hawker.img;
        hawkerImgEl.alt = hawker.name;
  
        if (map) {
          map.setView(hawker.latlng, 15);
  
          if (marker) {
            map.removeLayer(marker);
          }
  
          marker = L.marker(hawker.latlng)
            .addTo(map)
            .bindPopup(hawker.name);
        }
  
        renderMetric();
      }
  
      hawkerSelect.addEventListener("change", (e) => {
        setHawker(e.target.value);
      });
  
      metricSelect.addEventListener("change", renderMetric);
  
      setHawker("laupasat");
    }
  
    // ==================================================
    // PROFILE PAGE
    // ==================================================
  
    if (document.getElementById("displayName")) {
  
      const STORAGE_KEY = "hawkersg_operator_profile_v1";
  
      const state = JSON.parse(
        localStorage.getItem(STORAGE_KEY)
      ) || {
        name: "XXXX",
        role: "Operator",
        email: "XXXX@gmail.com",
        phone: "12345678",
        managed: "X",
        leasesActive: "X",
        upcomingPayments: "X",
        expiringSoon: "X"
      };
  
      function saveState() {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(state)
        );
      }
  
      function render() {
        document.getElementById("displayName").textContent = state.name;
        document.getElementById("displayRole").textContent = state.role;
  
        document.getElementById("infoName").textContent = state.name;
        document.getElementById("infoEmail").textContent = state.email;
        document.getElementById("infoPhone").textContent = state.phone;
        document.getElementById("infoManaged").textContent = state.managed;
  
        document.getElementById("leaseActive").textContent =
          state.leasesActive;
  
        document.getElementById("leasePayments").textContent =
          state.upcomingPayments;
  
        document.getElementById("leaseExpiring").textContent =
          state.expiringSoon;
      }
  
      document
        .getElementById("btnEditPersonal")
        ?.addEventListener("click", () => {
  
          state.name =
            prompt("Name", state.name) || state.name;
  
          state.email =
            prompt("Email", state.email) || state.email;
  
          state.phone =
            prompt("Phone", state.phone) || state.phone;
  
          saveState();
          render();
        });
  
      render();
    }
  
    // ==================================================
    // SCHEDULE PAGE
    // ==================================================
  
    if (document.getElementById("calendarGrid")) {
  
      const STORAGE_CLEANING =
        "hawkersg_cleaning_calendar";
  
      const STORAGE_MAINTENANCE =
        "hawkersg_maintenance_calendar";
  
      function createCalendar(config) {
  
        let currentDate = new Date();
  
        let events =
          JSON.parse(
            localStorage.getItem(config.storageKey)
          ) || {};
  
        function render() {
  
          config.gridEl.innerHTML = "";
  
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();
  
          config.titleEl.textContent =
            currentDate.toLocaleString(
              "default",
              {
                month: "long",
                year: "numeric"
              }
            );
  
          const firstDay =
            new Date(year, month, 1).getDay();
  
          const daysInMonth =
            new Date(year, month + 1, 0).getDate();
  
          for (let i = 0; i < firstDay; i++) {
            config.gridEl.appendChild(
              document.createElement("div")
            );
          }
  
          for (let day = 1; day <= daysInMonth; day++) {
  
            const dateKey =
              `${year}-${month + 1}-${day}`;
  
            const cell =
              document.createElement("div");
  
            cell.className = "calendar-day";
  
            cell.innerHTML =
              `<div class="date">${day}</div>`;
  
            if (events[dateKey]) {
              events[dateKey].forEach(text => {
                cell.innerHTML +=
                  `<div class="event">${text}</div>`;
              });
            }
  
            cell.addEventListener("click", () => {
  
              const title =
                prompt(config.promptText);
  
              if (!title) return;
  
              if (!events[dateKey]) {
                events[dateKey] = [];
              }
  
              events[dateKey].push(title);
  
              localStorage.setItem(
                config.storageKey,
                JSON.stringify(events)
              );
  
              render();
            });
  
            config.gridEl.appendChild(cell);
          }
        }
  
        config.prevBtn.addEventListener(
          "click",
          () => {
            currentDate.setMonth(
              currentDate.getMonth() - 1
            );
            render();
          }
        );
  
        config.nextBtn.addEventListener(
          "click",
          () => {
            currentDate.setMonth(
              currentDate.getMonth() + 1
            );
            render();
          }
        );
  
        render();
      }
  
      createCalendar({
        gridEl: document.getElementById("calendarGrid"),
        titleEl: document.getElementById("monthYear"),
        prevBtn: document.getElementById("prevMonth"),
        nextBtn: document.getElementById("nextMonth"),
        promptText: "Add cleaning event:",
        storageKey: STORAGE_CLEANING
      });
  
      createCalendar({
        gridEl: document.getElementById("maintenanceCalendarGrid"),
        titleEl: document.getElementById("monthYearMaintenance"),
        prevBtn: document.getElementById("prevMonthMaintenance"),
        nextBtn: document.getElementById("nextMonthMaintenance"),
        promptText: "Add maintenance event:",
        storageKey: STORAGE_MAINTENANCE
      });
    }
  
  });