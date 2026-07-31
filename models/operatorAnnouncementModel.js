const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllAnnouncements() {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .query(`
                SELECT
                    AnnouncementID,
                    Title,
                    Content,
                    CreatedBy,
                    CreatedDate,
                    ExpiryDate,
                    Status
                FROM Announcement
                ORDER BY CreatedDate DESC
            `);

        return result.recordset;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function getAnnouncementById(announcementID) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .input(
                "AnnouncementID",
                sql.Int,
                announcementID
            )
            .query(`
                SELECT
                    AnnouncementID,
                    Title,
                    Content,
                    CreatedBy,
                    CreatedDate,
                    ExpiryDate,
                    Status
                FROM Announcement
                WHERE AnnouncementID = @AnnouncementID
            `);

        return result.recordset[0];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createAnnouncement(announcementData) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .input("Title", sql.VarChar(100), announcementData.Title)
            .input("Content", sql.VarChar(sql.MAX), announcementData.Content)
            .input("CreatedBy", sql.VarChar(100), announcementData.CreatedBy)
            .input("ExpiryDate", sql.DateTime, announcementData.ExpiryDate)
            .input("Status", sql.VarChar(20), announcementData.Status)
            .query(`
                INSERT INTO Announcement
                (
                    Title,
                    Content,
                    CreatedBy,
                    ExpiryDate,
                    Status
                )
                VALUES
                (
                    @Title,
                    @Content,
                    @CreatedBy,
                    @ExpiryDate,
                    @Status
                );

                SELECT *
                FROM Announcement
                WHERE AnnouncementID = SCOPE_IDENTITY();
            `);

        return result.recordset[0];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateAnnouncement(
    announcementID,
    announcementData
) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .input(
                "AnnouncementID",
                sql.Int,
                announcementID
            )
            .input(
                "Title",
                sql.VarChar(100),
                announcementData.Title
            )
            .input(
                "Content",
                sql.VarChar(sql.MAX),
                announcementData.Content
            )
            .input(
                "CreatedBy",
                sql.VarChar(100),
                announcementData.CreatedBy
            )
            .input(
                "ExpiryDate",
                sql.DateTime,
                announcementData.ExpiryDate
            )
            .input(
                "Status",
                sql.VarChar(20),
                announcementData.Status
            )
            .query(`
                UPDATE Announcement
                SET
                    Title = @Title,
                    Content = @Content,
                    CreatedBy = @CreatedBy,
                    ExpiryDate = @ExpiryDate,
                    Status = @Status
                WHERE AnnouncementID = @AnnouncementID;

                SELECT *
                FROM Announcement
                WHERE AnnouncementID = @AnnouncementID;
            `);

        return result.recordset[0];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    getAllAnnouncements,
    getAnnouncementById,
    createAnnouncement,
    updateAnnouncement
};