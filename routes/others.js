var https = require("https");
const express = require('express');
const router = express.Router();
const passport = require('passport');
const Redirect = require('../models/redirect.js');
var fs = require('fs');
var config = require('../config/conf');
var async = require('async');
const {exec} =require('child_process');
/*
* get the  redirect url for the requested uri
*/
router.get('/get_redirect', async (req, res, next) => {
    var url = req.query.url;

  Redirect.findOneAndUpdate({"url": url}, {$inc: {hits: 1}}).then(function(data) {
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
    .catch(function(err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})


/*
* get all redirect urls
*/
router.get('/redirect', passport.authenticate('jwt'), async (req, res, next) => {
  if (!req.user && !req.user.role) {
      return res.status(401).json({
          status: 401,
          message: "Unauthorized access"
      })
  }

  var limitOn = parseInt(req.query.count) || 200;
  Redirect.find({}).sort({createdAt:'desc'}).limit(limitOn).then(function(data) {
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
    .catch(function(err) {
        return res.status(500).json({
            status: 500,
            message: err.message
        })
    })
})


/*
add a redirect
*/
router.post('/redirect', passport.authenticate('jwt'), async (req, res, next) => {
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }

    Redirect.find({"url":req.body.url}).
    then((data)=>{
        if(data.length==0){
            Redirect.create(req.body).then(function(redirect) {
            if (redirect){
                fileManagement();
                return res.status(200).json({
                    status: 200,
                    message: "Redirect Added Successfully"
                })
            }
            })
            .catch(function(err) {
                return res.status(500).json({
                    status: 500,
                    message: err.message
            })
            })
        }
        else{
            return res.status(502).json({status:502,message:"duplicate entry"});
        }
    }).
    catch(e=>{console.log(e)});
    });

/*
edit a redirect
*/
router.put('/redirect/:id', passport.authenticate('jwt'),async (req, res, next) => {
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    var id = req.params.id;

    //Delete the file redirect.map
    
    Redirect.update({
        _id: id
    }, {
        $set: req.body
    }).then(function(data) {
            //call the file uploader to upload it
            fileManagement();
            res.status(200).json({
            status: 200,
            message: "Data Updated Successfully"
            });

    }).catch(function(err) {
        return res.status(303).json({
            status: 303,
            message: err.message
        })
    })
});


router.post('/redirect/delete', passport.authenticate('jwt'), async (req, res, next) => {
    var arr = req.body.arr;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
   

    Redirect.remove({
        _id: {
            $in: arr
        }
    }).then(function(data) {
        fileManagement();    
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

router.delete('/redirect/:id', passport.authenticate('jwt'), async (req, res, next) => {
    var id = req.params.id;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    Redirect.findOneAndRemove({
        _id: id
    }).then(function(data) {
        fileManagement();
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

function fileManagement(){
    fs.unlink(config.file,(e)=>{
        fs.writeFile(config.file,'',(e)=>{console.log("during writing file")});
        fs.chmodSync(config.file,'777');
        var str = '';
        var arr = [];
        Redirect.find({}).then((data)=>{
            data.forEach((element)=>{
                if (arr.indexOf(element.url.toLowerCase()) < 0) {
                    str += `${element.url} ${element.redirect_url};\n`;
                    arr.push(element.url.toLowerCase());
                }
            });

            fs.appendFile(config.file,str,(e)=>{
                fs.chmodSync(config.file, '777');
    
                exec('sudo service nginx restart', function(err, stdout, stderr) {
                    if (err) {
                        fs.writeFile(config.file,'',(e)=>{
                            fs.chmodSync(config.file, '777');
                            exec('sudo service nginx restart');
                        });
                    }
                });
            });
        });
    });

}

module.exports = router;