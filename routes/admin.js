const User = require('../models/user.js');
const passport = require('passport');
const jwt = require('jsonwebtoken')
const express = require('express');
const router = express.Router();
var LocalStrategy = require('passport-local').Strategy;

/*
add an admin user
*/
router.post('/api/admins',passport.authenticate('jwt'), async (req, res, next) => {
  if(!req.user || req.user.role == 2 ){
    return res.json({status:401 , message : "Unauthorized access"})
  }
   passport.authenticate('register', async (err, user, info ) => {  
   if(err){
    return res.json({status:400, message: err})
   }
   else{
      return res.json({
         message:'Registration successful',
         status:200
        })
   }
 })(req, res, next);
});

/*
edit an admin user
*/
router.put('/api/admins/:id',passport.authenticate('jwt'), async (req, res, next) => {
  if(!req.user || req.user.role == 2 ){
    return res.json({status:401 , message : "Unauthorized access"})
  }
  var id  = req.params.id;
  var data = req.body.data

  User.update({_id:id},{$set:data}).then(function(data){
    res.json({status:200 , message:"Data Updated Successfully"})
  }).catch(function(err){
     res.json({status:500})
  })
});

/*
get all admin users.
*/
router.get('/api/admins',passport.authenticate('jwt'), async (req, res, next) => {
  if(!req.user || req.user.role == 2 ){
  return res.json({status:401 , message : "Unauthorized"})
  }

  User.find({role:2}).then(function(data){
    res.json({status:200 , data:data})
  })
  .catch(function(err){
    res.json({status:500})
  })
});


/*
get one admin users.
*/
router.get('/api/admins/:id',passport.authenticate('jwt'), async (req, res, next) => {
  if(!req.user || req.user.role == 2 ){
  return res.json({status:401 , message : "Unauthorized"})
  }

  var id = req.params.id ;
  User.find({_id:id,role:2}).then(function(data){
    res.json({status:200 , data:data})
  })
  .catch(function(err){
    res.json({status:500})
  })
});