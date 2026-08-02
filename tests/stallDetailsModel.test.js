/*
name: dayana sharafeena

file tested:
stallDetailsModel.js

testing framework:
jest
*/

jest.mock("mssql");

const sql = require("mssql");

const stallDetailsModel =
    require("../models/stallDetailsModel");

describe(
    "stall details model unit tests",
    () => {
        let mockConnection;
        let mockRequest;

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
        });

        describe(
            "getStallDetails",
            () => {
                test(
                    "should return one food stall and its latest inspection successfully",
                    async () => {
                        const mockStall = {
                            StallID: 25,
                            HawkerCentreID: 8,
                            OwnerID: 5,
                            StallName:
                                "Adam Road Nasi Lemak",
                            StallUnitNo:
                                "01-08",
                            ImageURL:
                                "stall-image.jpg",
                            HCName:
                                "Adam Road Food Centre",
                            InspectionID: 22,
                            OfficerID: 1,
                            InspectionDate:
                                "2026-08-01",
                            InspectionScore: 97,
                            HygieneGrade: "A",
                            GradeExpiry:
                                "2027-08-01",
                            InspectionStatus:
                                "Completed",
                            Remark:
                                "Excellent hygiene standards",
                            ComplianceStatus:
                                "Compliant"
                        };

                        mockRequest.query
                            .mockResolvedValue({
                                recordset: [
                                    mockStall
                                ]
                            });

                        const result =
                            await stallDetailsModel
                                .getStallDetails(
                                    25
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

                        expect(
                            mockRequest.input
                        ).toHaveBeenCalledWith(
                            "StallID",
                            sql.Int,
                            25
                        );

                        expect(result).toEqual(
                            mockStall
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should return null when the food stall is not found",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        const result =
                            await stallDetailsModel
                                .getStallDetails(
                                    999
                                );

                        expect(result).toBeNull();

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should query the food stall and hawker centre tables",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await stallDetailsModel
                            .getStallDetails(
                                25
                            );

                        const query =
                            mockRequest.query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "FROM FoodStall fs"
                        );

                        expect(query).toContain(
                            "INNER JOIN HawkerCentre hc"
                        );

                        expect(query).toContain(
                            "fs.StallID = @StallID"
                        );
                    }
                );

                test(
                    "should retrieve the latest inspection using outer apply",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await stallDetailsModel
                            .getStallDetails(
                                25
                            );

                        const query =
                            mockRequest.query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "OUTER APPLY"
                        );

                        expect(query).toContain(
                            "SELECT TOP 1"
                        );

                        expect(query).toContain(
                            "FROM Inspection i"
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
                    "should retrieve the latest remark for the latest inspection",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await stallDetailsModel
                            .getStallDetails(
                                25
                            );

                        const query =
                            mockRequest.query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "FROM InspectionRemark ir"
                        );

                        expect(query).toContain(
                            "latestInspection.InspectionID"
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
                    "should calculate compliant status for grades A and B",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await stallDetailsModel
                            .getStallDetails(
                                25
                            );

                        const query =
                            mockRequest.query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "IN ('A', 'B')"
                        );

                        expect(query).toContain(
                            "THEN 'Compliant'"
                        );
                    }
                );

                test(
                    "should calculate non compliant status for grades C and D",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await stallDetailsModel
                            .getStallDetails(
                                25
                            );

                        const query =
                            mockRequest.query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "IN ('C', 'D')"
                        );

                        expect(query).toContain(
                            "THEN 'Non-Compliant'"
                        );
                    }
                );

                test(
                    "should return not inspected when there is no hygiene grade",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await stallDetailsModel
                            .getStallDetails(
                                25
                            );

                        const query =
                            mockRequest.query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "ELSE 'Not Inspected'"
                        );
                    }
                );

                test(
                    "should throw an error when retrieving stall details fails",
                    async () => {
                        mockRequest.query
                            .mockRejectedValue(
                                new Error(
                                    "database error"
                                )
                            );

                        await expect(
                            stallDetailsModel
                                .getStallDetails(
                                    25
                                )
                        ).rejects.toThrow(
                            "database error"
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should close the connection after retrieving stall details",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: [
                                    {
                                        StallID: 25
                                    }
                                ]
                            });

                        await stallDetailsModel
                            .getStallDetails(
                                25
                            );

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
            "getStallInspectionHistory",
            () => {
                test(
                    "should return all inspections for one food stall successfully",
                    async () => {
                        const mockHistory = [
                            {
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
                                Remark:
                                    "Excellent standards"
                            },
                            {
                                InspectionID: 15,
                                OfficerID: 1,
                                StallID: 25,
                                InspectionDate:
                                    "2026-06-15",
                                InspectionScore: 85,
                                HygieneGrade: "B",
                                GradeExpiry:
                                    "2027-06-15",
                                InspectionStatus:
                                    "Completed",
                                Remark:
                                    "Good standards"
                            }
                        ];

                        mockRequest.query
                            .mockResolvedValue({
                                recordset:
                                    mockHistory
                            });

                        const result =
                            await stallDetailsModel
                                .getStallInspectionHistory(
                                    25
                                );

                        expect(
                            mockRequest.input
                        ).toHaveBeenCalledWith(
                            "StallID",
                            sql.Int,
                            25
                        );

                        expect(result).toEqual(
                            mockHistory
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should return an empty array when the stall has no inspection history",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        const result =
                            await stallDetailsModel
                                .getStallInspectionHistory(
                                    25
                                );

                        expect(result).toEqual(
                            []
                        );
                    }
                );

                test(
                    "should query the inspection table using the stall id",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await stallDetailsModel
                            .getStallInspectionHistory(
                                25
                            );

                        const query =
                            mockRequest.query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "FROM Inspection i"
                        );

                        expect(query).toContain(
                            "i.StallID = @StallID"
                        );
                    }
                );

                test(
                    "should retrieve the latest remark for every inspection",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await stallDetailsModel
                            .getStallInspectionHistory(
                                25
                            );

                        const query =
                            mockRequest.query
                                .mock.calls[0][0];

                        expect(query).toContain(
                            "OUTER APPLY"
                        );

                        expect(query).toContain(
                            "SELECT TOP 1"
                        );

                        expect(query).toContain(
                            "FROM InspectionRemark ir"
                        );

                        expect(query).toContain(
                            "ir.InspectionID"
                        );

                        expect(query).toContain(
                            "i.InspectionID"
                        );
                    }
                );

                test(
                    "should order inspection history by newest date and id",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await stallDetailsModel
                            .getStallInspectionHistory(
                                25
                            );

                        const query =
                            mockRequest.query
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
                    "should throw an error when retrieving stall inspection history fails",
                    async () => {
                        mockRequest.query
                            .mockRejectedValue(
                                new Error(
                                    "history query error"
                                )
                            );

                        await expect(
                            stallDetailsModel
                                .getStallInspectionHistory(
                                    25
                                )
                        ).rejects.toThrow(
                            "history query error"
                        );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should close the connection after retrieving inspection history",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await stallDetailsModel
                            .getStallInspectionHistory(
                                25
                            );

                        expect(
                            mockConnection.close
                        ).toHaveBeenCalledTimes(
                            1
                        );
                    }
                );

                test(
                    "should connect to the database before retrieving inspection history",
                    async () => {
                        mockRequest.query
                            .mockResolvedValue({
                                recordset: []
                            });

                        await stallDetailsModel
                            .getStallInspectionHistory(
                                25
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