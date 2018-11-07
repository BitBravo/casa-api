var https = require("https");
const express = require('express');
const router = express.Router();
const passport = require('passport');
var Token = require('../models/token.js');
const User = require('../models/user.js');
var config = require('../config/conf');



router.post('/saml', async (req, res, next) => {
    const RelayState = JSON.parse(req.body.RelayState);
     User.update({
          email: RelayState['email']
        }, {
          $set: {saml_cert: req.body.SAMLResponse}
        }).then(function(data) {
          if (RelayState['originUrl']) {
            res.redirect(RelayState['originUrl']);
          } else {
            res.redirect(config.public_url);  
          }
        }).catch(function(err) {
          console.log(err);
          if (RelayState['originUrl']) {
            res.redirect(RelayState['originUrl']);
          } else {
            res.redirect(config.public_url);  
          }
        })
    })

router.get('/', async (req, res, next) => {
    res.status(200).json({
            status: 200,
            message: "home page" + JSON.stringify(req.body)
        })

});

authenticate = function(user, response,course_id) {
  var options = {
    hostname: 'casacollege.myabsorb.com',
    path: '/api/Rest/v1/Authenticate',
    method: 'POST',
    headers: {"Content-Type" : "application/json"},
  };

  const postData = JSON.stringify(
      {"Username": config.absorb.username, "Password": config.absorb.password,
       "PrivateKey": config.absorb.private_key });
  var token = '';

  var req = https.request(options,
     (res) => {
          if (res.statusCode == 200) {
            res.on('data', function (chunk) {
              token += chunk.toString();
            });
            res.on('end', function (){
              Token.update({},{'token':token.substr(1).slice(0, -1),
                    'generation_time':new Date()}).then((r)=>{}).catch((e)=>{});
              createAbsorbUser(token.substr(1).slice(0, -1), user, response, course_id);
            });
          } else {
            console.log('error came ' + res.statusCode);
            return response.status(500).json({
                status: 500,
                message: "Absorb is not available write now."
            })
          }
    });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.write(postData);
  req.end();
};


// create absorb user based on token and user details
createAbsorbUser = function (token, user,response, course_id) {
  
  var postData = JSON.stringify({
      "DepartmentId": config.absorb.department_id,
      "FirstName": user.first_name,
      "LastName": user.last_name,
      "Username": user.email,
      "Password": user.email,
      "EmailAddress": user.email
      });
  var options = {
    hostname: 'casacollege.myabsorb.com',
    path: '/api/Rest/v1/createabsorbaccount',
    method: 'POST',
    headers: {"Content-Type" : "application/json", "Authorization" : token},
  };

  var req = https.request(options,
     (res) => {
          var resp = '';
          if (res.statusCode) {
            res.on('data', function (chunk) {
              resp += chunk.toString();
            });
            res.on('end', function (){
              resp = JSON.parse("{" + resp.substr(1).slice(0, -1)+ "}");
              
              options.path = '/api/Rest/v1/users/' + resp["Id"] +'/enrollments/' + course_id + '?reEnroll=true'
               console.log('options');
               var enroll = https.request(options,
                 (res) => {
                      var resp = '';
                      if (res.statusCode) {
                        res.on('data', function (chunk) {
                          resp += chunk.toString();
                        });
                        res.on('end', function (){
                          resp = JSON.parse("{" + resp.substr(1).slice(0, -1)+ "}");
                          console.log(resp);
                          console.log(user);

                          User.find({"email":user.email}).then(function(data){
                            console.log(data)
                            return response.status(200).json({
                                status: 200,
                                data: data
                            })
                          });
                        });
                      }
                    });
                  enroll.write(postData);
                  enroll.end();

            });
          } else {
             return response.status(400).json({
                status: 400,
                message: "Failed to generate token from absorb"
            })
          }

    });

  req.on('error', function(e) {
    console.log('problem with request: ' + e.message);
  });

  req.write(postData);
  req.end();

}


router.get('/absorbSso/:course_id',  passport.authenticate('jwt'),async (req, res, next) => {
  if (!req.user) {
      return res.status(401).json({
          status: 401,
          message: "Unauthorized access"
      })
  }

  
  Token.find({}).then((data)=>{
        // if no record generate token and save user
      if (!data.length){ 
        Token.create({token:'',
                    'generation_time':new Date()});
        authenticate(req.user, res, req.params.course_id);

      }
      else {
        let update_date =data[0].updatedAt;
        let expiry_period = (new Date()-update_date)/1000;
        if(expiry_period<3600){
          var token = '';
          token +=data[0].token;
          createAbsorbUser(token, req.user, res, req.params.course_id);
        } else {
          authenticate(req.user, res, req.params.course_id);
        }
      }
    });
})
module.exports = router;