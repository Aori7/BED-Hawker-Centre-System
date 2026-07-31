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


module.exports = {
    getAllAnnouncements,
    getAnnouncementById
};