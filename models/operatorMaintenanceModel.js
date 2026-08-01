const sql = require("mssql");
const dbConfig = require("../dbConfig");

async function getAllMaintenanceSchedules() {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .query(`
                SELECT
                    MaintenanceID,
                    HawkerCentreID,
                    MaintenanceTitle,
                    Description,
                    ScheduledDate,
                    StartTime,
                    EndTime,
                    AssignedTo,
                    Status,
                    CreatedDate
                FROM MaintenanceSchedule
                ORDER BY ScheduledDate ASC
            `);

        return result.recordset;

    } finally {

        if (connection) {
            await connection.close();
        }

    }
}

// GET maintenance schedule by ID
async function getMaintenanceScheduleById(maintenanceID) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .input(
                "MaintenanceID",
                sql.Int,
                maintenanceID
            )
            .query(`
                SELECT
                    MaintenanceID,
                    HawkerCentreID,
                    MaintenanceTitle,
                    Description,
                    ScheduledDate,
                    StartTime,
                    EndTime,
                    AssignedTo,
                    Status,
                    CreatedDate
                FROM MaintenanceSchedule
                WHERE MaintenanceID = @MaintenanceID
            `);

        return result.recordset[0];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// POST create maintenance schedule
    async function createMaintenanceSchedule(scheduleData) {
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
                    "MaintenanceTitle",
                    sql.VarChar(100),
                    scheduleData.MaintenanceTitle
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
                    INSERT INTO MaintenanceSchedule
                    (
                        HawkerCentreID,
                        MaintenanceTitle,
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
                        @MaintenanceTitle,
                        @Description,
                        @ScheduledDate,
                        CAST(@StartTime AS TIME),
                        CAST(@EndTime AS TIME),
                        @AssignedTo,
                        @Status
                    );
    
                    SELECT *
                    FROM MaintenanceSchedule
                    WHERE MaintenanceID = SCOPE_IDENTITY();
                `);
    
            return result.recordset[0];
        } finally {
            if (connection) {
                await connection.close();
            }
        }
    }

// PUT update maintenance schedule
async function updateMaintenanceSchedule(
    maintenanceID,
    scheduleData
) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .input(
                "MaintenanceID",
                sql.Int,
                maintenanceID
            )
            .input(
                "HawkerCentreID",
                sql.Int,
                scheduleData.HawkerCentreID
            )
            .input(
                "MaintenanceTitle",
                sql.VarChar(100),
                scheduleData.MaintenanceTitle
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
                UPDATE MaintenanceSchedule
                SET
                    HawkerCentreID = @HawkerCentreID,
                    MaintenanceTitle = @MaintenanceTitle,
                    Description = @Description,
                    ScheduledDate = @ScheduledDate,
                    StartTime = @StartTime,
                    EndTime = @EndTime,
                    AssignedTo = @AssignedTo,
                    Status = @Status
                WHERE MaintenanceID = @MaintenanceID;

                SELECT *
                FROM MaintenanceSchedule
                WHERE MaintenanceID = @MaintenanceID;
            `);

        return result.recordset[0];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

// DELETE maintenance schedule by changing status
async function deleteMaintenanceSchedule(maintenanceID) {
    let connection;

    try {
        connection = await sql.connect(dbConfig);

        const result = await connection
            .request()
            .input(
                "MaintenanceID",
                sql.Int,
                maintenanceID
            )
            .query(`
                UPDATE MaintenanceSchedule
                SET Status = 'Cancelled'
                WHERE MaintenanceID = @MaintenanceID;

                SELECT *
                FROM MaintenanceSchedule
                WHERE MaintenanceID = @MaintenanceID;
            `);

        return result.recordset[0];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    getAllMaintenanceSchedules,
    getMaintenanceScheduleById,
    createMaintenanceSchedule,
    updateMaintenanceSchedule,
    deleteMaintenanceSchedule
};