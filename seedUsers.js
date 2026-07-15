// note: run this only once, to create temporary users for testing purposes
// to create seed users
// run node seedUsers.js in the terminal
//created by ada

const sql = require("mssql");
const bcrypt = require("bcrypt");
const dbConfig = require("./dbConfig");

async function seedUsers() {
    try {
        const connection = await sql.connect(dbConfig);

        const passwordHash = await bcrypt.hash("password123", 10);

        await connection.request()
            .input("Email", sql.VarChar(100), "vendor@hawkersg.com")
            .input("PasswordHash", sql.VarChar(255), passwordHash)
            .query(`
                DECLARE @UserID INT;

                INSERT INTO HawkerUser (Email, PasswordHash, RoleID)
                VALUES (
                    @Email,
                    @PasswordHash,
                    (
                        SELECT RoleID
                        FROM Role
                        WHERE RoleName = 'Stall Owner'
                    )
                );

                SET @UserID = SCOPE_IDENTITY();

                INSERT INTO StallOwner (UserID, OwnerName)
                VALUES (@UserID, 'Test Stall Owner');
            `);

        await connection.request()
            .input("Email", sql.VarChar(100), "operator@hawkersg.com")
            .input("PasswordHash", sql.VarChar(255), passwordHash)
            .query(`
                DECLARE @UserID INT;

                INSERT INTO HawkerUser (Email, PasswordHash, RoleID)
                VALUES (
                    @Email,
                    @PasswordHash,
                    (
                        SELECT RoleID
                        FROM Role
                        WHERE RoleName = 'Operator'
                    )
                );

                SET @UserID = SCOPE_IDENTITY();

                INSERT INTO Operator (UserID, OperatorName)
                VALUES (@UserID, 'Test Operator');
            `);

        await connection.request()
            .input("Email", sql.VarChar(100), "officer@hawkersg.com")
            .input("PasswordHash", sql.VarChar(255), passwordHash)
            .query(`
                DECLARE @UserID INT;

                INSERT INTO HawkerUser (Email, PasswordHash, RoleID)
                VALUES (
                    @Email,
                    @PasswordHash,
                    (
                        SELECT RoleID
                        FROM Role
                        WHERE RoleName = 'NEA Officer'
                    )
                );

                SET @UserID = SCOPE_IDENTITY();

                INSERT INTO NEA_Officer (UserID, OfficerName)
                VALUES (@UserID, 'Test NEA Officer');
            `);

        console.log("Seed users created successfully");
        await sql.close();

    } catch (error) {
        console.error("Error seeding users:", error);
        await sql.close();
    }
}

seedUsers();