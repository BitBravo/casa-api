const User = require('../models/user.js');
const express = require('express');
const router = express.Router();
var async = require('async');
var crypto = require('crypto');
const config = require('../config/conf.js');
const mandrill = require('mandrill-api/mandrill');
const mandrill_client = new mandrill.Mandrill(config.mandrillApiKey);
const request = require('request');


router.post('/forgot', async (req, res, next) => {
  async.waterfall([
    function(done) {
      User.findOne({
        email: req.body.email
      }).exec(function(err, user) {
        if (user) {
          done(err, user);
        } else {
          done('User not found.');
        }
      });
    },
    function(user, done) {
      // create the random token
      crypto.randomBytes(20, function(err, buffer) {
        var token = buffer.toString('hex');
        done(err, user, token);
      });
    },
    function(user, token, done) {
      User.findByIdAndUpdate({ _id: user._id }, { reset_password_token: token , reset_password_expires: Date.now() + 86400000 }).exec(function(err, new_user) {
        done(err,token,user);
      });
    },
    // send mail by mandrill
    function(token, user, done) {

          const params = {
              template_name: config.templateSlug,
              template_content: [],
              message: {
                  subject: 'Password Recovery',
                  to: [{
                      email: user.email,
                      type: 'to'
                  }],
                  global_merge_vars: [  {
                              "name": "PASS_RESET_LINK",
                              "content": 'https://casa-dev.crts.io/password/'+token
                          }]
              },
              async: false
          };
          console.log(params.message.global_merge_vars[0].content);
        mandrill_client.messages.sendTemplate(params, result => {
            return res.status(200).json({ message: 'Kindly check your email for further instructions' });
        }, e => {
            console.log(`'A mandrill error occurred: ${e.name} - ${e.message}`);
            return res.status(400).json({ message: `'A mandrill error occurred: ${e.name} - ${e.message}` });
        });

    }
  ], function(err) {
    return res.status(422).json({ message: err });
  });
});


router.get('/password/:token', async (req, res, next) => {
  var token = req.params.token;
  User.findOne({reset_password_token:token }).then(function(data){
    if(!data){
      return res.status(404).json({ message: "Link is invalid ." });
    }
    else{
      var expiry_date = data.reset_password_expires;
      var today_date = Date.now();

      if(today_date<=expiry_date){
        return res.status(200).json({ message: "ok" });
      }
      else
      return res.status(404).json({ message: "Link is Expired/Invalid." });

    }

  })
})

router.post('/password/:token', async (req, res, next) => {
  var token = req.params.token;
  var password = req.body.password;
  User.findOne({reset_password_token:token }).then(function(data){
    if(!data){
      return res.status(404).json({ message: "Link is invalid ." });
    }
    else{
      var expiry_date = data.reset_password_expires;
      var today_date = Date.now();
      if(today_date<=expiry_date){
          if(data.auth_id) {
            let auth_id = data.auth_id;
            var authToken='';
            var options = { method: 'POST',
                            url: config.auth0.get_token_url,
                            headers: { 'content-type': 'application/json' },
                            body:
                             { grant_type: 'client_credentials',
                               client_id: config.auth0.client_id,
                               client_secret: config.auth0.client_secret,
                               audience: config.auth0.management_api },
                            json: true
                          };
            request(options, function (error, response, body) {
              if (error) throw new Error(error);
              authToken=body.access_token;
               var newOptions = { method: 'PATCH',
                                  url: `${config.auth0.management_api}users/auth0|${auth_id}`,
                                  headers: { 'content-type': 'application/json',
                                  authorization: `Bearer ${authToken}` },
                                  body:
                                  { password: req.body.password,
                                  connection: 'Username-Password-Authentication' },
                                  json: true
                                };

                request(newOptions, function (error, response, body) {
                  if (error){ throw new Error(error); console.log(`${error}`)}
                });
              })
          }
          User.findOneAndUpdate({ _id: data._id }, { password : req.body.password})
          .then(function(new_user) {
            return res.status(200).json({ message: "Password Updated" });
          },function(err){
             return res.status(500).json({ message:err });
          })
      }
      else{
      console.log('in 404')
      return res.status(404).json({ message: "Link is Expired/Invalid." });
      }
    }

  })


})

module.exports = router
