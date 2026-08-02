/*
backend development
week 13 unit testing

name: dayana sharafeena

file tested:
dashboardController.js

testing framework:
jest
*/

jest.mock(
    "../models/dashboardModel"
);

const dashboardModel =
    require("../models/dashboardModel");

const dashboardController =
    require("../controllers/dashboardController");

describe(
    "dashboard controller unit tests",
    () => {
        let req;
        let res;
        let consoleErrorSpy;

        beforeEach(() => {
            jest.clearAllMocks();

            req = {
                params: {},
                body: {},
                user: {}
            };

            res = {
                status: jest.fn(),
                json: jest.fn()
            };

            res.status.mockReturnValue(res);

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
                            TotalInspections: 20,
                            CompliantStalls: 12,
                            NonCompliantStalls: 8,
                            GradeAStalls: 5
                        };

                        dashboardModel
                            .getDashboardStatistics
                            .mockResolvedValue(
                                mockStatistics
                            );

                        await dashboardController
                            .getDashboardStatistics(
                                req,
                                res
                            );

                        expect(
                            dashboardModel
                                .getDashboardStatistics
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            totalInspections: 20,
                            compliantStalls: 12,
                            nonCompliantStalls: 8,
                            gradeAStalls: 5
                        });
                    }
                );

                test(
                    "should return zero when statistic values are missing",
                    async () => {
                        dashboardModel
                            .getDashboardStatistics
                            .mockResolvedValue(
                                {}
                            );

                        await dashboardController
                            .getDashboardStatistics(
                                req,
                                res
                            );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            totalInspections: 0,
                            compliantStalls: 0,
                            nonCompliantStalls: 0,
                            gradeAStalls: 0
                        });
                    }
                );

                test(
                    "should return status 500 when retrieving statistics fails",
                    async () => {
                        dashboardModel
                            .getDashboardStatistics
                            .mockRejectedValue(
                                new Error(
                                    "database error"
                                )
                            );

                        await dashboardController
                            .getDashboardStatistics(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            500
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            error:
                                "Error retrieving dashboard statistics"
                        });
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
                                InspectionScore: 97,
                                HygieneGrade: "A",
                                InspectionStatus:
                                    "Completed"
                            },
                            {
                                InspectionID: 21,
                                StallName:
                                    "Adam Road Mee Soto",
                                InspectionScore: 88,
                                HygieneGrade: "B",
                                InspectionStatus:
                                    "Completed"
                            }
                        ];

                        dashboardModel
                            .getRecentInspections
                            .mockResolvedValue(
                                mockInspections
                            );

                        await dashboardController
                            .getRecentInspections(
                                req,
                                res
                            );

                        expect(
                            dashboardModel
                                .getRecentInspections
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith(
                            mockInspections
                        );
                    }
                );

                test(
                    "should return an empty array when there are no recent inspections",
                    async () => {
                        dashboardModel
                            .getRecentInspections
                            .mockResolvedValue(
                                []
                            );

                        await dashboardController
                            .getRecentInspections(
                                req,
                                res
                            );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith(
                            []
                        );
                    }
                );

                test(
                    "should return status 500 when retrieving recent inspections fails",
                    async () => {
                        dashboardModel
                            .getRecentInspections
                            .mockRejectedValue(
                                new Error(
                                    "database error"
                                )
                            );

                        await dashboardController
                            .getRecentInspections(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            500
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            error:
                                "Error retrieving recent inspections"
                        });
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
                        dashboardModel
                            .getTodayInspectionCount
                            .mockResolvedValue({
                                TodayInspections: 4
                            });

                        await dashboardController
                            .getTodayInspectionCount(
                                req,
                                res
                            );

                        expect(
                            dashboardModel
                                .getTodayInspectionCount
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            todayInspections: 4
                        });
                    }
                );

                test(
                    "should return zero when today's inspection count is missing",
                    async () => {
                        dashboardModel
                            .getTodayInspectionCount
                            .mockResolvedValue(
                                {}
                            );

                        await dashboardController
                            .getTodayInspectionCount(
                                req,
                                res
                            );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            todayInspections: 0
                        });
                    }
                );

                test(
                    "should return status 500 when retrieving today's inspection count fails",
                    async () => {
                        dashboardModel
                            .getTodayInspectionCount
                            .mockRejectedValue(
                                new Error(
                                    "database error"
                                )
                            );

                        await dashboardController
                            .getTodayInspectionCount(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            500
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            error:
                                "Error retrieving today's inspection count"
                        });
                    }
                );
            }
        );

        describe(
            "updateInspectionStatus",
            () => {
                test(
                    "should update an inspection status successfully",
                    async () => {
                        req.params.id = "21";

                        req.body = {
                            inspectionStatus:
                                "Completed"
                        };

                        const mockUpdatedInspection = {
                            InspectionID: 21,
                            InspectionStatus:
                                "Completed"
                        };

                        dashboardModel
                            .updateInspectionStatus
                            .mockResolvedValue(
                                mockUpdatedInspection
                            );

                        await dashboardController
                            .updateInspectionStatus(
                                req,
                                res
                            );

                        expect(
                            dashboardModel
                                .updateInspectionStatus
                        ).toHaveBeenCalledWith(
                            21,
                            "Completed"
                        );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            200
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            message:
                                "Inspection status updated successfully",

                            inspection:
                                mockUpdatedInspection
                        });
                    }
                );

                test(
                    "should return status 400 when inspection id is invalid",
                    async () => {
                        req.params.id =
                            "invalid";

                        req.body = {
                            inspectionStatus:
                                "Completed"
                        };

                        await dashboardController
                            .updateInspectionStatus(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            400
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            error:
                                "A valid inspection ID is required"
                        });

                        expect(
                            dashboardModel
                                .updateInspectionStatus
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when inspection id is zero",
                    async () => {
                        req.params.id = "0";

                        req.body = {
                            inspectionStatus:
                                "Completed"
                        };

                        await dashboardController
                            .updateInspectionStatus(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            400
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            error:
                                "A valid inspection ID is required"
                        });
                    }
                );

                test(
                    "should return status 400 when inspection status is missing",
                    async () => {
                        req.params.id = "21";

                        req.body = {};

                        await dashboardController
                            .updateInspectionStatus(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            400
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            error:
                                "Inspection status is required"
                        });

                        expect(
                            dashboardModel
                                .updateInspectionStatus
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when inspection status is invalid",
                    async () => {
                        req.params.id = "21";

                        req.body = {
                            inspectionStatus:
                                "Pending"
                        };

                        await dashboardController
                            .updateInspectionStatus(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            400
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            error:
                                "Inspection status must be Scheduled, Completed or Cancelled"
                        });

                        expect(
                            dashboardModel
                                .updateInspectionStatus
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should allow Scheduled as an inspection status",
                    async () => {
                        req.params.id = "21";

                        req.body = {
                            inspectionStatus:
                                "Scheduled"
                        };

                        dashboardModel
                            .updateInspectionStatus
                            .mockResolvedValue({
                                InspectionID: 21,
                                InspectionStatus:
                                    "Scheduled"
                            });

                        await dashboardController
                            .updateInspectionStatus(
                                req,
                                res
                            );

                        expect(
                            dashboardModel
                                .updateInspectionStatus
                        ).toHaveBeenCalledWith(
                            21,
                            "Scheduled"
                        );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            200
                        );
                    }
                );

                test(
                    "should allow Cancelled as an inspection status",
                    async () => {
                        req.params.id = "21";

                        req.body = {
                            inspectionStatus:
                                "Cancelled"
                        };

                        dashboardModel
                            .updateInspectionStatus
                            .mockResolvedValue({
                                InspectionID: 21,
                                InspectionStatus:
                                    "Cancelled"
                            });

                        await dashboardController
                            .updateInspectionStatus(
                                req,
                                res
                            );

                        expect(
                            dashboardModel
                                .updateInspectionStatus
                        ).toHaveBeenCalledWith(
                            21,
                            "Cancelled"
                        );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            200
                        );
                    }
                );

                test(
                    "should return status 404 when inspection record is not found",
                    async () => {
                        req.params.id = "999";

                        req.body = {
                            inspectionStatus:
                                "Completed"
                        };

                        dashboardModel
                            .updateInspectionStatus
                            .mockResolvedValue(
                                undefined
                            );

                        await dashboardController
                            .updateInspectionStatus(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            404
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            error:
                                "Inspection record not found"
                        });
                    }
                );

                test(
                    "should return status 500 when updating inspection status fails",
                    async () => {
                        req.params.id = "21";

                        req.body = {
                            inspectionStatus:
                                "Completed"
                        };

                        dashboardModel
                            .updateInspectionStatus
                            .mockRejectedValue(
                                new Error(
                                    "database error"
                                )
                            );

                        await dashboardController
                            .updateInspectionStatus(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            500
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            error:
                                "Error updating inspection status"
                        });
                    }
                );
            }
        );

        describe(
            "getOfficerProfile",
            () => {
                test(
                    "should return the logged in nea officer profile successfully",
                    async () => {
                        req.user = {
                            userID: 11,
                            role: "NEA Officer"
                        };

                        const mockOfficer = {
                            OfficerID: 1,
                            UserID: 11,
                            OfficerName:
                                "NEA Officer 1",
                            ContactNo:
                                "91234567"
                        };

                        dashboardModel
                            .getOfficerProfile
                            .mockResolvedValue(
                                mockOfficer
                            );

                        await dashboardController
                            .getOfficerProfile(
                                req,
                                res
                            );

                        expect(
                            dashboardModel
                                .getOfficerProfile
                        ).toHaveBeenCalledWith(
                            11
                        );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            200
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith(
                            mockOfficer
                        );
                    }
                );

                test(
                    "should return status 404 when officer profile is not found",
                    async () => {
                        req.user = {
                            userID: 999,
                            role: "NEA Officer"
                        };

                        dashboardModel
                            .getOfficerProfile
                            .mockResolvedValue(
                                undefined
                            );

                        await dashboardController
                            .getOfficerProfile(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            404
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            error:
                                "NEA officer profile not found"
                        });
                    }
                );

                test(
                    "should return status 500 when retrieving officer profile fails",
                    async () => {
                        req.user = {
                            userID: 11,
                            role: "NEA Officer"
                        };

                        dashboardModel
                            .getOfficerProfile
                            .mockRejectedValue(
                                new Error(
                                    "database error"
                                )
                            );

                        await dashboardController
                            .getOfficerProfile(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            500
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            error:
                                "Error retrieving NEA officer profile"
                        });
                    }
                );
            }
        );
    }
);