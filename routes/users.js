const User = require('../models/user.js');
const LoginLog = require('../models/login-log.js');
const Role = require('../models/role.js');
const Resource = require('../models/resource.js');
const express = require('express');
const router = express.Router();
var LocalStrategy = require('passport-local').Strategy;
const passport = require('passport');
const jwt = require('jsonwebtoken')
var _ = require('lodash');
const config = require('../config/conf.js');
const mandrill = require('mandrill-api/mandrill');
const mandrill_client = new mandrill.Mandrill(config.mandrillApiKey);
const request = require("request");

var CronJob = require('cron').CronJob;
new CronJob('*/10 * */8 * * */5', function () {
    var user = [];
    var popular = [];
    var oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    User.find({ "createdAt": { $lte: new Date(), $gte: oneWeekAgo } }).then(function (data) {
        data.forEach(d => {
            user.push(d);
        });

        Resource.find({ "createdAt": { $lte: new Date(), $gte: oneWeekAgo } }).sort({ "view_count": -1 }).limit(6).then(function (data) {
            data.forEach(d => {
                user.push(d);
            });

            let message = `<h3>Happy Friday!</h3>\
                            During the week of <strong>${new Date()}</strong> – <strong>${oneWeekAgo}</strong>\
                            <br>\
                            The number of users are added in portal is ${user.length}\n
                            <table><tr><th>S.NO</th><th>User Email</th><th>Created At</th></tr>`;
            let j = 1;
            user.forEach(d => {
                message += "<tr><td>" + j + "</td><td>" + d.email + "</td> <td>" + d.createdAt + "</td></tr>"
                j++;
            });
            message += `</table><br>Most Popular resources are\n
                        <table><tr><th>S.NO</th><th>User Email</th><th>Created At</th></tr>`;
            let i = 1;
            popular.forEach(d => {
                message += "<tr><td>" + j + "</td><td>" + d.title + "</td> <td>" + d.view_count + "</td></tr>"
                i++;
            });
            data += `</table>`;


            const params = {
                template_name: config.templateSlug,
                template_content: [],
                message: {
                    subject: 'Password Recovery',
                    to: [{
                        email: user.email,
                        type: 'to'
                    }],
                    code: message,
                    global_merge_vars: [{
                        "name": "PASS_RESET_LINK",
                        "content": 'https://casa-dev.crts.io/password/' + token
                    }]
                },
                async: false
            };

            mandrill_client.messages.sendTemplate(params, result => {
                return res.status(200).json({ message: 'Kindly check your email for further instructions' });
            }, e => {
                console.log(`'A mandrill error occurred: ${e.name} - ${e.message}`);
                return res.status(400).json({ message: `'A mandrill error occurred: ${e.name} - ${e.message}` });
            });
        });






        /*
        
          client.sendEmail({
          to: 'shannon.burnette@quotient.net'
        , from: 'ksinha@enbake.com'
         , subject: 'CASA '
         , message: '<h4>Greeting from Casa</h4>'+user
         , altText: 'plain text'
        }, 
            function (err, data, res) {
        console.log(err);
        console.log(data);
        console.log(res);
        });*/


    });
}, null, true, 'America/Los_Angeles');



