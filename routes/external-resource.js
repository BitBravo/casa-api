const User = require('../models/user.js');
const ExternalResource = require('../models/external-resource.js');
const passport = require('passport');
const jwt = require('jsonwebtoken')
const express = require('express');
const router = express.Router();
var LocalStrategy = require('passport-local').Strategy;
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage });



/*
add external resource
*/
router.post('/external-resource',passport.authenticate('jwt'), async (req, res, next) => {
  if(!req.user || (req.user.role != 2 && req.user.role != 1)){
  return res.json({status:401 , message : "Unauthorized"})
  } 
        var createE = {
            admin: req.user._id,
            createdBy: req.user._id,
            title: req.body.title,
            description: req.body.description,
            cardImage :req.body.cardImage,
            topics:req.body.topics || [],
            tags:req.body.tags || []
          }
    ExternalResource.create(createE).then(function(user){
      res.json({status:200 , message:"External Resource Added Successfully"})
     }).catch(function(err){
         var reason  = err.message
         res.json({status:400 , message:reason})
         })

});

/*
edit an external resource
*/
router.put('/external-resource/:id',passport.authenticate('jwt'), async (req, res, next) => {
  var id  = req.params.id;
  var data = req.body;

  if(!req.user || (req.user.role != 2 && req.user.role != 1)){
    return res.json({status:401 , message : "Unauthorized"})
  }

  ExternalResource.update({_id:id},{$set:data}).then(function(data){
    res.json({status:200 , message:"Data Updated Successfully"})
  }).catch(function(err){
     res.json({status:500 ,message:err.message})
  })
});

/*
get all external resource
*/
router.get('/external-resource',passport.authenticate('jwt'),async (req, res, next) => {
  ExternalResource.find({createdBy:req.user._id}).then(function(data){
    res.json({status:200 , data:data})
  })
  .catch(function(err){
    res.json({status:500 ,message:err.message})
  })
});


/*
get one external resource info.
*/
router.get('/external-resource/:id',passport.authenticate('jwt'), async (req, res, next) => {
  var id = req.params.id ;
  ExternalResource.find({_id:id}).then(function(data){
    res.json({status:200 , data:data})
  })
  .catch(function(err){
    res.json({status:500 ,message:err.message})
  })
});


module.exports = router