const sql = require("mssql");
const dbConfig = require("../dbConfig");

// get all rental agreements
async function getAllRentalAgreements() {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .query(`
                SELECT
                    ra.AgreementID,
                    ra.OwnerID,
                    ra.StallID,
                    ra.OperatorID,
                    ra.StartDate,
                    ra.EndDate,
                    ra.TermsAndConditions,
                    ra.RentalPrice,
                    ra.AgreementStatus,
                    ra.CreatedAt,

                    fs.StallName,
                    fs.StallUnitNo,

                    hc.HawkerCentreID,
                    hc.HCName,

                    so.OwnerName,
                    so.ContactNo AS OwnerContactNo,

                    o.OperatorName,
                    o.ContactPerson,
                    o.ContactNo AS OperatorContactNo

                FROM RentalAgreement ra

                INNER JOIN FoodStall fs
                    ON ra.StallID = fs.StallID

                INNER JOIN HawkerCentre hc
                    ON fs.HawkerCentreID =
                        hc.HawkerCentreID

                INNER JOIN StallOwner so
                    ON ra.OwnerID = so.OwnerID

                INNER JOIN Operator o
                    ON ra.OperatorID = o.OperatorID

                ORDER BY
                    ra.StartDate DESC,
                    ra.AgreementID DESC;
            `);

        return result.recordset;

    } finally {
        await connection.close();
    }
}

// get rental agreement by ID
async function getRentalAgreementById(agreementID) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input(
                "AgreementID",
                sql.Int,
                agreementID
            )
            .query(`
                SELECT
                    ra.AgreementID,
                    ra.OwnerID,
                    ra.StallID,
                    ra.OperatorID,
                    ra.StartDate,
                    ra.EndDate,
                    ra.TermsAndConditions,
                    ra.RentalPrice,
                    ra.AgreementStatus,
                    ra.CreatedAt,

                    fs.StallName,
                    fs.StallUnitNo,

                    hc.HawkerCentreID,
                    hc.HCName,

                    so.OwnerName,
                    so.ContactNo AS OwnerContactNo,

                    o.OperatorName,
                    o.ContactPerson,
                    o.ContactNo AS OperatorContactNo

                FROM RentalAgreement ra

                INNER JOIN FoodStall fs
                    ON ra.StallID = fs.StallID

                INNER JOIN HawkerCentre hc
                    ON fs.HawkerCentreID = hc.HawkerCentreID

                INNER JOIN StallOwner so
                    ON ra.OwnerID = so.OwnerID

                INNER JOIN Operator o
                    ON ra.OperatorID = o.OperatorID

                WHERE ra.AgreementID = @AgreementID;
            `);

        return result.recordset[0];

    } finally {
        await connection.close();
    }
}

// create a new rental agreement
async function createRentalAgreement(rentalData) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input(
                "OwnerID",
                sql.Int,
                rentalData.ownerID
            )
            .input(
                "StallID",
                sql.Int,
                rentalData.stallID
            )
            .input(
                "OperatorID",
                sql.Int,
                rentalData.operatorID
            )
            .input(
                "StartDate",
                sql.Date,
                rentalData.startDate
            )
            .input(
                "EndDate",
                sql.Date,
                rentalData.endDate
            )
            .input(
                "TermsAndConditions",
                sql.VarChar(2000),
                rentalData.termsAndConditions
            )
            .input(
                "RentalPrice",
                sql.Decimal(10, 2),
                rentalData.rentalPrice
            )
            .input(
                "AgreementStatus",
                sql.VarChar(20),
                rentalData.agreementStatus
            )
            .query(`
                INSERT INTO RentalAgreement (
                    OwnerID,
                    StallID,
                    OperatorID,
                    StartDate,
                    EndDate,
                    TermsAndConditions,
                    RentalPrice,
                    AgreementStatus,
                    CreatedAt
                )
                OUTPUT
                    INSERTED.AgreementID,
                    INSERTED.OwnerID,
                    INSERTED.StallID,
                    INSERTED.OperatorID,
                    INSERTED.StartDate,
                    INSERTED.EndDate,
                    INSERTED.TermsAndConditions,
                    INSERTED.RentalPrice,
                    INSERTED.AgreementStatus,
                    INSERTED.CreatedAt
                VALUES (
                    @OwnerID,
                    @StallID,
                    @OperatorID,
                    @StartDate,
                    @EndDate,
                    @TermsAndConditions,
                    @RentalPrice,
                    @AgreementStatus,
                    GETDATE()
                );
            `);

        return result.recordset[0];

    } finally {
        await connection.close();
    }
}

// update rental agreement
async function updateRentalAgreement(
    agreementID,
    rentalData
) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input(
                "AgreementID",
                sql.Int,
                agreementID
            )
            .input(
                "OwnerID",
                sql.Int,
                rentalData.ownerID
            )
            .input(
                "StallID",
                sql.Int,
                rentalData.stallID
            )
            .input(
                "OperatorID",
                sql.Int,
                rentalData.operatorID
            )
            .input(
                "StartDate",
                sql.Date,
                rentalData.startDate
            )
            .input(
                "EndDate",
                sql.Date,
                rentalData.endDate
            )
            .input(
                "TermsAndConditions",
                sql.VarChar(2000),
                rentalData.termsAndConditions
            )
            .input(
                "RentalPrice",
                sql.Decimal(10, 2),
                rentalData.rentalPrice
            )
            .input(
                "AgreementStatus",
                sql.VarChar(20),
                rentalData.agreementStatus
            )
            .query(`
                UPDATE RentalAgreement
                SET
                    OwnerID = @OwnerID,
                    StallID = @StallID,
                    OperatorID = @OperatorID,
                    StartDate = @StartDate,
                    EndDate = @EndDate,
                    TermsAndConditions =
                        @TermsAndConditions,
                    RentalPrice = @RentalPrice,
                    AgreementStatus =
                        @AgreementStatus

                WHERE AgreementID =
                    @AgreementID;

                SELECT *
                FROM RentalAgreement
                WHERE AgreementID =
                    @AgreementID;
            `);

        return result.recordset[0];

    } finally {
        await connection.close();
    }
}

// terminate a rental agreement
async function deleteRentalAgreement(agreementID) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input(
                "AgreementID",
                sql.Int,
                agreementID
            )
            .query(`
                UPDATE RentalAgreement
                SET AgreementStatus = 'Terminated'
                WHERE AgreementID = @AgreementID;

                SELECT *
                FROM RentalAgreement
                WHERE AgreementID = @AgreementID;
            `);

        return result.recordset[0];

    } finally {
        await connection.close();
    }
}

module.exports = {
    getAllRentalAgreements,
    getRentalAgreementById,
    createRentalAgreement,
    updateRentalAgreement,
    deleteRentalAgreement
};