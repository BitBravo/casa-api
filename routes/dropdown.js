const Audience = require('../models/audience.js');
const Topic = require('../models/topic.js')
const Type = require('../models/type.js')
const Resource = require('../models/resource.js');


const passport = require('passport');
const jwt = require('jsonwebtoken')
const express = require('express');
const router = express.Router();
var upload = require('./upload.js');


/*
add an admin user
*/
router.post('/type', passport.authenticate('jwt'),upload.single('file'), async (req, res, next) => {
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    req.body.admin_email = req.user.email;
    req.body.name = (req.body.name).trim()


    if (req.file) {
        req.body['default_image'] = req.file.location
    }
    Type.create(req.body).then(function(type) {
        if (type) {
            return res.status(200).json({
                status: 200,
                message: "Type Added Successfully"
            })
        }
    }).catch(function(err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
});

/*
edit an admin user
*/
router.put('/type/:id', passport.authenticate('jwt'), upload.single('file'),async (req, res, next) => {
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    var id = req.params.id;
    if (req.file) {
        req.body['default_image'] = req.file.location;
    }

    req.body.name = (req.body.name).trim()
    var data = req.body

    Type.update({
        _id: id
    }, {
        $set: req.body
    }).then(function(data) {

            res.status(200).json({
            status: 200,
            message: "Data Updated Successfully"
            })

    }).catch(function(err) {
        return res.status(303).json({
            status: 303,
            message: err.message
        })
    })
});

/*
get all admin users.
*/
router.get('/type', async (req, res, next) => {
    limitOn = parseInt(req.query.count) || 500;
    skipOn = 0;
    var page = parseInt(req.query.page) || 1;
    if(page>1){
        skipOn = req.query.count?(page*parseInt(req.query.count))-parseInt(req.query.count) :(page*20)-20 
    }

    Type.find({}).sort({
            name: 'asc'
        }).skip(skipOn).limit(limitOn).then(function(data) {
            return res.status(200).json({
                status: 200,
                data: data
            })
        })
        .catch(function(err) {
            return res.status(500).json({
                status: 500
            })
        })
});


/*
get one admin users.
*/
router.get('/type/:id', passport.authenticate('jwt'), async (req, res, next) => {
    var id = req.params.id;
    Type.find({
            _id: id
        }).then(function(data) {
            return res.status(200).json({
                status: 200,
                data: data
            })
        })
        .catch(function(err) {
            return res.status(500).json({
                status: 500,
                message: err.message
            })
        })
});

router.post('/type/delete', passport.authenticate('jwt'), async (req, res, next) => {
    var arr = req.body.arr;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }

    Type.remove({
        _id: {
            $in: arr
        }
    }).then(function(data) {
        return res.status(200).json({
            status: 200,
            message: "Data removed successfully"
        })
    }).catch(function(err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})

router.delete('/type/:id', passport.authenticate('jwt'), async (req, res, next) => {
    var id = req.params.id;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }

    Type.findOneAndRemove({
        _id: id
    }).then(function(data) {
        return res.status(200).json({
            status: 200,
            message: "Data removed successfully"
        })
    }).catch(function(err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})

/*
add an admin user
*/
router.post('/audience', passport.authenticate('jwt'), async (req, res, next) => {
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    req.body.admin_email = req.user.email;
    req.body.name = (req.body.name).trim()
    Audience.create(req.body).then(function(type) {
        if (type) {
            return res.status(200).json({
                status: 200,
                message: "Audience Added Successfully"
            })
        }
    }).catch(function(err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
});

/*
edit an admin user
*/
router.put('/audience/:id', passport.authenticate('jwt'), async (req, res, next) => {
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    var id = req.params.id;
    req.body.name = (req.body.name).trim()
    var data = req.body

    Audience.update({
        _id: id
    }, {
        $set: data
    }).then(function(data) {
        return res.status(200).json({
            status: 200,
            message: "Data Updated Successfully"
        })
    }).catch(function(err) {
        return res.status(303).json({
            status: 303,
            message: err.message
        })
    })
});

/*
get all admin users.
*/
router.get('/audience',async (req, res, next) => {
    limitOn = parseInt(req.query.count) || 500;
    skipOn = 0;
    var page = parseInt(req.query.page) || 1;
    if(page>1){
         skipOn = req.query.count?(page*parseInt(req.query.count))-parseInt(req.query.count) :(page*20)-20 
    }

    Audience.find({}).sort({
            name: 'asc'
        }).skip(skipOn).limit(limitOn).then(function(data) {
            return res.status(200).json({
                status: 200,
                data: data
            })
        })
        .catch(function(err) {
            return res.status(500).json({
                status: 500
            })
        })
});


/*
get one admin users.
*/
router.get('/audience/:id', passport.authenticate('jwt'), async (req, res, next) => {

    var id = req.params.id;
    Audience.find({
            _id: id
        }).then(function(data) {
            return res.status(200).json({
                status: 200,
                data: data
            })
        })
        .catch(function(err) {
            return res.status(500).json({
                status: 500,
                message: err.message
            })
        })
});

router.post('/audience/delete', passport.authenticate('jwt'), async (req, res, next) => {
    var arr = req.body.arr;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }

    Audience.remove({
        _id: {
            $in: arr
        }
    }).then(function(data) {
        return res.status(200).json({
            status: 200,
            message: "Data removed successfully"
        })
    }).catch(function(err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})

router.delete('/audience/:id', passport.authenticate('jwt'), async (req, res, next) => {
    var id = req.params.id;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }

    Audience.findOneAndRemove({
        _id: id
    }).then(function(data) {
        return res.status(200).json({
            status: 200,
            message: "Data removed successfully"
        })
    }).catch(function(err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})


/*
add an admin user
*/
router.post('/topic', passport.authenticate('jwt'), async (req, res, next) => {
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    req.body.admin_email = req.user.email;
    req.body.name = (req.body.name).trim()
    Topic.create(req.body).then(function(type) {
        if (type) {
            return res.status(200).json({
                status: 200,
                message: "Topic Added Successfully"
            })
        }
    }).catch(function(err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
});

/*
edit an admin user
*/
router.put('/topic/:id', passport.authenticate('jwt'), async (req, res, next) => {
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    var id = req.params.id;
    req.body.name = (req.body.name).trim()
    var data = req.body

    Topic.update({
        _id: id
    }, {
        $set: data
    }).then(function(data) {
        return res.status(200).json({
            status: 200,
            message: "Data Updated Successfully"
        })
    }).catch(function(err) {
        return res.status(303).json({
            status: 303,
            message: err.message
        })
    })
});

/*
get all admin users.
*/
router.get('/topic',async (req, res, next) => {
    limitOn = parseInt(req.query.count) || 500;
    skipOn = 0;
    var page = parseInt(req.query.page) || 1;
    if(page>1){
        skipOn = req.query.count?(page*parseInt(req.query.count))-parseInt(req.query.count) :(page*20)-20 
    }

    Topic.find({}).sort({
            name: 'asc'
        }).skip(skipOn).limit(limitOn).then(function(data) {
            return res.status(200).json({
                status: 200,
                data: data
            })
        })
        .catch(function(err) {
            return res.status(500).json({
                status: 500
            })
        })
});


/*
get one admin users.
*/
router.get('/topic/:id', passport.authenticate('jwt'), async (req, res, next) => {

    var id = req.params.id;
    Topic.find({
            _id: id
        }).then(function(data) {
            return res.status(200).json({
                status: 200,
                data: data
            })
        })
        .catch(function(err) {
            return res.status(500).json({
                status: 500,
                message: err.message
            })
        })
});

router.post('/topic/delete', passport.authenticate('jwt'), async (req, res, next) => {
    var arr = req.body.arr;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }

    Topic.remove({
        _id: {
            $in: arr
        }
    }).then(function(data) {
        return res.status(200).json({
            status: 200,
            message: "Data removed successfully"
        })
    }).catch(function(err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})

router.delete('/topic/:id', passport.authenticate('jwt'), async (req, res, next) => {
    var id = req.params.id;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }

    Topic.findOneAndRemove({
        _id: id
    }).then(function(data) {
        return res.status(200).json({
            status: 200,
            message: "Data removed successfully"
        })
    }).catch(function(err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})

module.exports = router