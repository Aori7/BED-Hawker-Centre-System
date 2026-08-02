/*
backend development
week 13 unit testing

name: dayana sharafeena

file tested:
dashboardModel.js

testing framework:
jest
*/

jest.mock("mssql");

const sql = require("mssql");

const dashboardModel =
    require("../models/dashboardModel");

describe(
    "dashboard model unit tests",
    () => {
        let mockConnection;
        let mockRequest;
        let consoleErrorSpy;

        beforeEach(() => {
            jest.clearAllMocks();

            mockRequest = {
                input: jest.fn(),
                query: jest.fn()
            };

            mockRequest.input.mockReturnValue(
                mockRequest
            );

            mockConnection = {
                request: jest.fn(),
                close: jest.fn()
            };

            mockConnection.request.mockReturnValue(
                mockRequest
            );

            mockConnection.close.mockResolvedValue();

            sql.connect.mockResolvedValue(
                mockConnection
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
            "getDashboardStatistics",
            () => {
                test(
                    "should return dashboard statistics successfully",
                    async () => {
                        const mockStatistics = {
                            TotalInspections: 25,
                            CompliantStalls: 15,
                            NonCompliantStalls: 10,
                            GradeAStalls: 8
                        };

                        mockRequest.query
                            .mockResolvedValue({
                                recordset: [
                                    mockStatistics
                                ]
                            });

                        const result =
                            await dashboardModel
                                .getDashboardStatistics();

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
                            mockRequest.query
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            result
                        ).toEqual(
                            mockStatistics
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should use a query that counts completed inspections",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: [
                                    {
                                        TotalInspections: 0
                                    }
                                ]
                            });

                        await dashboardModel
                            .getDashboardStatistics();

                        const query =
                            mockRequest.query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "COUNT(*) AS TotalInspections"
                        );

                        expect(query).toContain(
                            "WHERE InspectionStatus = 'Completed'"
                        );

                        expect(query).toContain(
                            "HygieneGrade IN ('A', 'B')"
                        );

                        expect(query).toContain(
                            "HygieneGrade IN ('C', 'D')"
                        );
                    }
                );

                test(
                    "should throw an error when retrieving dashboard statistics fails",
                    async () => {
                        const mockError =
                            new Error(
                                "database error"
                            );

                        mockRequest.query
                            .mockRejectedValue(
                                mockError
                            );

                        await expect(
                            dashboardModel
                                .getDashboardStatistics()
                        ).rejects.toThrow(
                            "database error"
                        );

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Database error:",
                            mockError
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should log an error when closing the connection fails",
                    async () => {
                        const closeError =
                            new Error(
                                "close error"
                            );

                        mockRequest.query
                            .mockResolvedValue({
                                recordset: [
                                    {
                                        TotalInspections: 5
                                    }
                                ]
                            });

                        mockConnection.close
                            .mockRejectedValue(
                                closeError
                            );

                        await dashboardModel
                            .getDashboardStatistics();

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Error closing connection:",
                            closeError
                        );
                    }
                );

                test(
                    "should not close a connection when connecting fails",
                    async () => {
                        sql.connect
                            .mockRejectedValue(
                                new Error(
                                    "connection error"
                                )
                            );

                        await expect(
                            dashboardModel
                                .getDashboardStatistics()
                        ).rejects.toThrow(
                            "connection error"
                        );

                        expect(
                            mockConnection.close
                        ).not.toHaveBeenCalled();
                    }
                );
            }
        );

        describe(
            "getRecentInspections",
            () => {
                test(
                    "should return recent inspections successfully",
                    async () => {
                        const mockInspections = [
                            {
                                InspectionID: 22,
                                StallName:
                                    "Adam Road Nasi Lemak",
                                HCName:
                                    "Adam Road Food Centre",
                                InspectionScore: 97,
                                HygieneGrade: "A",
                                InspectionStatus:
                                    "Completed"
                            },
                            {
                                InspectionID: 21,
                                StallName:
                                    "Adam Road Mee Soto",
                                HCName:
                                    "Adam Road Food Centre",
                                InspectionScore: 88,
                                HygieneGrade: "B",
                                InspectionStatus:
                                    "Completed"
                            }
                        ];

                        mockRequest.query
                            .mockResolvedValue({
                                recordset:
                                    mockInspections
                            });

                        const result =
                            await dashboardModel
                                .getRecentInspections();

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
                    "should return an empty array when there are no recent inspections",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        const result =
                            await dashboardModel
                                .getRecentInspections();

                        expect(result).toEqual(
                            []
                        );
                    }
                );

                test(
                    "should use a query that retrieves the latest five inspections",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await dashboardModel
                            .getRecentInspections();

                        const query =
                            mockRequest.query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "SELECT TOP 5"
                        );

                        expect(query).toContain(
                            "INNER JOIN FoodStall"
                        );

                        expect(query).toContain(
                            "INNER JOIN HawkerCentre"
                        );

                        expect(query).toContain(
                            "i.InspectionDate DESC"
                        );

                        expect(query).toContain(
                            "i.InspectionID DESC"
                        );
                    }
                );

                test(
                    "should throw an error when retrieving recent inspections fails",
                    async () => {
                        const mockError =
                            new Error(
                                "query error"
                            );

                        mockRequest.query
                            .mockRejectedValue(
                                mockError
                            );

                        await expect(
                            dashboardModel
                                .getRecentInspections()
                        ).rejects.toThrow(
                            "query error"
                        );

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Database error:",
                            mockError
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should log an error when closing the recent inspections connection fails",
                    async () => {
                        const closeError =
                            new Error(
                                "close error"
                            );

                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        mockConnection.close
                            .mockRejectedValue(
                                closeError
                            );

                        await dashboardModel
                            .getRecentInspections();

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Error closing connection:",
                            closeError
                        );
                    }
                );
            }
        );

        describe(
            "getTodayInspectionCount",
            () => {
                test(
                    "should return today's inspection count successfully",
                    async () => {
                        const mockCount = {
                            TodayInspections: 3
                        };

                        mockRequest.query
                            .mockResolvedValue({
                                recordset: [
                                    mockCount
                                ]
                            });

                        const result =
                            await dashboardModel
                                .getTodayInspectionCount();

                        expect(result).toEqual(
                            mockCount
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should use a query that counts completed inspections for today",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: [
                                    {
                                        TodayInspections: 0
                                    }
                                ]
                            });

                        await dashboardModel
                            .getTodayInspectionCount();

                        const query =
                            mockRequest.query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "COUNT(*) AS TodayInspections"
                        );

                        expect(query).toContain(
                            "InspectionStatus = 'Completed'"
                        );

                        expect(query).toContain(
                            "CAST(GETDATE() AS date)"
                        );
                    }
                );

                test(
                    "should throw an error when retrieving today's inspection count fails",
                    async () => {
                        const mockError =
                            new Error(
                                "database error"
                            );

                        mockRequest.query
                            .mockRejectedValue(
                                mockError
                            );

                        await expect(
                            dashboardModel
                                .getTodayInspectionCount()
                        ).rejects.toThrow(
                            "database error"
                        );

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Database error:",
                            mockError
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should log an error when closing today's inspection connection fails",
                    async () => {
                        const closeError =
                            new Error(
                                "close error"
                            );

                        mockRequest.query
                            .mockResolvedValue({
                                recordset: [
                                    {
                                        TodayInspections: 0
                                    }
                                ]
                            });

                        mockConnection.close
                            .mockRejectedValue(
                                closeError
                            );

                        await dashboardModel
                            .getTodayInspectionCount();

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Error closing connection:",
                            closeError
                        );
                    }
                );
            }
        );

        describe(
            "updateInspectionStatus",
            () => {
                test(
                    "should update and return an inspection successfully",
                    async () => {
                        const mockUpdatedInspection = {
                            InspectionID: 21,
                            StallID: 25,
                            OfficerID: 1,
                            InspectionStatus:
                                "Completed"
                        };

                        mockRequest.query
                            .mockResolvedValue({
                                recordset: [
                                    mockUpdatedInspection
                                ]
                            });

                        const result =
                            await dashboardModel
                                .updateInspectionStatus(
                                    21,
                                    "Completed"
                                );

                        expect(
                            mockRequest.input
                        ).toHaveBeenNthCalledWith(
                            1,
                            "InspectionID",
                            sql.Int,
                            21
                        );

                        expect(
                            mockRequest.input
                        ).toHaveBeenNthCalledWith(
                            2,
                            "InspectionStatus",
                            sql.VarChar(20),
                            "Completed"
                        );

                        expect(result).toEqual(
                            mockUpdatedInspection
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should return undefined when no inspection is updated",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        const result =
                            await dashboardModel
                                .updateInspectionStatus(
                                    999,
                                    "Completed"
                                );

                        expect(result).toBeUndefined();
                    }
                );

                test(
                    "should execute an update query using inspection parameters",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: [
                                    {
                                        InspectionID: 21
                                    }
                                ]
                            });

                        await dashboardModel
                            .updateInspectionStatus(
                                21,
                                "Scheduled"
                            );

                        const query =
                            mockRequest.query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "UPDATE Inspection"
                        );

                        expect(query).toContain(
                            "@InspectionStatus"
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
                    "should throw an error when updating an inspection fails",
                    async () => {
                        const mockError =
                            new Error(
                                "update error"
                            );

                        mockRequest.query
                            .mockRejectedValue(
                                mockError
                            );

                        await expect(
                            dashboardModel
                                .updateInspectionStatus(
                                    21,
                                    "Completed"
                                )
                        ).rejects.toThrow(
                            "update error"
                        );

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Database error:",
                            mockError
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should log an error when closing the update connection fails",
                    async () => {
                        const closeError =
                            new Error(
                                "close error"
                            );

                        mockRequest.query
                            .mockResolvedValue({
                                recordset: [
                                    {
                                        InspectionID: 21
                                    }
                                ]
                            });

                        mockConnection.close
                            .mockRejectedValue(
                                closeError
                            );

                        await dashboardModel
                            .updateInspectionStatus(
                                21,
                                "Completed"
                            );

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Error closing connection:",
                            closeError
                        );
                    }
                );
            }
        );

        describe(
            "getOfficerProfile",
            () => {
                test(
                    "should return an officer profile successfully",
                    async () => {
                        const mockOfficer = {
                            OfficerID: 1,
                            UserID: 11,
                            OfficerName:
                                "NEA Officer 1",
                            ContactNo:
                                "91234567"
                        };

                        mockRequest.query
                            .mockResolvedValue({
                                recordset: [
                                    mockOfficer
                                ]
                            });

                        const result =
                            await dashboardModel
                                .getOfficerProfile(
                                    11
                                );

                        expect(
                            mockRequest.input
                        ).toHaveBeenCalledWith(
                            "UserID",
                            sql.Int,
                            11
                        );

                        expect(result).toEqual(
                            mockOfficer
                        );
                    }
                );

                test(
                    "should return undefined when officer profile is not found",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        const result =
                            await dashboardModel
                                .getOfficerProfile(
                                    999
                                );

                        expect(result).toBeUndefined();
                    }
                );

                test(
                    "should execute a query using the logged in user id",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await dashboardModel
                            .getOfficerProfile(
                                11
                            );

                        const query =
                            mockRequest.query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "FROM NEA_Officer"
                        );

                        expect(query).toContain(
                            "WHERE UserID = @UserID"
                        );
                    }
                );

                test(
                    "should throw an error when retrieving officer profile fails",
                    async () => {
                        mockRequest.query
                            .mockRejectedValue(
                                new Error(
                                    "profile query error"
                                )
                            );

                        await expect(
                            dashboardModel
                                .getOfficerProfile(
                                    11
                                )
                        ).rejects.toThrow(
                            "profile query error"
                        );
                    }
                );

                test(
                    "should connect to the database before retrieving officer profile",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await dashboardModel
                            .getOfficerProfile(
                                11
                            );

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
                    }
                );
            }
        );
    }
);