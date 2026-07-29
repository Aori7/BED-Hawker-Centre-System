const express = require("express");
const sql = require("mssql"); // Assuming you've installed mssql
const dbConfig = require("./dbConfig");
// // Load environment variables
<<<<<<< HEAD
const dotenv = require("dotenv"); // ruimin
dotenv.config();  // ruimin
=======
const dotenv = require("dotenv");
dotenv.config();
>>>>>>> 3a1493f9dc26ff4b86098cd3e4449df4fff7ba90

// Import - ada's
const customerController = require("./controllers/customerController");
const customerRoutes = require("./routes/customerRoutes");
const authRoutes = require("./routes/authRoutes");
const hawkerCentreRoutes = require("./routes/hawkerCentreRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const foodStallRoutes = require("./routes/foodStallRoutes");
const menuItemRoutes = require("./routes/menuItemRoutes");
const orderRoutes = require("./routes/orderRoutes");
const contactSubmissionRoutes = require("./routes/contactSubmissionRoutes");
// Improt - vendor (rm's)
const vendorDashboardRoutes = require("./routes/vendorDashboardRoutes");
const vendorPromotionRoutes = require("./routes/vendorPromotionRoutes");
// Import - dayana's
const inspectionRoutes = require("./routes/inspectionRoutes");
const hygieneGradeRoutes = require("./routes/hygieneGradeRoutes");
const stallDetailsRoutes = require("./routes/stallDetailsRoutes");


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
app.use("/dashboard", dashboardRoutes);

app.use("/food-stalls", foodStallRoutes);
app.use("/menu-items", menuItemRoutes);

app.use("/orders", orderRoutes);

app.use("/contact-submissions", contactSubmissionRoutes);
//calista's
//rui min's
app.use("/vendor-dashboard", vendorDashboardRoutes);
app.use("/vendor-promotions", vendorPromotionRoutes);
app.use()
//dayana's
app.use("/inspections", inspectionRoutes);
app.use("/hygiene-grades", hygieneGradeRoutes);
app.use("/stall-details", stallDetailsRoutes);

//start server
app.listen(port, async () => {
  try {
    // Connect to the database
    await sql.connect(dbConfig);
    console.log("Database connection established successfully");
  } catch (err) {
    console.error("Database connection error:", err);
    // Terminate the application with an error code (optional)
    process.exit(1); // Exit with code 1 indicating an error
  }

  console.log(`Server listening on port ${port}`);
});

// Close the connection pool on SIGINT signal
process.on("SIGINT", async () => {
  console.log("Server is gracefully shutting down");
  // Perform cleanup tasks (e.g., close database connections)
  await sql.close();
  console.log("Database connection closed");
  process.exit(0); // Exit with code 0 indicating successful shutdown
});
