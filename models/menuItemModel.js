const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getMenuItemsByStall(stallID) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input("StallID", sql.Int, stallID)
            .query(`
                SELECT
                    MenuItemID,
                    StallID,
                    ItemName,
                    ItemDescription,
                    ItemPrice,
                    ItemCategory,
                    ImageURL,
                    IsAvailable
                FROM MenuItem
                WHERE StallID = @StallID
                AND IsAvailable = 1
                ORDER BY ItemCategory, ItemName
            `);

        return result.recordset;

    } finally {
        await connection.close();
    }
}

module.exports = {
    getMenuItemsByStall
};