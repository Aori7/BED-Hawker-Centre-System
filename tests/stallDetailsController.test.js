/*
name: dayana sharafeena

file tested:
stallDetailsController.js

testing framework:
jest
*/

jest.mock(
    "../models/stallDetailsModel"
);

const stallDetailsModel =
    require("../models/stallDetailsModel");

const stallDetailsController =
    require("../controllers/stallDetailsController");

describe(
    "stall details controller unit tests",
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
            "getStallDetails",
            () => {
                test(
                    "should return food stall details successfully",
                    async () => {
                        req.params.stallID =
                            "25";

                        const mockStallDetails = {
                            StallID: 25,
                            StallName:
                                "Adam Road Nasi Lemak",
                            StallUnitNo:
                                "01-08",
                            OwnerID: 5,
                            HawkerCentreID: 8,
                            HCName:
                                "Adam Road Food Centre",
                            InspectionID: 22,
                            InspectionDate:
                                "2026-08-01",
                            InspectionScore: 97,
                            HygieneGrade: "A",
                            GradeExpiry:
                                "2027-08-01",
                            InspectionStatus:
                                "Completed",
                            ComplianceStatus:
                                "Compliant",
                            Remark:
                                "Excellent hygiene standards"
                        };

                        stallDetailsModel
                            .getStallDetails
                            .mockResolvedValue(
                                mockStallDetails
                            );

                        await stallDetailsController
                            .getStallDetails(
                                req,
                                res
                            );

                        expect(
                            stallDetailsModel
                                .getStallDetails
                        ).toHaveBeenCalledWith(
                            25
                        );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            200
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith(
                            mockStallDetails
                        );
                    }
                );

                test(
                    "should convert the stall id parameter to a number",
                    async () => {
                        req.params.stallID =
                            "26";

                        stallDetailsModel
                            .getStallDetails
                            .mockResolvedValue({
                                StallID: 26
                            });

                        await stallDetailsController
                            .getStallDetails(
                                req,
                                res
                            );

                        expect(
                            stallDetailsModel
                                .getStallDetails
                        ).toHaveBeenCalledWith(
                            26
                        );
                    }
                );

                test(
                    "should return status 400 when stall id is missing",
                    async () => {
                        req.params = {};

                        await stallDetailsController
                            .getStallDetails(
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
                                "Invalid food stall ID"
                        });

                        expect(
                            stallDetailsModel
                                .getStallDetails
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when stall id is not a number",
                    async () => {
                        req.params.stallID =
                            "invalid";

                        await stallDetailsController
                            .getStallDetails(
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
                                "Invalid food stall ID"
                        });

                        expect(
                            stallDetailsModel
                                .getStallDetails
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when stall id is zero",
                    async () => {
                        req.params.stallID =
                            "0";

                        await stallDetailsController
                            .getStallDetails(
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
                                "Invalid food stall ID"
                        });

                        expect(
                            stallDetailsModel
                                .getStallDetails
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when stall id is negative",
                    async () => {
                        req.params.stallID =
                            "-1";

                        await stallDetailsController
                            .getStallDetails(
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
                                "Invalid food stall ID"
                        });
                    }
                );

                test(
                    "should return status 400 when stall id is a decimal",
                    async () => {
                        req.params.stallID =
                            "25.5";

                        await stallDetailsController
                            .getStallDetails(
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
                                "Invalid food stall ID"
                        });
                    }
                );

                test(
                    "should return status 404 when food stall is not found",
                    async () => {
                        req.params.stallID =
                            "999";

                        stallDetailsModel
                            .getStallDetails
                            .mockResolvedValue(
                                undefined
                            );

                        await stallDetailsController
                            .getStallDetails(
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
                                "Food stall not found"
                        });
                    }
                );

                test(
                    "should return status 500 when retrieving stall details fails",
                    async () => {
                        req.params.stallID =
                            "25";

                        const mockError =
                            new Error(
                                "database error"
                            );

                        stallDetailsModel
                            .getStallDetails
                            .mockRejectedValue(
                                mockError
                            );

                        await stallDetailsController
                            .getStallDetails(
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
                                "Error retrieving food stall details"
                        });

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Get stall details error:",
                            mockError
                        );
                    }
                );
            }
        );

        describe(
            "getStallInspectionHistory",
            () => {
                test(
                    "should return a food stall inspection history successfully",
                    async () => {
                        req.params.stallID =
                            "25";

                        const mockHistory = [
                            {
                                InspectionID: 22,
                                StallID: 25,
                                InspectionDate:
                                    "2026-08-01",
                                InspectionScore: 97,
                                HygieneGrade: "A",
                                InspectionStatus:
                                    "Completed",
                                Remark:
                                    "Excellent hygiene standards"
                            },
                            {
                                InspectionID: 15,
                                StallID: 25,
                                InspectionDate:
                                    "2026-06-15",
                                InspectionScore: 85,
                                HygieneGrade: "B",
                                InspectionStatus:
                                    "Completed",
                                Remark:
                                    "Good standards"
                            }
                        ];

                        stallDetailsModel
                            .getStallInspectionHistory
                            .mockResolvedValue(
                                mockHistory
                            );

                        await stallDetailsController
                            .getStallInspectionHistory(
                                req,
                                res
                            );

                        expect(
                            stallDetailsModel
                                .getStallInspectionHistory
                        ).toHaveBeenCalledWith(
                            25
                        );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            200
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith(
                            mockHistory
                        );
                    }
                );

                test(
                    "should return an empty array when the stall has no inspection history",
                    async () => {
                        req.params.stallID =
                            "25";

                        stallDetailsModel
                            .getStallInspectionHistory
                            .mockResolvedValue(
                                []
                            );

                        await stallDetailsController
                            .getStallInspectionHistory(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            200
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith(
                            []
                        );
                    }
                );

                test(
                    "should convert the inspection history stall id to a number",
                    async () => {
                        req.params.stallID =
                            "26";

                        stallDetailsModel
                            .getStallInspectionHistory
                            .mockResolvedValue(
                                []
                            );

                        await stallDetailsController
                            .getStallInspectionHistory(
                                req,
                                res
                            );

                        expect(
                            stallDetailsModel
                                .getStallInspectionHistory
                        ).toHaveBeenCalledWith(
                            26
                        );
                    }
                );

                test(
                    "should return status 400 when history stall id is missing",
                    async () => {
                        req.params = {};

                        await stallDetailsController
                            .getStallInspectionHistory(
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
                                "Invalid food stall ID"
                        });

                        expect(
                            stallDetailsModel
                                .getStallInspectionHistory
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when history stall id is invalid",
                    async () => {
                        req.params.stallID =
                            "invalid";

                        await stallDetailsController
                            .getStallInspectionHistory(
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
                                "Invalid food stall ID"
                        });

                        expect(
                            stallDetailsModel
                                .getStallInspectionHistory
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when history stall id is zero",
                    async () => {
                        req.params.stallID =
                            "0";

                        await stallDetailsController
                            .getStallInspectionHistory(
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
                                "Invalid food stall ID"
                        });
                    }
                );

                test(
                    "should return status 400 when history stall id is negative",
                    async () => {
                        req.params.stallID =
                            "-5";

                        await stallDetailsController
                            .getStallInspectionHistory(
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
                                "Invalid food stall ID"
                        });
                    }
                );

                test(
                    "should return status 400 when history stall id is a decimal",
                    async () => {
                        req.params.stallID =
                            "25.5";

                        await stallDetailsController
                            .getStallInspectionHistory(
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
                                "Invalid food stall ID"
                        });
                    }
                );

                test(
                    "should return status 500 when retrieving stall inspection history fails",
                    async () => {
                        req.params.stallID =
                            "25";

                        const mockError =
                            new Error(
                                "database error"
                            );

                        stallDetailsModel
                            .getStallInspectionHistory
                            .mockRejectedValue(
                                mockError
                            );

                        await stallDetailsController
                            .getStallInspectionHistory(
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
                                "Error retrieving stall inspection history"
                        });

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Get stall inspection history error:",
                            mockError
                        );
                    }
                );
            }
        );
    }
);