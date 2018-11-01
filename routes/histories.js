var https = require("https");
const express = require('express');
const router = express.Router();
const UserHistory = require('../models/userHistory.js');
var async = require('async');
/*
* get all user histories
*/
router.get('/histories', async (req, res, next) => {

    var limit = parseInt(req.query.limit) || 10;
    // filter: metadata, string
    var query = {};
    if (req.query.metadata) {
        try {
            const metadata = JSON.parse(req.query.metadata);
            for (let metaKey in metadata) {
                query[`metadata.${metaKey}`] = metadata[metaKey];
            }
        } catch (error) {
            console.log(error);
            query.metadata = req.query.metadata;
        }
    }

    // filter: project, string
    if (req.query.clientId) {
        query.clientId = req.query.clientId
    }

    // filter: project, string
    if (req.query.project) {
        query.project = req.query.project
    }

    // filter: eventType, string
    if (req.query.eventType) {
        query.eventType = req.query.eventType
    }

    // filter: event, string
    if (req.query.event) {
        query.event = req.query.event
    }


    // filter: event, string
    if (req.query.content) {
        query.content = req.query.content
    }

    // filter: user, string
    if (req.query.user) {
        query.user = req.query.user
    }

    // filter: ip, string
    if (req.query.ip) {
        query.ip = req.query.ip
    }

    // filter: start, string
    if (req.query.start) {
        query.createdAt = { $gte: new Date(req.query.start) }
    }

    // filter: end, string
    if (req.query.end) {
        query.createdAt = { $lte: new Date(req.query.end) }
    }


    UserHistory.find(query).sort({ createdAt: 'desc' }).limit(limit).then(function (data) {
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

/*
* get all user histories by daily
*/
router.get('/histories/daily', async (req, res, next) => {

    var limit = parseInt(req.query.limit) || 10;
    // filter: metadata, string
    var query = {};
    if (req.query.metadata) {
        try {
            const metadata = JSON.parse(req.query.metadata);
            for (let metaKey in metadata) {
                query[`metadata.${metaKey}`] = metadata[metaKey];
            }
        } catch (error) {
            console.log(error);
            query.metadata = req.query.metadata;
        }
    }

    // filter: project, string
    if (req.query.clientId) {
        query.clientId = req.query.clientId
    }

    // filter: project, string
    if (req.query.project) {
        query.project = req.query.project
    }

    // filter: eventType, string
    if (req.query.eventType) {
        query.eventType = req.query.eventType
    }

    // filter: event, string
    if (req.query.event) {
        query.event = req.query.event
    }


    // filter: event, string
    if (req.query.content) {
        query.content = req.query.content
    }

    // filter: user, string
    if (req.query.user) {
        query.user = req.query.user
    }

    // filter: ip, string
    if (req.query.ip) {
        query.ip = req.query.ip
    }

    // filter: start, string
    if (req.query.start) {
        query.createdAt = { $gte: new Date(req.query.start) }
    }

    // filter: end, string
    if (req.query.end) {
        query.createdAt = { $lte: new Date(req.query.end) }
    }


    UserHistory.aggregate([
        {
            $match: query
        },
        {
            $project: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                dayOfMonth: { $dayOfMonth: "$createdAt" },
                user: 1,
                project: 1,
                eventType: 1,
                event: 1,
                content: 1,
                metadata: 1,
                ip: 1,
                userAgent: 1,
                createdAt: 1
            }
        },
        {
            $sort: { createdAt: -1 }
        },
        {
            $group: {
                _id: {
                    year: '$year',
                    month: '$month',
                    dayOfMonth: '$dayOfMonth'
                },
                counts: { $sum: 1 },
                items: { $push: "$$ROOT" }
            }
        }
    ]).then(function (data) {
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


/*
* get all user histories by daily
*/
router.get('/histories/hourly', async (req, res, next) => {

    var limit = parseInt(req.query.limit) || 10;
    // filter: metadata, string
    var query = {};
    if (req.query.metadata) {
        try {
            const metadata = JSON.parse(req.query.metadata);
            for (let metaKey in metadata) {
                query[`metadata.${metaKey}`] = metadata[metaKey];
            }
        } catch (error) {
            console.log(error);
            query.metadata = req.query.metadata;
        }
    }

    // filter: project, string
    if (req.query.clientId) {
        query.clientId = req.query.clientId
    }

    // filter: project, string
    if (req.query.project) {
        query.project = req.query.project
    }

    // filter: eventType, string
    if (req.query.eventType) {
        query.eventType = req.query.eventType
    }

    // filter: event, string
    if (req.query.event) {
        query.event = req.query.event
    }


    // filter: event, string
    if (req.query.content) {
        query.content = req.query.content
    }

    // filter: user, string
    if (req.query.user) {
        query.user = req.query.user
    }

    // filter: ip, string
    if (req.query.ip) {
        query.ip = req.query.ip
    }

    // filter: start, string
    if (req.query.start) {
        query.createdAt = { $gte: new Date(req.query.start) }
    }

    // filter: end, string
    if (req.query.end) {
        query.createdAt = { $lte: new Date(req.query.end) }
    }


    UserHistory.aggregate([
        {
            $match: query
        },
        {
            $project: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
                dayOfMonth: { $dayOfMonth: "$createdAt" },
                hour: { $hour: "$createdAt" },
                user: 1,
                project: 1,
                eventType: 1,
                event: 1,
                content: 1,
                metadata: 1,
                ip: 1,
                userAgent: 1,
                createdAt: 1
            }
        },
        {
            $sort: { createdAt: -1 }
        }, {
            $group: {
                _id: {
                    year: '$year',
                    month: '$month',
                    dayOfMonth: '$dayOfMonth',
                    hour: '$hour'
                },
                counts: { $sum: 1 },
                items: { $push: "$$ROOT" }
            }
        }
    ]).then(function (data) {
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



/*
add a userHistory
*/
router.get('/histories/create', async (req, res, next) => {
    let query = req.query;
    try {
        query.metadata = JSON.parse(query.metadata);
    } catch (error) {
        console.log(error);
    }

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

module.exports = router;