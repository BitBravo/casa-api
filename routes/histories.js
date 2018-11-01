var https = require("https");
const express = require('express');
const router = express.Router();
const UserHistory = require('../models/userHistory.js');
var async = require('async');
/*
* get all user histories
*/
router.get('/histories', async (req, res, next) => {

    var limitOn = parseInt(req.query.count) || 10;
    var clientId = req.query.clientId;
    UserHistory.find({ clientId: clientId }).sort({ createdAt: 'desc' }).limit(limitOn).then(function (data) {
        if (data.length < 0) {
            return res.status(404).json({
                status: 404,
                data: data
            })
        } else
            return res.status(200).json({
                status: 200,
                data: data
            })
    })
        .catch(function (err) {
            return res.status(500).json({
                status: 500,
                message: err.message
            })
        })
})

router.get('/histories/create', async (req, res, next) => {
    UserHistory.create(req.query).then(function (userHistory) {
        if (userHistory) {
            return res.status(200).json({
                status: 200,
                message: "UserHistory Added Successfully"
            })
        }
    })
    .catch(function (err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})

/*
add a userHistory
*/
router.post('/histories', async (req, res, next) => {
    UserHistory.create(req.body).then(function (userHistory) {
        if (userHistory) {
            return res.status(200).json({
                status: 200,
                message: "UserHistory Added Successfully"
            })
        }
    })
        .catch(function (err) {
            return res.status(500).json({
                status: 500,
                message: err.message
            })
        })
});

module.exports = router;