new CronJob('0 0 8 * * */5', function () {
    var user = [];
    var popular = [];
    var oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    User.find({ "createdAt": { $lte: new Date(), $gte: oneWeekAgo } }).then(function (data) {
        data.forEach(d => {
            user.push(d);
        });

        Resource.find({ "createdAt": { $lte: new Date(), $gte: oneWeekAgo } }).sort({ "view_count": -1 }).limit(1).then(function (data) {
            data.forEach(d => {
                popular.push(d);
            });

            let Preceding_Week = "", New_User_Count = 0, Popular_Resource = "", View_Count = "";
            let months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

            Preceding_Week = `Friday, ${months[oneWeekAgo.getMonth()]} ${oneWeekAgo.getDate()} - Friday, ${months[new Date().getMonth()]} ${new Date().getDate()}`
            New_User_Count = user.length;
            if (popular.length > 0) {
                Popular_Resource = popular[0].title;
                View_Count = popular[0].view_count;
            }

            User.find({ $or: [{ role: "admin" }, { role: "super_admin" }] }).sort({
                createdAt: 'desc'
            }).then(function (admins) {
                if(admins.length > 0) {
                    admins.forEach(function (admin) {
                        const params = {
                            template_name: "casa-weekly-digest",
                            template_content: [],
                            message: {
                                subject: 'Weekly Digest Email',
                                to: [{
                                    email: admin.email,
                                    type: 'to'
                                }],
                                global_merge_vars: [
                                    {
                                        "name": "Preceding_Week",
                                        "content": Preceding_Week
                                    },
                                    {
                                        "name": "New_User_Count",
                                        "content": New_User_Count
                                    },
                                    {
                                        "name": "Popular_Resource",
                                        "content": Popular_Resource
                                    },
                                    {
                                        "name": "View_Count",
                                        "content": View_Count
                                    }
                                ]
                            },
                            async: false
                        };
            
                        mandrill_client.messages.sendTemplate(params, result => {
                            console.log(result);
                        }, e => {
                            console.log(e)
                        });
                    });
                }
            })
                .catch(function (err) {
                    console.log(err)
                })
           
        });
    });
}, null, true, 'America/Tegucigalpa');


/*
add an admin user
*/
router.post('/admins', passport.authenticate('jwt'), async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    passport.authenticate('register', async (err, user, info) => {
        if (err) {
            return res.status(303).json({
                status: 303,
                message: err
            })
        } else if (!user && info) {
            return res.status(400).json({
                message: info,
                status: 400
            })
        } else {
            return res.status(200).json({
                message: 'Registration successful',
                status: 200
            })
        }
    })(req, res, next);
});

