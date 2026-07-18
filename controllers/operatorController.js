const operatorModel = require("../models/operatorModel");

// ACCOUNT MANAGEMENT

exports.getProfile = (req, res) => {

    const operatorId = req.params.id;

    operatorModel.getOperatorProfile(
        operatorId,
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json(results[0]);
        }
    );
};

exports.updateProfile = (req, res) => {

    const operatorId = req.params.id;

    operatorModel.updateOperatorProfile(
        operatorId,
        req.body,
        (err) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json({
                message: "Profile updated successfully"
            });
        }
    );
};

exports.getLeaseStats = (req, res) => {

    const operatorId = req.params.id;

    operatorModel.getLeaseStatistics(
        operatorId,
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json(results[0]);
        }
    );
};

// SCHEDULE & PLANNING

exports.getCleaningSchedules = (req, res) => {

    const hawkerCentre =
    req.params.hawkerCentre;

    operatorModel.getCleaningSchedules(
        hawkerCentre,
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json(results);
        }
    );
};

exports.getMaintenanceSchedules = (req, res) => {

    const hawkerCentre =
    req.params.hawkerCentre;

    operatorModel.getMaintenanceSchedules(
        hawkerCentre,
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json(results);
        }
    );
};

exports.getInspectionSchedules = (req, res) => {

    const hawkerCentre =
    req.params.hawkerCentre;

    operatorModel.getInspectionSchedules(
        hawkerCentre,
        (err, results) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.status(200).json(results);
        }
    );
};