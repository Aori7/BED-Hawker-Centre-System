/*
name: dayana sharafeena

file tested:
hygieneGradeModel.js

testing framework:
jest
*/

jest.mock("mssql");

const sql = require("mssql");

const hygieneGradeModel =
    require("../models/hygieneGradeModel");

describe(
    "hygiene grade model unit tests",
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

            sql.Request.mockImplementation(
                () => {
                    if (
                        sql.Request.mock.calls.length === 1
                    ) {
                        return mockInspectionRequest;
                    }

                    return mockRemarkRequest;
                }
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
            "getHygieneGrades",
            () => {
                test(
                    "should return the latest hygiene grade for every food stall",
                    async () => {
                        const mockGrades = [
                            {
                                InspectionID: 22,
                                StallID: 25,
                                StallName:
                                    "Adam Road Nasi Lemak",
                                InspectionScore: 97,
                                HygieneGrade: "A",
                                ComplianceStatus:
                                    "Compliant"
                            },
                            {
                                InspectionID: 21,
                                StallID: 26,
                                StallName:
                                    "Adam Road Mee Soto",
                                InspectionScore: 88,
                                HygieneGrade: "B",
                                ComplianceStatus:
                                    "Compliant"
                            }
                        ];

                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: mockGrades
                            });

                        const result =
                            await hygieneGradeModel
                                .getHygieneGrades();

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

                        expect(result).toEqual(
                            mockGrades
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should return an empty array when there are no hygiene grades",
                    async () => {
                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        const result =
                            await hygieneGradeModel
                                .getHygieneGrades();

                        expect(result).toEqual(
                            []
                        );
                    }
                );

                test(
                    "should use row number to find the latest inspection for each stall",
                    async () => {
                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await hygieneGradeModel
                            .getHygieneGrades();

                        const query =
                            mockConnectionRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "ROW_NUMBER() OVER"
                        );

                        expect(query).toContain(
                            "PARTITION BY i.StallID"
                        );

                        expect(query).toContain(
                            "li.RowNumber = 1"
                        );
                    }
                );

                test(
                    "should only retrieve completed inspections",
                    async () => {
                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await hygieneGradeModel
                            .getHygieneGrades();

                        const query =
                            mockConnectionRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "i.InspectionStatus = 'Completed'"
                        );
                    }
                );

                test(
                    "should calculate compliant and non compliant statuses",
                    async () => {
                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await hygieneGradeModel
                            .getHygieneGrades();

                        const query =
                            mockConnectionRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "li.HygieneGrade IN ('A', 'B')"
                        );

                        expect(query).toContain(
                            "THEN 'Compliant'"
                        );

                        expect(query).toContain(
                            "ELSE 'Non-Compliant'"
                        );
                    }
                );

                test(
                    "should retrieve the latest inspection remark",
                    async () => {
                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await hygieneGradeModel
                            .getHygieneGrades();

                        const query =
                            mockConnectionRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "OUTER APPLY"
                        );

                        expect(query).toContain(
                            "SELECT TOP 1"
                        );

                        expect(query).toContain(
                            "ir.CreatedAt DESC"
                        );

                        expect(query).toContain(
                            "ir.RemarkID DESC"
                        );
                    }
                );

                test(
                    "should join the food stall and hawker centre tables",
                    async () => {
                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await hygieneGradeModel
                            .getHygieneGrades();

                        const query =
                            mockConnectionRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "INNER JOIN FoodStall fs"
                        );

                        expect(query).toContain(
                            "INNER JOIN HawkerCentre hc"
                        );
                    }
                );

                test(
                    "should sort hygiene grades by stall name",
                    async () => {
                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await hygieneGradeModel
                            .getHygieneGrades();

                        const query =
                            mockConnectionRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "fs.StallName ASC"
                        );
                    }
                );

                test(
                    "should throw an error when retrieving hygiene grades fails",
                    async () => {
                        mockConnectionRequest.query
                            .mockRejectedValue(
                                new Error(
                                    "query error"
                                )
                            );

                        await expect(
                            hygieneGradeModel
                                .getHygieneGrades()
                        ).rejects.toThrow(
                            "query error"
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should close the connection after retrieving hygiene grades",
                    async () => {
                        mockConnectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await hygieneGradeModel
                            .getHygieneGrades();

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );
            }
        );

        describe(
            "updateHygieneGrade",
            () => {
                const updateData = {
                    hygieneGrade: "A",
                    remark:
                        "Updated after officer review"
                };

                const mockUpdatedInspection = {
                    InspectionID: 22,
                    StallID: 25,
                    InspectionDate:
                        "2026-08-01",
                    InspectionScore: 97,
                    HygieneGrade: "A",
                    GradeExpiry:
                        "2027-08-01",
                    InspectionStatus:
                        "Completed"
                };

                const mockNewRemark = {
                    RemarkID: 30,
                    InspectionID: 22,
                    Remark:
                        "Updated after officer review",
                    CreatedAt:
                        "2026-08-01"
                };

                beforeEach(() => {
                    mockInspectionRequest.query
                        .mockResolvedValue({
                            recordset: [
                                mockUpdatedInspection
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
                    "should update a hygiene grade and insert a remark successfully",
                    async () => {
                        const result =
                            await hygieneGradeModel
                                .updateHygieneGrade(
                                    22,
                                    updateData
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
                                mockUpdatedInspection,

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
                    "should create a transaction using the sql connection",
                    async () => {
                        await hygieneGradeModel
                            .updateHygieneGrade(
                                22,
                                updateData
                            );

                        expect(
                            sql.Transaction
                        ).toHaveBeenCalledWith(
                            mockConnection
                        );
                    }
                );

                test(
                    "should provide the inspection id and hygiene grade inputs",
                    async () => {
                        await hygieneGradeModel
                            .updateHygieneGrade(
                                22,
                                updateData
                            );

                        expect(
                            mockInspectionRequest.input
                        ).toHaveBeenNthCalledWith(
                            1,
                            "InspectionID",
                            sql.Int,
                            22
                        );

                        expect(
                            mockInspectionRequest.input
                        ).toHaveBeenNthCalledWith(
                            2,
                            "HygieneGrade",
                            sql.Char(1),
                            "A"
                        );
                    }
                );

                test(
                    "should execute an inspection update query",
                    async () => {
                        await hygieneGradeModel
                            .updateHygieneGrade(
                                22,
                                updateData
                            );

                        const query =
                            mockInspectionRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "UPDATE Inspection"
                        );

                        expect(query).toContain(
                            "HygieneGrade"
                        );

                        expect(query).toContain(
                            "@HygieneGrade"
                        );

                        expect(query).toContain(
                            "@InspectionID"
                        );

                        expect(query).toContain(
                            "OUTPUT"
                        );
                    }
                );

                test(
                    "should set grade expiry to one year after the inspection date",
                    async () => {
                        await hygieneGradeModel
                            .updateHygieneGrade(
                                22,
                                updateData
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
                            "InspectionDate"
                        );
                    }
                );

                test(
                    "should insert a new inspection remark",
                    async () => {
                        await hygieneGradeModel
                            .updateHygieneGrade(
                                22,
                                updateData
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
                            "Updated after officer review"
                        );

                        const query =
                            mockRemarkRequest
                                .query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "INSERT INTO InspectionRemark"
                        );
                    }
                );

                test(
                    "should use two sql requests in the transaction",
                    async () => {
                        await hygieneGradeModel
                            .updateHygieneGrade(
                                22,
                                updateData
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
                    "should begin the transaction before committing",
                    async () => {
                        await hygieneGradeModel
                            .updateHygieneGrade(
                                22,
                                updateData
                            );

                        const beginOrder =
                            mockTransaction.begin
                                .mock
                                .invocationCallOrder[0];

                        const commitOrder =
                            mockTransaction.commit
                                .mock
                                .invocationCallOrder[0];

                        expect(beginOrder)
                            .toBeLessThan(
                                commitOrder
                            );
                    }
                );

                test(
                    "should rollback and return null when inspection is not found",
                    async () => {
                        mockInspectionRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        const result =
                            await hygieneGradeModel
                                .updateHygieneGrade(
                                    999,
                                    updateData
                                );

                        expect(result).toBeNull();

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
                    "should rollback when the inspection update fails",
                    async () => {
                        mockInspectionRequest.query
                            .mockRejectedValue(
                                new Error(
                                    "update error"
                                )
                            );

                        await expect(
                            hygieneGradeModel
                                .updateHygieneGrade(
                                    22,
                                    updateData
                                )
                        ).rejects.toThrow(
                            "update error"
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
                    }
                );

                test(
                    "should rollback when the remark insert fails",
                    async () => {
                        mockRemarkRequest.query
                            .mockRejectedValue(
                                new Error(
                                    "remark error"
                                )
                            );

                        await expect(
                            hygieneGradeModel
                                .updateHygieneGrade(
                                    22,
                                    updateData
                                )
                        ).rejects.toThrow(
                            "remark error"
                        );

                        expect(
                            mockTransaction.rollback
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            mockTransaction.commit
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should log an error when rollback fails",
                    async () => {
                        const rollbackError =
                            new Error(
                                "rollback error"
                            );

                        mockInspectionRequest.query
                            .mockRejectedValue(
                                new Error(
                                    "update error"
                                )
                            );

                        mockTransaction.rollback
                            .mockRejectedValue(
                                rollbackError
                            );

                        await expect(
                            hygieneGradeModel
                                .updateHygieneGrade(
                                    22,
                                    updateData
                                )
                        ).rejects.toThrow(
                            "update error"
                        );

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Hygiene grade rollback error:",
                            rollbackError
                        );
                    }
                );

                test(
                    "should close the connection after a successful update",
                    async () => {
                        await hygieneGradeModel
                            .updateHygieneGrade(
                                22,
                                updateData
                            );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should close the connection after a failed update",
                    async () => {
                        mockInspectionRequest.query
                            .mockRejectedValue(
                                new Error(
                                    "update error"
                                )
                            );

                        await expect(
                            hygieneGradeModel
                                .updateHygieneGrade(
                                    22,
                                    updateData
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