/*
edit an admin user
*/
router.put('/admins/:id', passport.authenticate('jwt'), async (req, res, next) => {
    if (!req.user || (req.user.role == "admin" && req.body.role == "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    var id = req.params.id;
    var data = req.body

    User.update({
        _id: id
    }, {
            $set: data
        }).then(function (data) {
            return res.status(200).json({
                status: 200,
                message: "Data Updated Successfully"
            })
        }).catch(function (err) {
            return res.status(303).json({
                status: 303,
                message: err.message
            })
        })
});

/*
get all admin users.
*/
router.get('/admins', passport.authenticate('jwt'), async (req, res, next) => {
    limitOn = parseInt(req.query.count) || 20;
    skipOn = 0;

    var page = parseInt(req.query.page) || 1;

    if (page > 1) {

        skipOn = req.query.count ? (page * parseInt(req.query.count)) - parseInt(req.query.count) : (page * 20) - 20
    }
    // db.collection.find().skip(20).limit(10)
    User.find({ $or: [{ role: "admin" }, { role: "super_admin" }] }).sort({
        createdAt: 'desc'
    }).skip(skipOn).limit(limitOn).then(function (data) {
        return res.status(200).json({
            status: 200,
            data: data
        })
    })
        .catch(function (err) {
            return res.status(500).json({
                status: 500
            })
        })
});


/*
get one admin users.
*/
router.get('/admins/:id', passport.authenticate('jwt'), async (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized"
        })
    }

    var id = req.params.id;
    User.find({
        _id: id
    }).then(function (data) {
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
});

router.post('/admins/delete', passport.authenticate('jwt'), async (req, res, next) => {
    var arr = req.body.arr;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }

    User.remove({
        _id: {
            $in: arr
        }
    }).then(function (data) {
        return res.status(200).json({
            status: 200,
            message: "Data removed successfully"
        })
    }).catch(function (err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})

router.delete('/admins/:id', passport.authenticate('jwt'), async (req, res, next) => {
    var id = req.params.id;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }

    User.findOneAndRemove({
        _id: id
    }).then(function (data) {
        return res.status(200).json({
            status: 200,
            message: "Data removed successfully"
        })
    }).catch(function (err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})


/*
add an user
*/
router.post('/user', async (req, res, next) => {

    passport.authenticate('register_user', async (err, user, info) => {
        if (err) {
            return res.status(303).json({
                status: 303,
                message: err
            })
        } else if (!user && info) {
            return res.status(400).json({
                message: info,
                status: 400
            })
        } else {
            return res.status(200).json({
                message: 'Registration successful',
                status: 200
            })
        }
    })(req, res, next);
});

/*
edit an  user
*/
router.put('/user/:id', passport.authenticate('jwt'), async (req, res, next) => {
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    var id = req.params.id;
    var data = req.body

    User.update({
        _id: id
    }, {
            $set: data
        }).then(function (data) {
            return res.status(200).json({
                status: 200,
                message: "Data Updated Successfully"
            })
        }).catch(function (err) {
            return res.status(303).json({
                status: 303,
                message: err.message
            })
        })
});

/*
get all users.
*/
router.get('/user', passport.authenticate('jwt'), async (req, res, next) => {
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }

    limitOn = parseInt(req.query.count) || 20;
    skipOn = 0;

    var page = parseInt(req.query.page) || 1;

    if (page > 1) {

        skipOn = req.query.count ? (page * parseInt(req.query.count)) - parseInt(req.query.count) : (page * 20) - 20
    }
    User.find({}).sort({
        createdAt: 'desc'
    }).skip(skipOn).limit(limitOn).then(function (data) {
        return res.status(200).json({
            status: 200,
            data: data
        })
    })
        .catch(function (err) {
            return res.status(500).json({
                status: 500
            })
        })
});


/*
get one  users.
*/
router.get('/user/:id', passport.authenticate('jwt'), async (req, res, next) => {
    var id = req.params.id;
    User.find({
        _id: id
    }).then(function (data) {
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
});

router.post('/user/delete', passport.authenticate('jwt'), async (req, res, next) => {
    var arr = req.body.arr;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }

    User.remove({
        _id: {
            $in: arr
        }
    }).then(function (data) {
        return res.status(200).json({
            status: 200,
            message: "Data removed successfully"
        })
    }).catch(function (err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})

router.delete('/user/:id', passport.authenticate('jwt'), async (req, res, next) => {
    var id = req.params.id;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }

    User.findOneAndRemove({
        _id: id
    }).then(function (data) {
        return res.status(200).json({
            status: 200,
            message: "Data removed successfully"
        })
    }).catch(function (err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})

/*
login.
*/
router.post('/login', async (req, res, next) => {
    function ValidateEmail(mail) {
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail)) {
            return (true)
        }
        return (false)
    }
    const authPassword = req.body.password;
    var validate = ValidateEmail(req.body.email);
    if (!validate) {
        return res.status(400).json({
            status: 400,
            message: "Invalid Email"
        })
    }
    passport.authenticate('login', async (err, user, info) => {
        try {
            if (err || !user) {
                return res.send(info)
            }
            req.login(user, {
                session: true
            }, async (error) => {
                if (error) return next(error)
                //We don't want to store the sensitive information such as the
                //user password in the token so we pick only the email and id

                //auth0 signup
                const authEmail = user.email;
                let options = {
                    method: 'POST',
                    url: config.auth0.signup_url,
                    headers: { 'content-type': 'application/json' },
                    body:
                    {
                        client_id: config.auth0.client_id,
                        email: authEmail,
                        password: authPassword,
                        connection: config.auth0.connection,
                        user_metadata: {}
                    },
                    json: true
                };

                request(options, function (error, response, body) {
                    if (error) {
                        console.log(error);
                        throw new Error(error);
                    }
                    if (body._id) {
                        User.update({ email: authEmail }, { $set: { auth_id: body._id } })
                            .then(function (data) { })
                            .catch(function (err) {
                                console.log(err);
                            })
                    }
                });

                const body = {
                    _id: user._id,
                    email: user.email
                };
                const details = {
                    _id: user._id,
                    email: user.email,
                    phone: user.phone,
                    role: user.role,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    last_login: user.last_login,
                    customer_role: user.customer_role || 'admin'
                }
                //Sign the JWT token and populate the payload with the user email and id
                const token = jwt.sign(details, 'top_secrett');
                if (user.role == 'admin' || user.role == 'super_admin') {
                    LoginLog.create({
                        name: user.first_name + " " + user.last_name,
                        email: user.email, IP: req.connection.remoteAddress,
                        role: user.role
                    }).then(function (login) { });
                }

                //Send back the token to the user
                return res.status(200).json({
                    status: 200,
                    token: token,
                    userInfo: details,
                    message: "Login Successful"
                });
            });
        } catch (error) {
            return next(error);
        }
    })(req, res, next);
});



passport.serializeUser(function (user, done) {
    User.findOneAndUpdate({
        _id: user._id
    }, {
            $set: {
                "last_login": Date.now()
            }
        }).then(function (data) { }).catch(function (err) {
            console.log(err);
        })
    done(null, user);
});

passport.deserializeUser(function (user, done) {
    done(null, user);
});

router.get('/logout', async (req, res, next) => {
    req.logout();
    if (req.session) {
        req.session.destroy();
    }
    return res.status(200).json({
        status: 200,
        message: "logout Successful"
    });
});




router.get('/sendemail', async (req, resp, next) => {
    console.log("sendmail call are comming");
    var user = [];
    var oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    User.find({ "createdAt": { $lte: new Date(), $gte: oneWeekAgo }, "customer_role": { "$exists": true } }).then(function (data) {
        data.forEach(d => {
            user.push(d);
            console.log(d);
        });

        var message = "<table><tr><th>S.NO</th><th>User Email</th><th>Created At</th></tr>";
        let i = 1;
        user.forEach(d => {
            message += "<tr><td>" + i + "</td><td>" + d.email + "</td> <td>" + d.createdAt + "</td></tr>"
            i++;
        });
        message += "</table>";
        client.sendEmail({
            to: new Array("raman@enbake.com", "arpan@enbake.com")
            , from: 'raman@enbake.com'
            , subject: 'Weekly Users Update'
            , message: '<h3>Greeting from Casa</h3><br><br>' + message
            , altText: 'plain text'
        },
            function (err, data, res) {
                console.log(data);
                console.log("Error Message");
                console.log(err);
                return resp.status(200).json({ message: data });
            });



    });

});


/*
Add user roles.
*/
router.post('/role', passport.authenticate('jwt'), async (req, res, next) => {
    req.body.admin_email = req.user.email;
    Role.create(req.body).then(function (role) {
        if (role) {
            return res.status(200).json({
                status: 200,
                message: "Role Added Successfully"
            })
        }
    }).catch(function (err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})

router.put('/role/:id', passport.authenticate('jwt'), async (req, res, next) => {
    var id = req.params.id;
    var data = req.body;
    Role.update({
        _id: id
    }, {
            $set: data
        }).then(function (data) {
            if (data.length < 0) {
                return res.status(404).json({
                    status: 404,
                    data: data
                })
            } else
                return res.status(200).json({
                    status: 200,
                    message: "Role Updated Successfully"
                })
        })
        .catch(function (err) {
            return res.status(500).json({
                status: 500,
                message: err.message
            })
        })
})

router.get('/role', async (req, res, next) => {
    limitOn = parseInt(req.query.count) || 20;
    skipOn = 0;
    var page = parseInt(req.query.page) || 1;
    if (page > 1) {
        skipOn = req.query.count ? (page * parseInt(req.query.count)) - parseInt(req.query.count) : (page * 20) - 20
    }

    Role.find().sort({
        createdAt: 'desc'
    }).skip(skipOn).limit(limitOn).then(function (data) {
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

router.post('/role/delete', passport.authenticate('jwt'), async (req, res, next) => {
    var arr = req.body.arr;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }

    Role.remove({
        _id: {
            $in: arr
        }
    }).then(function (data) {
        return res.status(200).json({
            status: 200,
            message: "Data removed successfully"
        })
    }).catch(function (err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})

router.delete('/role/:id', passport.authenticate('jwt'), async (req, res, next) => {
    var id = req.params.id;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    Role.findOneAndRemove({
        _id: id
    }).then(function (data) {
        res.status(200).json({
            status: 200,
            message: "Data removed successfully"
        })
    }).catch(function (err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})



router.get('/loginlogs', passport.authenticate('jwt'), async (req, res, next) => {
    if (!req.user && !req.user.role) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    LoginLog.find({}).sort({ createdAt: 'desc' }).limit(100).then(function (data) {
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
});


module.exports = router