const express = require("express");
const sql = require("mssql"); // Assuming you've installed mssql
const dbConfig = require("./dbConfig");
// // Load environment variables
const dotenv = require("dotenv"); // ruimin
dotenv.config(); // ruimin

// Import - ada's
// const customerController = require("./controllers/customerController");
const customerRoutes = require("./routes/customerRoutes");
const authRoutes = require("./routes/authRoutes");
const hawkerCentreRoutes = require("./routes/hawkerCentreRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const foodStallRoutes = require("./routes/foodStallRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const orderRoutes = require("./routes/orderRoutes");
const contactSubmissionRoutes = require("./routes/contactSubmissionRoutes");
// Improt - vendor (rm's)
const vendorStallsRoutes = require("./routes/vendorStallsRoutes");
const vendorDashboardRoutes = require("./routes/vendorDashboardRoutes");
const vendorPromotionRoutes = require("./routes/vendorPromotionRoutes");
const vendorMenuRoutes = require("./routes/vendorMenuRoutes");
const vendorOrdersRoutes = require("./routes/vendorOrdersRoutes");
const vendorFeedbackRoutes = require("./routes/vendorFeedbackRoutes");
const vendorProfileRoutes = require("./routes/vendorProfileRoutes");
// Import - dayana's
const inspectionRoutes = require("./routes/inspectionRoutes");
const hygieneGradeRoutes = require("./routes/hygieneGradeRoutes");
const stallDetailsRoutes = require("./routes/stallDetailsRoutes");
// Import - calista's
const operatorRentalAgreementRoutes = require("./routes/operatorRentalAgreementRoutes");
const operatorAccountRoutes = require("./routes/operatorAccountRoutes");
const operatorAnnouncementRoutes = require("./routes/operatorAnnouncementRoutes");
const operatorMaintenanceRoutes = require("./routes/operatorMaintenanceRoutes");
const operatorCleaningRoutes = require("./routes/operatorCleaningRoutes");
const operatorInspectionRoutes = require("./routes/operatorInspectionRoutes");
const operatorDashboardRoutes = require("./routes/operatorDashboardRoutes");

//create express app
const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default port

//middleware
app.use(express.json()); // middleware inbuilt in express to recognize the incoming Request Object as a JSON Object.
app.use(express.urlencoded()); // middleware inbuilt in express to recognize the incoming Request Object as strings or arrays

app.use(express.static("public"));

//ada's
app.use("/customers", customerRoutes);
app.use("/auth", authRoutes);
app.use("/hawker-centres", hawkerCentreRoutes);
app.use("/food-stalls", foodStallRoutes);
app.use("/menu-items", menuItemRoutes);
app.use("/orders", orderRoutes);
app.use("/contact-submissions", contactSubmissionRoutes);
//calista's
app.use("/rental-agreements", operatorRentalAgreementRoutes);
app.use("/operators", operatorAccountRoutes);
app.use("/announcements",operatorAnnouncementRoutes);
app.use( "/maintenance-schedules",operatorMaintenanceRoutes);
app.use( "/cleaning-schedules",operatorCleaningRoutes);
app.use("/inspections-schedules",operatorInspectionRoutes);
app.use("/operator-dashboard",operatorDashboardRoutes);
//rui min's
app.use("/vendor-stalls", vendorStallsRoutes);
app.use("/vendor-dashboard", vendorDashboardRoutes);
app.use("/vendor-promotions", vendorPromotionRoutes);
app.use("/vendor-menu", vendorMenuRoutes);
app.use("/vendor-orders", vendorOrdersRoutes);
app.use("/vendor-feedback", vendorFeedbackRoutes);
app.use("/vendor-profile", vendorProfileRoutes);
//dayana's
app.use("/inspections", inspectionRoutes);
app.use("/hygiene-grades", hygieneGradeRoutes);
app.use("/stall-details", stallDetailsRoutes);
app.use("/dashboard", dashboardRoutes);

//start server
module.exports = app;

if (require.main === module) {
    app.listen(port, async () => {
        try {
            await sql.connect(dbConfig);
            console.log("Database connection established successfully");
        } catch (err) {
            console.error(err);
        }

        console.log(`Server listening on port ${port}`);
    });
}
// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});
