const sql = require("mssql");
const dbConfig = require("../dbConfig");

// Get dashboard data for one hawker centre
async function getDashboardData(
    operatorID,
    hawkerCentreID
) {
    const connection = await sql.connect(dbConfig);

    try {
        const result = await connection
            .request()
            .input(
                "OperatorID",
                sql.Int,
                operatorID
            )
            .input(
                "HawkerCentreID",
                sql.Int,
                hawkerCentreID
            )
            .query(`
                /*
                    Check whether the hawker centre
                    belongs to the operator
                */
                IF NOT EXISTS
                (
                    SELECT 1
                    FROM HawkerCentre
                    WHERE
                        HawkerCentreID =
                            @HawkerCentreID
                        AND OperatorID =
                            @OperatorID
                )
                BEGIN
                    SELECT
                        CAST(0 AS BIT)
                            AS HasAccess;

                    RETURN;
                END;

                SELECT
                    CAST(1 AS BIT)
                        AS HasAccess;

                /*
                    Profit and loss statistics

                    Revenue:
                    Completed and paid orders

                    Expenses:
                    Active rental agreement prices
                */
                SELECT
                    ISNULL(
                        SUM(
                            CASE
                                WHEN
                                    o.OrderStatus =
                                        'Completed'
                                THEN
                                    o.TotalAmount
                                ELSE
                                    0
                            END
                        ),
                        0
                    ) AS TotalRevenue,

                    ISNULL(
                        (
                            SELECT
                                SUM(
                                    ra.RentalPrice
                                )
                            FROM RentalAgreement ra

                            INNER JOIN FoodStall fs2
                                ON ra.StallID =
                                    fs2.StallID

                            WHERE
                                fs2.HawkerCentreID =
                                    @HawkerCentreID
                                AND
                                ra.OperatorID =
                                    @OperatorID
                                AND
                                ra.AgreementStatus =
                                    'Active'
                        ),
                        0
                    ) AS TotalExpenses

                FROM [Orders] o

                INNER JOIN FoodStall fs
                    ON o.StallID =
                        fs.StallID

                WHERE
                    fs.HawkerCentreID =
                        @HawkerCentreID;

                /*
                    Complaint statistics used for
                    the review/feedback dashboard
                */
                SELECT
                    COUNT(c.ComplaintID)
                        AS TotalComplaints,

                    SUM(
                        CASE
                            WHEN c.Status =
                                'Resolved'
                            THEN 1
                            ELSE 0
                        END
                    ) AS ResolvedComplaints,

                    SUM(
                        CASE
                            WHEN c.Status =
                                'Pending'
                            THEN 1
                            ELSE 0
                        END
                    ) AS PendingComplaints,

                    SUM(
                        CASE
                            WHEN c.Status =
                                'In Progress'
                            THEN 1
                            ELSE 0
                        END
                    ) AS InProgressComplaints,

                    SUM(
                        CASE
                            WHEN c.Status =
                                'Closed'
                            THEN 1
                            ELSE 0
                        END
                    ) AS ClosedComplaints,

                    SUM(
                        CASE
                            WHEN c.Category =
                                'Hygiene'
                            THEN 1
                            ELSE 0
                        END
                    ) AS HygieneComplaints,

                    SUM(
                        CASE
                            WHEN c.Category =
                                'Food Quality'
                            THEN 1
                            ELSE 0
                        END
                    ) AS FoodQualityComplaints,

                    SUM(
                        CASE
                            WHEN c.Category =
                                'Service Quality'
                            THEN 1
                            ELSE 0
                        END
                    ) AS ServiceQualityComplaints,

                    SUM(
                        CASE
                            WHEN c.Category =
                                'Payment'
                            THEN 1
                            ELSE 0
                        END
                    ) AS PaymentComplaints,

                    SUM(
                        CASE
                            WHEN c.Category =
                                'Technical Issue'
                            THEN 1
                            ELSE 0
                        END
                    ) AS TechnicalComplaints

                FROM Complaint c

                WHERE
                    c.AssignedRoleID = 3;

                /*
                    Hygiene-grade statistics
                */
                SELECT
                    COUNT(i.InspectionID)
                        AS TotalInspections,

                    ISNULL(
                        AVG(
                            CAST(
                                i.InspectionScore
                                AS DECIMAL(10,2)
                            )
                        ),
                        0
                    ) AS AverageInspectionScore,

                    SUM(
                        CASE
                            WHEN i.HygieneGrade = 'A'
                            THEN 1
                            ELSE 0
                        END
                    ) AS GradeA,

                    SUM(
                        CASE
                            WHEN i.HygieneGrade = 'B'
                            THEN 1
                            ELSE 0
                        END
                    ) AS GradeB,

                    SUM(
                        CASE
                            WHEN i.HygieneGrade = 'C'
                            THEN 1
                            ELSE 0
                        END
                    ) AS GradeC,

                    SUM(
                        CASE
                            WHEN i.HygieneGrade = 'D'
                            THEN 1
                            ELSE 0
                        END
                    ) AS GradeD

                FROM Inspection i

                INNER JOIN FoodStall fs
                    ON i.StallID =
                        fs.StallID

                WHERE
                    fs.HawkerCentreID =
                        @HawkerCentreID
                    AND
                    i.InspectionStatus =
                        'Completed';
            `);

        /*
            Recordsets:
            0 = access check
            1 = profit and loss
            2 = complaints
            3 = hygiene grades
        */
        const accessResult =
            result.recordsets[0]?.[0];

        if (
            !accessResult ||
            !accessResult.HasAccess
        ) {
            return null;
        }

        const profitLoss =
            result.recordsets[1]?.[0] || {};

        const complaints =
            result.recordsets[2]?.[0] || {};

        const hygieneGrades =
            result.recordsets[3]?.[0] || {};

        const totalRevenue =
            Number(
                profitLoss.TotalRevenue || 0
            );

        const totalExpenses =
            Number(
                profitLoss.TotalExpenses || 0
            );

        return {
            operatorID,
            hawkerCentreID,

            profitLoss: {
                totalRevenue,
                totalExpenses,
                netProfitLoss:
                    totalRevenue -
                    totalExpenses
            },

            reviews: {
                totalComplaints:
                    complaints
                        .TotalComplaints || 0,

                resolvedComplaints:
                    complaints
                        .ResolvedComplaints || 0,

                pendingComplaints:
                    complaints
                        .PendingComplaints || 0,

                inProgressComplaints:
                    complaints
                        .InProgressComplaints || 0,

                closedComplaints:
                    complaints
                        .ClosedComplaints || 0,

                hygieneComplaints:
                    complaints
                        .HygieneComplaints || 0,

                foodQualityComplaints:
                    complaints
                        .FoodQualityComplaints || 0,

                serviceQualityComplaints:
                    complaints
                        .ServiceQualityComplaints || 0,

                paymentComplaints:
                    complaints
                        .PaymentComplaints || 0,

                technicalComplaints:
                    complaints
                        .TechnicalComplaints || 0
            },

            hygieneGrades: {
                totalInspections:
                    hygieneGrades
                        .TotalInspections || 0,

                averageInspectionScore:
                    Number(
                        hygieneGrades
                            .AverageInspectionScore ||
                        0
                    ),

                gradeA:
                    hygieneGrades.GradeA || 0,

                gradeB:
                    hygieneGrades.GradeB || 0,

                gradeC:
                    hygieneGrades.GradeC || 0,

                gradeD:
                    hygieneGrades.GradeD || 0
            }
        };

    } finally {
        await connection.close();
    }
}

module.exports = {
    getDashboardData
};