/*
name: dayana sharafeena

file tested:
inspectionController.js

testing framework:
jest
*/

jest.mock(
    "../models/inspectionModel"
);

const inspectionModel =
    require("../models/inspectionModel");

const inspectionController =
    require("../controllers/inspectionController");

describe(
    "inspection controller unit tests",
    () => {
        let req;
        let res;
        let consoleErrorSpy;
        let consoleLogSpy;

        beforeEach(() => {
            jest.clearAllMocks();

            req = {
                body: {},
                params: {},
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

            consoleLogSpy =
                jest.spyOn(
                    console,
                    "log"
                )
                    .mockImplementation(
                        () => {}
                    );
        });

        afterEach(() => {
            consoleErrorSpy.mockRestore();
            consoleLogSpy.mockRestore();
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
                                    "Completed"
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
                                    "Completed"
                            }
                        ];

                        inspectionModel
                            .getAllInspections
                            .mockResolvedValue(
                                mockInspections
                            );

                        await inspectionController
                            .getAllInspections(
                                req,
                                res
                            );

                        expect(
                            inspectionModel
                                .getAllInspections
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            200
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith(
                            mockInspections
                        );
                    }
                );

                test(
                    "should return an empty array when there are no inspection records",
                    async () => {
                        inspectionModel
                            .getAllInspections
                            .mockResolvedValue(
                                []
                            );

                        await inspectionController
                            .getAllInspections(
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
                    "should return status 500 when retrieving inspections fails",
                    async () => {
                        const mockError =
                            new Error(
                                "database error"
                            );

                        inspectionModel
                            .getAllInspections
                            .mockRejectedValue(
                                mockError
                            );

                        await inspectionController
                            .getAllInspections(
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
                                "Error retrieving inspection history"
                        });

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Get inspection history error:",
                            mockError
                        );
                    }
                );
            }
        );

        describe(
            "createInspection",
            () => {
                test(
                    "should create an inspection successfully",
                    async () => {
                        req.body = {
                            officerID: "1",
                            stallID: "25",
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore:
                                "97",
                            hygieneGrade:
                                "a",
                            remark:
                                "  Good hygiene standards  "
                        };

                        const mockCreatedInspection = {
                            inspection: {
                                InspectionID: 22,
                                OfficerID: 1,
                                StallID: 25,
                                InspectionDate:
                                    "2026-08-01",
                                InspectionScore: 97,
                                HygieneGrade: "A",
                                InspectionStatus:
                                    "Completed"
                            },

                            remark: {
                                RemarkID: 22,
                                InspectionID: 22,
                                Remark:
                                    "Good hygiene standards"
                            }
                        };

                        inspectionModel
                            .createInspection
                            .mockResolvedValue(
                                mockCreatedInspection
                            );

                        await inspectionController
                            .createInspection(
                                req,
                                res
                            );

                        expect(
                            inspectionModel
                                .createInspection
                        ).toHaveBeenCalledWith({
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 97,
                            hygieneGrade: "A",
                            remark:
                                "Good hygiene standards"
                        });

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            201
                        );

                        expect(
                            res.json
                        ).toHaveBeenCalledWith({
                            message:
                                "Inspection recorded successfully",

                            data:
                                mockCreatedInspection
                        });
                    }
                );

                test(
                    "should convert lowercase hygiene grade to uppercase",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 88,
                            hygieneGrade: "b",
                            remark:
                                "Good standards"
                        };

                        inspectionModel
                            .createInspection
                            .mockResolvedValue({
                                inspection: {
                                    InspectionID: 21
                                }
                            });

                        await inspectionController
                            .createInspection(
                                req,
                                res
                            );

                        expect(
                            inspectionModel
                                .createInspection
                        ).toHaveBeenCalledWith(
                            expect.objectContaining({
                                hygieneGrade: "B"
                            })
                        );
                    }
                );

                test(
                    "should trim the inspection remark",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 88,
                            hygieneGrade: "B",
                            remark:
                                "  Clean preparation area  "
                        };

                        inspectionModel
                            .createInspection
                            .mockResolvedValue({
                                inspection: {
                                    InspectionID: 21
                                }
                            });

                        await inspectionController
                            .createInspection(
                                req,
                                res
                            );

                        expect(
                            inspectionModel
                                .createInspection
                        ).toHaveBeenCalledWith(
                            expect.objectContaining({
                                remark:
                                    "Clean preparation area"
                            })
                        );
                    }
                );

                test(
                    "should return status 400 when officer id is missing",
                    async () => {
                        req.body = {
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Invalid officer ID"
                        });

                        expect(
                            inspectionModel
                                .createInspection
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when officer id is invalid",
                    async () => {
                        req.body = {
                            officerID: "invalid",
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Invalid officer ID"
                        });
                    }
                );

                test(
                    "should return status 400 when officer id is zero",
                    async () => {
                        req.body = {
                            officerID: 0,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Invalid officer ID"
                        });
                    }
                );

                test(
                    "should return status 400 when stall id is missing",
                    async () => {
                        req.body = {
                            officerID: 1,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Invalid stall ID"
                        });

                        expect(
                            inspectionModel
                                .createInspection
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when stall id is invalid",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: "invalid",
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Invalid stall ID"
                        });
                    }
                );

                test(
                    "should return status 400 when inspection date is missing",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Inspection date is required"
                        });
                    }
                );

                test(
                    "should return status 400 when inspection date is invalid",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "not-a-date",
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Invalid inspection date"
                        });
                    }
                );

                test(
                    "should return status 400 when inspection date is in the future",
                    async () => {
                        const futureDate =
                            new Date();

                        futureDate.setDate(
                            futureDate.getDate() + 1
                        );

                        const futureDateString =
                            futureDate
                                .toISOString()
                                .split("T")[0];

                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                futureDateString,
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Inspection date cannot be in the future"
                        });

                        expect(
                            inspectionModel
                                .createInspection
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when inspection score is missing",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Inspection score must be between 0 and 100"
                        });
                    }
                );

                test(
                    "should return status 400 when inspection score is below zero",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: -1,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Inspection score must be between 0 and 100"
                        });
                    }
                );

                test(
                    "should return status 400 when inspection score is above 100",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 101,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Inspection score must be between 0 and 100"
                        });
                    }
                );

                test(
                    "should allow an inspection score of zero",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 0,
                            hygieneGrade: "D",
                            remark:
                                "Major hygiene issues"
                        };

                        inspectionModel
                            .createInspection
                            .mockResolvedValue({
                                inspection: {
                                    InspectionID: 23
                                }
                            });

                        await inspectionController
                            .createInspection(
                                req,
                                res
                            );

                        expect(
                            inspectionModel
                                .createInspection
                        ).toHaveBeenCalledWith(
                            expect.objectContaining({
                                inspectionScore: 0
                            })
                        );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            201
                        );
                    }
                );

                test(
                    "should allow an inspection score of one hundred",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 100,
                            hygieneGrade: "A",
                            remark:
                                "Excellent standards"
                        };

                        inspectionModel
                            .createInspection
                            .mockResolvedValue({
                                inspection: {
                                    InspectionID: 24
                                }
                            });

                        await inspectionController
                            .createInspection(
                                req,
                                res
                            );

                        expect(
                            inspectionModel
                                .createInspection
                        ).toHaveBeenCalledWith(
                            expect.objectContaining({
                                inspectionScore: 100
                            })
                        );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            201
                        );
                    }
                );

                test(
                    "should return status 400 when hygiene grade is missing",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            remark:
                                "Good standards"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Hygiene grade must be A, B, C or D"
                        });
                    }
                );

                test(
                    "should return status 400 when hygiene grade is invalid",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "E",
                            remark:
                                "Good standards"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Hygiene grade must be A, B, C or D"
                        });
                    }
                );

                test(
                    "should allow hygiene grade A",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        inspectionModel
                            .createInspection
                            .mockResolvedValue({
                                inspection: {
                                    InspectionID: 25
                                }
                            });

                        await inspectionController
                            .createInspection(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            201
                        );
                    }
                );

                test(
                    "should allow hygiene grade B",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 80,
                            hygieneGrade: "B",
                            remark:
                                "Acceptable standards"
                        };

                        inspectionModel
                            .createInspection
                            .mockResolvedValue({
                                inspection: {
                                    InspectionID: 26
                                }
                            });

                        await inspectionController
                            .createInspection(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            201
                        );
                    }
                );

                test(
                    "should allow hygiene grade C",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 60,
                            hygieneGrade: "C",
                            remark:
                                "Improvements required"
                        };

                        inspectionModel
                            .createInspection
                            .mockResolvedValue({
                                inspection: {
                                    InspectionID: 27
                                }
                            });

                        await inspectionController
                            .createInspection(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            201
                        );
                    }
                );

                test(
                    "should allow hygiene grade D",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 30,
                            hygieneGrade: "D",
                            remark:
                                "Major improvements required"
                        };

                        inspectionModel
                            .createInspection
                            .mockResolvedValue({
                                inspection: {
                                    InspectionID: 28
                                }
                            });

                        await inspectionController
                            .createInspection(
                                req,
                                res
                            );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            201
                        );
                    }
                );

                test(
                    "should return status 400 when inspection remark is missing",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "A"
                        };

                        await inspectionController
                            .createInspection(
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
                                "Inspection remark is required"
                        });
                    }
                );

                test(
                    "should return status 400 when inspection remark is empty spaces",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark: "   "
                        };

                        await inspectionController
                            .createInspection(
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
                                "Inspection remark is required"
                        });
                    }
                );

                test(
                    "should return status 400 when inspection remark exceeds one thousand characters",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "a".repeat(1001)
                        };

                        await inspectionController
                            .createInspection(
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
                                "Inspection remark cannot exceed 1000 characters"
                        });
                    }
                );

                test(
                    "should allow an inspection remark with exactly one thousand characters",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "a".repeat(1000)
                        };

                        inspectionModel
                            .createInspection
                            .mockResolvedValue({
                                inspection: {
                                    InspectionID: 29
                                }
                            });

                        await inspectionController
                            .createInspection(
                                req,
                                res
                            );

                        expect(
                            inspectionModel
                                .createInspection
                        ).toHaveBeenCalledTimes(
                            1
                        );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            201
                        );
                    }
                );

                test(
                    "should return status 400 when selected officer does not exist",
                    async () => {
                        req.body = {
                            officerID: 999,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        const foreignKeyError = {
                            number: 547
                        };

                        inspectionModel
                            .createInspection
                            .mockRejectedValue(
                                foreignKeyError
                            );

                        await inspectionController
                            .createInspection(
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
                                "The selected officer or food stall does not exist"
                        });
                    }
                );

                test(
                    "should return status 400 for nested sql foreign key error",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 999,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        const foreignKeyError = {
                            originalError: {
                                info: {
                                    number: 547
                                }
                            }
                        };

                        inspectionModel
                            .createInspection
                            .mockRejectedValue(
                                foreignKeyError
                            );

                        await inspectionController
                            .createInspection(
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
                                "The selected officer or food stall does not exist"
                        });
                    }
                );

                test(
                    "should return status 500 when creating an inspection fails",
                    async () => {
                        req.body = {
                            officerID: 1,
                            stallID: 25,
                            inspectionDate:
                                "2026-08-01",
                            inspectionScore: 90,
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        const mockError =
                            new Error(
                                "database error"
                            );

                        inspectionModel
                            .createInspection
                            .mockRejectedValue(
                                mockError
                            );

                        await inspectionController
                            .createInspection(
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
                                "Error recording inspection"
                        });

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Create inspection error:",
                            mockError
                        );
                    }
                );
            }
        );
    }
);