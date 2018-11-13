var https = require("https");
const express = require('express');
const router = express.Router();
const UserHistory = require('../models/userHistory.js');
var async = require('async');
/*
* get all user histories
*/
router.get('/histories', async (req, res, next) => {

    var limit = parseInt(req.query.limit) || 0;
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
        query.clientId = { $in: req.query.clientId.split(',') };
    }

    // filter: project, string
    if (req.query.project) {
        query.project = { $in: req.query.project.split(',') };
    }

    // filter: eventType, string
    if (req.query.eventType) {
        query.eventType = { $in: req.query.eventType.split(',') };
    }

    // filter: event, string
    if (req.query.event) {
        query.event = { $in: req.query.event.split(',') };
    }


    // filter: event, string
    if (req.query.content) {
        query.content = { $in: req.query.content.split(',') };
    }


    // filter: event, string
    if (req.query.action) {
        query.action = { $in: req.query.action.split(',') };
    }

    // filter: user, string
    if (req.query.user) {
        query.user = { $in: req.query.user.split(',') };
    }

    // filter: ip, string
    if (req.query.ip) {
        query.ip = { $in: req.query.ip.split(',') };
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
* get all user histories by year
*/
router.get('/histories/visitors/monthly', async (req, res, next) => {

    var limit = parseInt(req.query.limit) || 0;
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
        query.clientId = { $in: req.query.clientId.split(',') };
    }

    // filter: project, string
    if (req.query.project) {
        query.project = { $in: req.query.project.split(',') };
    }

    // filter: eventType, string
    if (req.query.eventType) {
        query.eventType = { $in: req.query.eventType.split(',') };
    }

    // filter: event, string
    if (req.query.event) {
        query.event = { $in: req.query.event.split(',') };
    }


    // filter: event, string
    if (req.query.content) {
        query.content = { $in: req.query.content.split(',') };
    }

    // filter: event, string
    if (req.query.action) {
        query.action = { $in: req.query.action.split(',') };
    }

    // filter: user, string
    if (req.query.user) {
        query.user = { $in: req.query.user.split(',') };
    }

    // filter: ip, string
    if (req.query.ip) {
        query.ip = { $in: req.query.ip.split(',') };
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
                metadata: 1,

                total: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: {
                    year: '$year',
                    month: '$month',
                    metadata: '$metadata.accountId'
                },
                counts: { $sum: 1 }
            },
        },
        
        {
            $group: {
                _id: {
                    year: '$_id.year',
                    month: '$_id.month',
                    metadata: '$_id.metadata.accountId'
                },
                counts: { $sum: 1 }
            },
        }
    ]).then(function (data) {
        if (data.length < 0) {
            return res.status(404).json({
                status: 404,
                data: data
            })
        } else {
            let total = 0;
            data.forEach(function (d) {
                total += d.counts;
            });
            return res.status(200).json({
                status: 200,
                data: {
                    total: total,
                    months: data
                }
            });
        }
    })
        .catch(function (err) {
            return res.status(500).json({
                status: 500,
                message: err.message
            })
        })
});

/*
* get all user histories by daily
*/
router.get('/histories/daily', async (req, res, next) => {

    var limit = parseInt(req.query.limit) || 0;
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
        query.clientId = { $in: req.query.clientId.split(',') };
    }

    // filter: project, string
    if (req.query.project) {
        query.project = { $in: req.query.project.split(',') };
    }

    // filter: eventType, string
    if (req.query.eventType) {
        query.eventType = { $in: req.query.eventType.split(',') };
    }

    // filter: event, string
    if (req.query.event) {
        query.event = { $in: req.query.event.split(',') };
    }


    // filter: event, string
    if (req.query.content) {
        query.content = { $in: req.query.content.split(',') };
    }

    // filter: event, string
    if (req.query.action) {
        query.action = { $in: req.query.action.split(',') };
    }

    // filter: user, string
    if (req.query.user) {
        query.user = { $in: req.query.user.split(',') };
    }

    // filter: ip, string
    if (req.query.ip) {
        query.ip = { $in: req.query.ip.split(',') };
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
                total: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: {
                    year: '$year',
                    month: '$month',
                    dayOfMonth: '$dayOfMonth'
                },
                counts: { $sum: 1 }
            },
        }
    ]).then(function (data) {
        if (data.length < 0) {
            return res.status(404).json({
                status: 404,
                data: data
            })
        } else {
            let total = 0;
            data.forEach(function (d) {
                total += d.counts;
            });
            return res.status(200).json({
                status: 200,
                data: {
                    total: total,
                    days: data
                }
            });
        }
    })
        .catch(function (err) {
            return res.status(500).json({
                status: 500,
                message: err.message
            })
        })
});

/*
* get all user histories by hourly
*/
router.get('/histories/hourly', async (req, res, next) => {

    var limit = parseInt(req.query.limit) || 0;
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
        query.clientId = { $in: req.query.clientId.split(',') };
    }

    // filter: project, string
    if (req.query.project) {
        query.project = { $in: req.query.project.split(',') };
    }

    // filter: eventType, string
    if (req.query.eventType) {
        query.eventType = { $in: req.query.eventType.split(',') };
    }

    // filter: event, string
    if (req.query.event) {
        query.event = { $in: req.query.event.split(',') };
    }


    // filter: event, string
    if (req.query.content) {
        query.content = { $in: req.query.content.split(',') };
    }

    // filter: event, string
    if (req.query.action) {
        query.action = { $in: req.query.action.split(',') };
    }

    // filter: user, string
    if (req.query.user) {
        query.user = { $in: req.query.user.split(',') };
    }

    // filter: ip, string
    if (req.query.ip) {
        query.ip = { $in: req.query.ip.split(',') };
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
                total: { $sum: 1 }
            }
        },
        {
            $group: {
                _id: {
                    year: '$year',
                    month: '$month',
                    dayOfMonth: '$dayOfMonth',
                    hour: '$hour'
                },
                counts: { $sum: 1 }
            },
        }
    ]).then(function (data) {
        if (data.length < 0) {
            return res.status(404).json({
                status: 404,
                data: data
            })
        } else {
            let total = 0;
            data.forEach(function (d) {
                total += d.counts;
            });
            return res.status(200).json({
                status: 200,
                data: {
                    total: total,
                    hours: data
                }
            });
        }
    })
        .catch(function (err) {
            return res.status(500).json({
                status: 500,
                message: err.message
            })
        })
});



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