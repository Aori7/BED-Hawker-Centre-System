/*
name: dayana sharafeena

file tested:
inspectionModel.js

testing framework:
jest
*/

jest.mock("mssql");

const sql = require("mssql");

const inspectionModel =
    require("../models/inspectionModel");

describe(
    "inspection model unit tests",
    () => {
        let mockConnection;
        let mockConnectionRequest;

        let mockTransaction;

        let mockInspectionRequest;
        let mockRemarkRequest;

        let consoleErrorSpy;

        beforeEach(() => {
            jest.clearAllMocks();

            mockConnectionRequest = {
                query: jest.fn()
            };

            mockConnection = {
                request: jest.fn(),
                close: jest.fn()
            };

            mockConnection.request.mockReturnValue(
                mockConnectionRequest
            );

            mockConnection.close.mockResolvedValue();

            sql.connect.mockResolvedValue(
                mockConnection
            );

            mockTransaction = {
                begin: jest.fn(),
                commit: jest.fn(),
                rollback: jest.fn()
            };

            mockTransaction.begin.mockResolvedValue();
            mockTransaction.commit.mockResolvedValue();
            mockTransaction.rollback.mockResolvedValue();

            sql.Transaction.mockImplementation(
                () => mockTransaction
            );

            mockInspectionRequest = {
                input: jest.fn(),
                query: jest.fn()
            };

            mockInspectionRequest.input.mockReturnValue(
                mockInspectionRequest
            );

            mockRemarkRequest = {
                input: jest.fn(),
                query: jest.fn()
            };

            mockRemarkRequest.input.mockReturnValue(
                mockRemarkRequest
            );

            sql.Request
                .mockImplementationOnce(
                    () => mockInspectionRequest
                )
                .mockImplementationOnce(
                    () => mockRemarkRequest
                );

            consoleErrorSpy =
                jest.spyOn(
                    console,
                    "error"
                )
                    .mockImplementation(
                        () => {}
                    );
        });

        afterEach(() => {
            consoleErrorSpy.mockRestore();
        });

        describe(
            "getAllInspections",
            () => {
                test(
                    "should return all inspection records successfully",
                    async () => {
                        const mockInspections = [
                            {
                                InspectionID: 22,
                                OfficerID: 1,
                                StallID: 25,
                                InspectionDate:
                                    "2026-08-01",
                                InspectionScore: 97,
                                HygieneGrade: "A",
                                InspectionStatus:
                                    "Completed",
                                StallName:
                                    "Adam Road Nasi Lemak",
                                HCName:
                                    "Adam Road Food Centre",
                                Remark:
                                    "Excellent standards"
                            },
                            {
                                InspectionID: 21,
                                OfficerID: 1,
                                StallID: 26,
                                InspectionDate:
                                    "2026-08-01",
                                InspectionScore: 88,
                                HygieneGrade: "B",
                                InspectionStatus:
                                    "Completed",
                                StallName:
                                    "Adam Road Mee Soto",
                                HCName:
                                    "Adam Road Food Centre",
                                Remark:
                                    "Good standards"
                            }
                        ];

                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset:
                                    mockInspections
                            });

                        const result =
                            await inspectionModel
                                .getAllInspections();

                        expect(
                            sql.connect
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            mockConnection.request
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            result
                        ).toEqual(
                            mockInspections
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should return an empty array when there are no inspection records",
                    async () => {
                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        const result =
                            await inspectionModel
                                .getAllInspections();

                        expect(result).toEqual(
                            []
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should use a query that joins stalls and hawker centres",
                    async () => {
                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await inspectionModel
                            .getAllInspections();

                        const query =
                            mockConnectionRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "FROM Inspection i"
                        );

                        expect(query).toContain(
                            "INNER JOIN FoodStall fs"
                        );

                        expect(query).toContain(
                            "INNER JOIN HawkerCentre hc"
                        );

                        expect(query).toContain(
                            "LEFT JOIN InspectionRemark ir"
                        );
                    }
                );

                test(
                    "should retrieve the latest remark for each inspection",
                    async () => {
                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await inspectionModel
                            .getAllInspections();

                        const query =
                            mockConnectionRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "SELECT TOP 1 RemarkID"
                        );

                        expect(query).toContain(
                            "WHERE InspectionID"
                        );

                        expect(query).toContain(
                            "ORDER BY CreatedAt DESC"
                        );
                    }
                );

                test(
                    "should order inspection records by newest date and id",
                    async () => {
                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await inspectionModel
                            .getAllInspections();

                        const query =
                            mockConnectionRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "i.InspectionDate DESC"
                        );

                        expect(query).toContain(
                            "i.InspectionID DESC"
                        );
                    }
                );

                test(
                    "should throw an error when retrieving inspections fails",
                    async () => {
                        const mockError =
                            new Error(
                                "inspection query error"
                            );

                        mockConnectionRequest.query
                            .mockRejectedValue(
                                mockError
                            );

                        await expect(
                            inspectionModel
                                .getAllInspections()
                        ).rejects.toThrow(
                            "inspection query error"
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should close the connection even when retrieval fails",
                    async () => {
                        mockConnectionRequest.query
                            .mockRejectedValue(
                                new Error(
                                    "database error"
                                )
                            );

                        await expect(
                            inspectionModel
                                .getAllInspections()
                        ).rejects.toThrow();

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should attempt to connect using the database configuration",
                    async () => {
                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await inspectionModel
                            .getAllInspections();

                        expect(
                            sql.connect
                        ).toHaveBeenCalledWith(
                            expect.any(Object)
                        );
                    }
                );
            }
        );

        describe(
            "createInspection",
            () => {
                const inspectionData = {
                    officerID: 1,
                    stallID: 25,
                    inspectionDate:
                        "2026-08-01",
                    inspectionScore: 97,
                    hygieneGrade: "A",
                    remark:
                        "Excellent hygiene standards"
                };

                const mockNewInspection = {
                    InspectionID: 22,
                    OfficerID: 1,
                    StallID: 25,
                    InspectionDate:
                        "2026-08-01",
                    InspectionScore: 97,
                    HygieneGrade: "A",
                    GradeExpiry:
                        "2027-08-01",
                    InspectionStatus:
                        "Completed",
                    CreatedAt:
                        "2026-08-01"
                };

                const mockNewRemark = {
                    RemarkID: 22,
                    InspectionID: 22,
                    Remark:
                        "Excellent hygiene standards",
                    CreatedAt:
                        "2026-08-01"
                };

                beforeEach(() => {
                    mockInspectionRequest.query
                        .mockResolvedValue({
                            recordset: [
                                mockNewInspection
                            ]
                        });

                    mockRemarkRequest.query
                        .mockResolvedValue({
                            recordset: [
                                mockNewRemark
                            ]
                        });
                });

                test(
                    "should create an inspection and its remark successfully",
                    async () => {
                        const result =
                            await inspectionModel
                                .createInspection(
                                    inspectionData
                                );

                        expect(
                            mockTransaction.begin
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            mockTransaction.commit
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            mockTransaction.rollback
                        ).not.toHaveBeenCalled();

                        expect(result).toEqual({
                            inspection:
                                mockNewInspection,

                            remark:
                                mockNewRemark
                        });

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should create a transaction using the database connection",
                    async () => {
                        await inspectionModel
                            .createInspection(
                                inspectionData
                            );

                        expect(
                            sql.Transaction
                        ).toHaveBeenCalledWith(
                            mockConnection
                        );
                    }
                );

                test(
                    "should begin the transaction before committing",
                    async () => {
                        await inspectionModel
                            .createInspection(
                                inspectionData
                            );

                        const beginOrder =
                            mockTransaction.begin
                                .mock.invocationCallOrder[0];

                        const commitOrder =
                            mockTransaction.commit
                                .mock.invocationCallOrder[0];

                        expect(beginOrder).toBeLessThan(
                            commitOrder
                        );
                    }
                );

                test(
                    "should provide the inspection inputs to the first sql request",
                    async () => {
                        await inspectionModel
                            .createInspection(
                                inspectionData
                            );

                        expect(
                            mockInspectionRequest.input
                        ).toHaveBeenNthCalledWith(
                            1,
                            "OfficerID",
                            sql.Int,
                            1
                        );

                        expect(
                            mockInspectionRequest.input
                        ).toHaveBeenNthCalledWith(
                            2,
                            "StallID",
                            sql.Int,
                            25
                        );

                        expect(
                            mockInspectionRequest.input
                        ).toHaveBeenNthCalledWith(
                            3,
                            "InspectionDate",
                            sql.Date,
                            "2026-08-01"
                        );

                        expect(
                            mockInspectionRequest.input
                        ).toHaveBeenNthCalledWith(
                            4,
                            "InspectionScore",
                            sql.Int,
                            97
                        );

                        expect(
                            mockInspectionRequest.input
                        ).toHaveBeenNthCalledWith(
                            5,
                            "HygieneGrade",
                            sql.Char(1),
                            "A"
                        );
                    }
                );

                test(
                    "should execute an inspection insert query",
                    async () => {
                        await inspectionModel
                            .createInspection(
                                inspectionData
                            );

                        const query =
                            mockInspectionRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "INSERT INTO Inspection"
                        );

                        expect(query).toContain(
                            "OUTPUT"
                        );

                        expect(query).toContain(
                            "'Completed'"
                        );

                        expect(query).toContain(
                            "DATEADD"
                        );

                        expect(query).toContain(
                            "GETDATE()"
                        );
                    }
                );

                test(
                    "should set the grade expiry to one year after the inspection date",
                    async () => {
                        await inspectionModel
                            .createInspection(
                                inspectionData
                            );

                        const query =
                            mockInspectionRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "DATEADD"
                        );

                        expect(query).toContain(
                            "YEAR"
                        );

                        expect(query).toContain(
                            "@InspectionDate"
                        );
                    }
                );

                test(
                    "should insert the remark using the new inspection id",
                    async () => {
                        await inspectionModel
                            .createInspection(
                                inspectionData
                            );

                        expect(
                            mockRemarkRequest.input
                        ).toHaveBeenNthCalledWith(
                            1,
                            "InspectionID",
                            sql.Int,
                            22
                        );

                        expect(
                            mockRemarkRequest.input
                        ).toHaveBeenNthCalledWith(
                            2,
                            "Remark",
                            sql.VarChar(1000),
                            "Excellent hygiene standards"
                        );
                    }
                );

                test(
                    "should execute an inspection remark insert query",
                    async () => {
                        await inspectionModel
                            .createInspection(
                                inspectionData
                            );

                        const query =
                            mockRemarkRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "INSERT INTO InspectionRemark"
                        );

                        expect(query).toContain(
                            "@InspectionID"
                        );

                        expect(query).toContain(
                            "@Remark"
                        );

                        expect(query).toContain(
                            "OUTPUT"
                        );
                    }
                );

                test(
                    "should create two transaction requests",
                    async () => {
                        await inspectionModel
                            .createInspection(
                                inspectionData
                            );

                        expect(
                            sql.Request
                        ).toHaveBeenCalledTimes(
                            2
                        );

                        expect(
                            sql.Request
                        ).toHaveBeenNthCalledWith(
                            1,
                            mockTransaction
                        );

                        expect(
                            sql.Request
                        ).toHaveBeenNthCalledWith(
                            2,
                            mockTransaction
                        );
                    }
                );

                test(
                    "should commit only after both inserts succeed",
                    async () => {
                        await inspectionModel
                            .createInspection(
                                inspectionData
                            );

                        expect(
                            mockInspectionRequest.query
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            mockRemarkRequest.query
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            mockTransaction.commit
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should rollback when the inspection insert fails",
                    async () => {
                        const mockError =
                            new Error(
                                "inspection insert error"
                            );

                        mockInspectionRequest.query
                            .mockRejectedValue(
                                mockError
                            );

                        await expect(
                            inspectionModel
                                .createInspection(
                                    inspectionData
                                )
                        ).rejects.toThrow(
                            "inspection insert error"
                        );

                        expect(
                            mockTransaction.rollback
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            mockTransaction.commit
                        ).not.toHaveBeenCalled();

                        expect(
                            mockRemarkRequest.query
                        ).not.toHaveBeenCalled();

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should rollback when the remark insert fails",
                    async () => {
                        const mockError =
                            new Error(
                                "remark insert error"
                            );

                        mockRemarkRequest.query
                            .mockRejectedValue(
                                mockError
                            );

                        await expect(
                            inspectionModel
                                .createInspection(
                                    inspectionData
                                )
                        ).rejects.toThrow(
                            "remark insert error"
                        );

                        expect(
                            mockTransaction.rollback
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            mockTransaction.commit
                        ).not.toHaveBeenCalled();

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should log an error when transaction rollback fails",
                    async () => {
                        const insertError =
                            new Error(
                                "insert error"
                            );

                        const rollbackError =
                            new Error(
                                "rollback error"
                            );

                        mockInspectionRequest.query
                            .mockRejectedValue(
                                insertError
                            );

                        mockTransaction.rollback
                            .mockRejectedValue(
                                rollbackError
                            );

                        await expect(
                            inspectionModel
                                .createInspection(
                                    inspectionData
                                )
                        ).rejects.toThrow(
                            "insert error"
                        );

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Inspection rollback error:",
                            rollbackError
                        );
                    }
                );

                test(
                    "should close the connection after a successful transaction",
                    async () => {
                        await inspectionModel
                            .createInspection(
                                inspectionData
                            );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should close the connection after a failed transaction",
                    async () => {
                        mockInspectionRequest.query
                            .mockRejectedValue(
                                new Error(
                                    "insert failed"
                                )
                            );

                        await expect(
                            inspectionModel
                                .createInspection(
                                    inspectionData
                                )
                        ).rejects.toThrow();

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );
            }
        );
    }
);