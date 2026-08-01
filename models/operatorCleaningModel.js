const sql = require("mssql");
const dbConfig = require("../dbConfig");

// GET all cleaning schedules
async function getAllCleaningSchedules() {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .query(`
                SELECT
                    CleaningID,
                    HawkerCentreID,
                    CleaningTitle,
                    Description,
                    ScheduledDate,
                    StartTime,
                    EndTime,
                    AssignedTo,
                    Status,
                    CreatedDate
                FROM CleaningSchedule
                ORDER BY ScheduledDate ASC,
                         StartTime ASC;
            `);

        return result.recordset;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// GET cleaning schedule by ID
async function getCleaningScheduleById(cleaningID) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .input(
                "CleaningID",
                sql.Int,
                cleaningID
            )
            .query(`
                SELECT
                    CleaningID,
                    HawkerCentreID,
                    CleaningTitle,
                    Description,
                    ScheduledDate,
                    StartTime,
                    EndTime,
                    AssignedTo,
                    Status,
                    CreatedDate
                FROM CleaningSchedule
                WHERE CleaningID = @CleaningID;
            `);

        return result.recordset[0];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// POST create cleaning schedule
async function createCleaningSchedule(scheduleData) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .input(
                "HawkerCentreID",
                sql.Int,
                scheduleData.HawkerCentreID
            )
            .input(
                "CleaningTitle",
                sql.VarChar(100),
                scheduleData.CleaningTitle
            )
            .input(
                "Description",
                sql.VarChar(255),
                scheduleData.Description || null
            )
            .input(
                "ScheduledDate",
                sql.Date,
                scheduleData.ScheduledDate
            )
            .input(
                "StartTime",
                sql.VarChar(8),
                scheduleData.StartTime || null
            )
            .input(
                "EndTime",
                sql.VarChar(8),
                scheduleData.EndTime || null
            )
            .input(
                "AssignedTo",
                sql.VarChar(100),
                scheduleData.AssignedTo || null
            )
            .input(
                "Status",
                sql.VarChar(20),
                scheduleData.Status || "Scheduled"
            )
            .query(`
                INSERT INTO CleaningSchedule
                (
                    HawkerCentreID,
                    CleaningTitle,
                    Description,
                    ScheduledDate,
                    StartTime,
                    EndTime,
                    AssignedTo,
                    Status
                )
                VALUES
                (
                    @HawkerCentreID,
                    @CleaningTitle,
                    @Description,
                    @ScheduledDate,
                    CAST(@StartTime AS TIME),
                    CAST(@EndTime AS TIME),
                    @AssignedTo,
                    @Status
                );

                SELECT *
                FROM CleaningSchedule
                WHERE CleaningID = SCOPE_IDENTITY();
            `);

        return result.recordset[0];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// PUT update cleaning schedule
async function updateCleaningSchedule(
    cleaningID,
    scheduleData
) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .input(
                "CleaningID",
                sql.Int,
                cleaningID
            )
            .input(
                "HawkerCentreID",
                sql.Int,
                scheduleData.HawkerCentreID
            )
            .input(
                "CleaningTitle",
                sql.VarChar(100),
                scheduleData.CleaningTitle
            )
            .input(
                "Description",
                sql.VarChar(255),
                scheduleData.Description || null
            )
            .input(
                "ScheduledDate",
                sql.Date,
                scheduleData.ScheduledDate
            )
            .input(
                "StartTime",
                sql.VarChar(8),
                scheduleData.StartTime || null
            )
            .input(
                "EndTime",
                sql.VarChar(8),
                scheduleData.EndTime || null
            )
            .input(
                "AssignedTo",
                sql.VarChar(100),
                scheduleData.AssignedTo || null
            )
            .input(
                "Status",
                sql.VarChar(20),
                scheduleData.Status
            )
            .query(`
                UPDATE CleaningSchedule
                SET
                    HawkerCentreID = @HawkerCentreID,
                    CleaningTitle = @CleaningTitle,
                    Description = @Description,
                    ScheduledDate = @ScheduledDate,
                    StartTime = CAST(@StartTime AS TIME),
                    EndTime = CAST(@EndTime AS TIME),
                    AssignedTo = @AssignedTo,
                    Status = @Status
                WHERE CleaningID = @CleaningID;

                SELECT *
                FROM CleaningSchedule
                WHERE CleaningID = @CleaningID;
            `);

        return result.recordset[0];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// DELETE / cancel cleaning schedule
async function deleteCleaningSchedule(cleaningID) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .input(
                "CleaningID",
                sql.Int,
                cleaningID
            )
            .query(`
                UPDATE CleaningSchedule
                SET Status = 'Cancelled'
                WHERE CleaningID = @CleaningID;

                SELECT *
                FROM CleaningSchedule
                WHERE CleaningID = @CleaningID;
            `);

        return result.recordset[0];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    getAllCleaningSchedules,
    getCleaningScheduleById,
    createCleaningSchedule,
    updateCleaningSchedule,
    deleteCleaningSchedule
};