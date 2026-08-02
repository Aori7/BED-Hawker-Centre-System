/*
name: dayana sharafeena

file tested:
hygieneGradeController.js

testing framework:
jest
*/

jest.mock(
    "../models/hygieneGradeModel"
);

const hygieneGradeModel =
    require("../models/hygieneGradeModel");

const hygieneGradeController =
    require("../controllers/hygieneGradeController");

describe(
    "hygiene grade controller unit tests",
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
            "getHygieneGrades",
            () => {
                test(
                    "should return all hygiene grades successfully",
                    async () => {
                        const mockHygieneGrades = [
                            {
                                InspectionID: 22,
                                StallID: 25,
                                StallName:
                                    "Adam Road Nasi Lemak",
                                HygieneGrade: "A",
                                InspectionScore: 97,
                                InspectionStatus:
                                    "Completed"
                            },
                            {
                                InspectionID: 21,
                                StallID: 26,
                                StallName:
                                    "Adam Road Mee Soto",
                                HygieneGrade: "B",
                                InspectionScore: 88,
                                InspectionStatus:
                                    "Completed"
                            }
                        ];

                        hygieneGradeModel
                            .getHygieneGrades
                            .mockResolvedValue(
                                mockHygieneGrades
                            );

                        await hygieneGradeController
                            .getHygieneGrades(
                                req,
                                res
                            );

                        expect(
                            hygieneGradeModel
                                .getHygieneGrades
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
                            mockHygieneGrades
                        );
                    }
                );

                test(
                    "should return an empty array when there are no hygiene grades",
                    async () => {
                        hygieneGradeModel
                            .getHygieneGrades
                            .mockResolvedValue(
                                []
                            );

                        await hygieneGradeController
                            .getHygieneGrades(
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
                    "should return status 500 when retrieving hygiene grades fails",
                    async () => {
                        const mockError =
                            new Error(
                                "database error"
                            );

                        hygieneGradeModel
                            .getHygieneGrades
                            .mockRejectedValue(
                                mockError
                            );

                        await hygieneGradeController
                            .getHygieneGrades(
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
                                "Error retrieving hygiene grades"
                        });

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Get hygiene grades error:",
                            mockError
                        );
                    }
                );
            }
        );

        describe(
            "updateHygieneGrade",
            () => {
                test(
                    "should update a hygiene grade successfully",
                    async () => {
                        req.params.inspectionID =
                            "22";

                        req.body = {
                            hygieneGrade: "a",
                            remark:
                                "  Excellent hygiene standards  "
                        };

                        const mockUpdatedGrade = {
                            inspection: {
                                InspectionID: 22,
                                HygieneGrade: "A"
                            },

                            remark: {
                                RemarkID: 30,
                                InspectionID: 22,
                                Remark:
                                    "Excellent hygiene standards"
                            }
                        };

                        hygieneGradeModel
                            .updateHygieneGrade
                            .mockResolvedValue(
                                mockUpdatedGrade
                            );

                        await hygieneGradeController
                            .updateHygieneGrade(
                                req,
                                res
                            );

                        expect(
                            hygieneGradeModel
                                .updateHygieneGrade
                        ).toHaveBeenCalledWith(
                            22,
                            {
                                hygieneGrade: "A",
                                remark:
                                    "Excellent hygiene standards"
                            }
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
                                "Hygiene grade updated successfully",

                            data:
                                mockUpdatedGrade
                        });
                    }
                );

                test(
                    "should convert a lowercase hygiene grade to uppercase",
                    async () => {
                        req.params.inspectionID =
                            "22";

                        req.body = {
                            hygieneGrade: "b",
                            remark:
                                "Good standards"
                        };

                        hygieneGradeModel
                            .updateHygieneGrade
                            .mockResolvedValue({
                                InspectionID: 22,
                                HygieneGrade: "B"
                            });

                        await hygieneGradeController
                            .updateHygieneGrade(
                                req,
                                res
                            );

                        expect(
                            hygieneGradeModel
                                .updateHygieneGrade
                        ).toHaveBeenCalledWith(
                            22,
                            expect.objectContaining({
                                hygieneGrade: "B"
                            })
                        );
                    }
                );

                test(
                    "should trim the update remark",
                    async () => {
                        req.params.inspectionID =
                            "22";

                        req.body = {
                            hygieneGrade: "A",
                            remark:
                                "  Updated after review  "
                        };

                        hygieneGradeModel
                            .updateHygieneGrade
                            .mockResolvedValue({
                                InspectionID: 22
                            });

                        await hygieneGradeController
                            .updateHygieneGrade(
                                req,
                                res
                            );

                        expect(
                            hygieneGradeModel
                                .updateHygieneGrade
                        ).toHaveBeenCalledWith(
                            22,
                            expect.objectContaining({
                                remark:
                                    "Updated after review"
                            })
                        );
                    }
                );

                test(
                    "should return status 400 when inspection id is missing",
                    async () => {
                        req.params = {};

                        req.body = {
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await hygieneGradeController
                            .updateHygieneGrade(
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
                                "Invalid inspection ID"
                        });

                        expect(
                            hygieneGradeModel
                                .updateHygieneGrade
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when inspection id is invalid",
                    async () => {
                        req.params.inspectionID =
                            "invalid";

                        req.body = {
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await hygieneGradeController
                            .updateHygieneGrade(
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
                                "Invalid inspection ID"
                        });

                        expect(
                            hygieneGradeModel
                                .updateHygieneGrade
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when inspection id is zero",
                    async () => {
                        req.params.inspectionID =
                            "0";

                        req.body = {
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await hygieneGradeController
                            .updateHygieneGrade(
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
                                "Invalid inspection ID"
                        });
                    }
                );

                test(
                    "should return status 400 when inspection id is negative",
                    async () => {
                        req.params.inspectionID =
                            "-1";

                        req.body = {
                            hygieneGrade: "A",
                            remark:
                                "Good standards"
                        };

                        await hygieneGradeController
                            .updateHygieneGrade(
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
                                "Invalid inspection ID"
                        });
                    }
                );

                test(
                    "should return status 400 when hygiene grade is missing",
                    async () => {
                        req.params.inspectionID =
                            "22";

                        req.body = {
                            remark:
                                "Good standards"
                        };

                        await hygieneGradeController
                            .updateHygieneGrade(
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

                        expect(
                            hygieneGradeModel
                                .updateHygieneGrade
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when hygiene grade is invalid",
                    async () => {
                        req.params.inspectionID =
                            "22";

                        req.body = {
                            hygieneGrade: "E",
                            remark:
                                "Good standards"
                        };

                        await hygieneGradeController
                            .updateHygieneGrade(
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

                test.each([
                    "A",
                    "B",
                    "C",
                    "D"
                ])(
                    "should allow hygiene grade %s",
                    async (grade) => {
                        req.params.inspectionID =
                            "22";

                        req.body = {
                            hygieneGrade: grade,
                            remark:
                                "Updated standards"
                        };

                        hygieneGradeModel
                            .updateHygieneGrade
                            .mockResolvedValue({
                                InspectionID: 22,
                                HygieneGrade: grade
                            });

                        await hygieneGradeController
                            .updateHygieneGrade(
                                req,
                                res
                            );

                        expect(
                            hygieneGradeModel
                                .updateHygieneGrade
                        ).toHaveBeenCalledWith(
                            22,
                            {
                                hygieneGrade: grade,
                                remark:
                                    "Updated standards"
                            }
                        );

                        expect(
                            res.status
                        ).toHaveBeenCalledWith(
                            200
                        );
                    }
                );

                test(
                    "should return status 400 when update remark is missing",
                    async () => {
                        req.params.inspectionID =
                            "22";

                        req.body = {
                            hygieneGrade: "A"
                        };

                        await hygieneGradeController
                            .updateHygieneGrade(
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
                                "Update remarks are required"
                        });

                        expect(
                            hygieneGradeModel
                                .updateHygieneGrade
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should return status 400 when update remark contains only spaces",
                    async () => {
                        req.params.inspectionID =
                            "22";

                        req.body = {
                            hygieneGrade: "A",
                            remark: "   "
                        };

                        await hygieneGradeController
                            .updateHygieneGrade(
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
                                "Update remarks are required"
                        });
                    }
                );

                test(
                    "should return status 400 when update remark exceeds one thousand characters",
                    async () => {
                        req.params.inspectionID =
                            "22";

                        req.body = {
                            hygieneGrade: "A",
                            remark:
                                "a".repeat(1001)
                        };

                        await hygieneGradeController
                            .updateHygieneGrade(
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
                                "Update remarks cannot exceed 1000 characters"
                        });

                        expect(
                            hygieneGradeModel
                                .updateHygieneGrade
                        ).not.toHaveBeenCalled();
                    }
                );

                test(
                    "should allow an update remark with exactly one thousand characters",
                    async () => {
                        req.params.inspectionID =
                            "22";

                        req.body = {
                            hygieneGrade: "A",
                            remark:
                                "a".repeat(1000)
                        };

                        hygieneGradeModel
                            .updateHygieneGrade
                            .mockResolvedValue({
                                InspectionID: 22
                            });

                        await hygieneGradeController
                            .updateHygieneGrade(
                                req,
                                res
                            );

                        expect(
                            hygieneGradeModel
                                .updateHygieneGrade
                        ).toHaveBeenCalledTimes(
                            1
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
                        req.params.inspectionID =
                            "999";

                        req.body = {
                            hygieneGrade: "A",
                            remark:
                                "Updated standards"
                        };

                        hygieneGradeModel
                            .updateHygieneGrade
                            .mockResolvedValue(
                                undefined
                            );

                        await hygieneGradeController
                            .updateHygieneGrade(
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
                    "should return status 500 when updating hygiene grade fails",
                    async () => {
                        req.params.inspectionID =
                            "22";

                        req.body = {
                            hygieneGrade: "A",
                            remark:
                                "Updated standards"
                        };

                        const mockError =
                            new Error(
                                "database error"
                            );

                        hygieneGradeModel
                            .updateHygieneGrade
                            .mockRejectedValue(
                                mockError
                            );

                        await hygieneGradeController
                            .updateHygieneGrade(
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
                                "Error updating hygiene grade"
                        });

                        expect(
                            consoleErrorSpy
                        ).toHaveBeenCalledWith(
                            "Update hygiene grade error:",
                            mockError
                        );
                    }
                );
            }
        );
    }
);