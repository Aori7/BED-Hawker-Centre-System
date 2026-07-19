// note: run this only once, to create temporary users for testing purposes
// to create seed users
// run node seedUsers.js in the terminal
//created by ada

const sql = require("mssql");
const bcrypt = require("bcrypt");
const dbConfig = require("./dbConfig");
const users = require("./seedData/users");

async function seedUsers() {
  let pool;

  try {
    pool = await sql.connect(dbConfig);

    console.log("Connected to database");
    console.log("Starting user seeding...\n");

    for (const user of users) {
      // check if the email already exists
      const existingUser = await pool
        .request()
        .input("Email", sql.VarChar(100), user.email)
        .query(`
          SELECT UserID
          FROM HawkerUser
          WHERE Email = @Email
        `);

      if (existingUser.recordset.length > 0) {
        console.log(`Skipped: ${user.email} already exists`);
        continue;
      }

      const transaction = new sql.Transaction(pool);

      try {
        await transaction.begin();

        const passwordHash = await bcrypt.hash(user.password, 10);

        // Insert login details and get the generated UserID
        const userResult = await new sql.Request(transaction)
          .input("Email", sql.VarChar(100), user.email)
          .input("PasswordHash", sql.VarChar(255), passwordHash)
          .input("RoleID", sql.Int, user.roleId)
          .query(`
            INSERT INTO HawkerUser (
              Email,
              PasswordHash,
              RoleID
            )
            OUTPUT INSERTED.UserID
            VALUES (
              @Email,
              @PasswordHash,
              @RoleID
            )
          `);

        const userId = userResult.recordset[0].UserID;

        // RoleID 2 = Stall Owner
        if (user.roleId === 2) {
          await new sql.Request(transaction)
            .input("UserID", sql.Int, userId)
            .input("OwnerName", sql.VarChar(100), user.name)
            .input("ContactNo", sql.Char(8), user.contactNo)
            .input("NRIC", sql.VarChar(9), user.nric)
            .query(`
              INSERT INTO StallOwner (
                UserID,
                OwnerName,
                ContactNo,
                NRIC
              )
              VALUES (
                @UserID,
                @OwnerName,
                @ContactNo,
                @NRIC
              )
            `);
        }

        // RoleID 3 = Operator
        if (user.roleId === 3) {
          await new sql.Request(transaction)
            .input("UserID", sql.Int, userId)
            .input("OperatorName", sql.VarChar(100), user.name)
            .input(
              "ContactPerson",
              sql.VarChar(100),
              user.contactPerson
            )
            .input("ContactNo", sql.Char(8), user.contactNo)
            .query(`
              INSERT INTO Operator (
                UserID,
                OperatorName,
                ContactPerson,
                ContactNo
              )
              VALUES (
                @UserID,
                @OperatorName,
                @ContactPerson,
                @ContactNo
              )
            `);
        }

        // RoleID 4 = NEA Officer
        if (user.roleId === 4) {
          await new sql.Request(transaction)
            .input("UserID", sql.Int, userId)
            .input("OfficerName", sql.VarChar(100), user.name)
            .input("ContactNo", sql.Char(8), user.contactNo)
            .query(`
              INSERT INTO NEA_Officer (
                UserID,
                OfficerName,
                ContactNo
              )
              VALUES (
                @UserID,
                @OfficerName,
                @ContactNo
              )
            `);
        }

        await transaction.commit();

        console.log(`Inserted: ${user.email}`);
      } catch (error) {
        await transaction.rollback();
        console.error(`Failed to insert ${user.email}:`, error.message);
      }
    }

    console.log("\nUser seeding completed");
  } catch (error) {
    console.error("Seeding error:", error);
  } finally {
    if (pool) {
      await pool.close();
      console.log("Database connection closed");
    }
  }
}

seedUsers();