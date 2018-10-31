const Featured = require('../models/featured.js');
const Resource = require('../models/resource.js');
const Type = require('../models/type.js');
const passport = require('passport');
const express = require('express');
const router = express.Router();
var upload = require('./upload.js');
var url = require('url');
var async = require("async");
var _ = require('lodash');
var elastic = require('./elasticsearch1.js');
var config = require('../config/conf');
const aws = require('aws-sdk');
var ses = require('node-ses');
aws.config = config.aws;
const lambda = new aws.Lambda();
const FILE_CONTENT_INDEXER_LAMBDA = config.FILE_CONTENT_INDEXER_LAMBDA;
var es = new elastic(config.host);
var s3 = new aws.S3(config.s3_aws);
client = ses.createClient(config.aws_lock);


S3deleteObject = function (item ) {
    var item = decodeURIComponent(item);
    var item = item.match(/([^\/]*)\/*$/)[1];

    s3.deleteObject({
      Bucket: config.s3_aws.Bucket,
      Key: config.s3_cardImage_folder + item
    },function (err,data){console.log(err);console.log(data);})
}
     //search results in UI: 
//https://es:q55uQ5t4EcUsXh8nhs2DcQGb5XCsdw@es.casa.crts.io/cards/_search?size=500
//curl -X POST "https://es:q55uQ5t4EcUsXh8nhs2DcQGb5XCsdw@es.casa.crts.io/cards/docs/_delete_by_query" -H 'Content-Type: application/json' -d' { "query": { "match_all": {  } } } '



/* for manually creating/updating index */
function createIndex(data) {
    var query = es.bulkQuery('cards', 'docs');
    query.create('my_id7', {env:"dev",title:'test 7777', audience: ['ab','bc']});
    query.create('my_id8', {env:"dev",title:'test 8888', audience: ['abddd','bcddd']});
    es.execBulk(query.value());
}

router.get('/tests', async (req, res, next) => {

    // prod: "https://es:q55uQ5t4EcUsXh8nhs2DcQGb5XCsdw@es.casa.crts.io/cards/docs",
    // dev: "https://es:q55uQ5t4EcUsXh8nhs2DcQGb5XCsdw@35.169.149.16/cards/docs"

    findOn = {publish : true};

    Resource.find(findOn).sort({createdAt: 'asc'}).then(function(data) {
        if (data.length > 0) {
            var query = es.bulkQuery('cards', 'docs');
            console.log(" starting for  " + data.length);
            for (var i in data) {
                resource = data[i];
                console.log(i + " **** " + resource._id);
                indexFileContentForSearch(resource);
                // query.create(resource._id, element);
            }
            es.execBulk(query.value());
        }
    });

    return res.status(200).json({
                message: 'ran successful',
                status: 200
            })
})

// indxing via lambda             
function indexFileContentForSearch(resource) {
    attachment = [];
    let url = resource.url == '' ?  'a' : resource.url ;
    
    element = {
            'env' : config.elastic_prod, "_id" : resource._id, "title" : resource.title,
            'audience' : resource.audience, 'html' : resource.html, 
            'topics' : resource.topics, 'type' : resource.type, 'url' : url,
    };

    if (resource.uploaded_files && resource.uploaded_files.length > 0) {
        resource.uploaded_files.forEach((a) => {
            if (a.url != '') attachment.push(a.url);
        });
    }

    element["attachment"] = attachment;
    
    return new Promise((resolve, reject) => {
        lambda.invoke({
            FunctionName: FILE_CONTENT_INDEXER_LAMBDA,
            Payload: JSON.stringify(element)
        }, (err, response) => {
            if (err) {
                console.log(err);
                reject(err);
            } else {
                resolve(response);
            }
        });
    }).catch((e) => console.log(e));
}



/*
add external resource
*/
router.post('/resource', passport.authenticate('jwt'), upload.any('file'), async (req, res, next) => {
    if (!req.user || !req.user.role) {
                return res.status(401).json({
                    status: 401,
                    message: "Unauthorized"
                })
            }

    // convert string to boolean
    if (req.body.isGated && req.body.isGated == 'true') req.body.isGated = true;
    else if (req.body.isGated && req.body.isGated == 'false') req.body.isGated = false;

    if (req.body.publish && req.body.publish == 'true') req.body.publish = true;
    else  if (req.body.publish && req.body.publish == 'false') req.body.publish = false;

    req.body.creator = req.user.first_name + " " + req.user.last_name;
    req.body.admin_id = req.user._id;

    req.body.cta = req.body.cta ? JSON.parse(req.body.cta) : []

    async.waterfall([
        function(cb) {              
                    if(req.files){
                        var arr = [];
                            async.each(req.files,function(item, done) {
                                   if(item.fieldname == 'file'){
                                       req.body['cardImage'] = item.location
                                    }
                                   else if(item.fieldname == 'multiple_file'){
                                      var i = {
                                        name:item.originalname,
                                        url:item.location
                                      }
                                      arr.push(i)
                                   }
                                done();
                            }, function(err) {
                                if(err) {
                                    console.log("There was an error" + err);
                                } else {
                                    if (arr.length > 0) req.body['uploaded_files'] = arr
                                    cb(null , "ok")
                                }
                            });
                    }
                    else{
                        cb(null , "ok")
                    }
        },
        function(ok, cb) {
                var temp = req.body["uploaded_files"];
                if(temp!=undefined){
    
                req.body["uploaded_files"] = [];
                for (i in temp) {
                    req.body["uploaded_files"].push({url: temp[i], name:temp[i]})
                }}
    
            if(ok == 'ok') {
                if (!req.body.type) type = 'dummy';
                
                Type.findOne({name:req.body.type}).then(function(data){
                  if (req.body.default_image && req.body.default_image== 'true'){
                    if(data){
                        req.body['cardImage'] = data.default_image;
                    }
                }}).then(function(){
                   Resource.create(req.body).then(function(resource)  {
                        indexFileContentForSearch(resource);

                        return res.status(200).json({
                            status: 200,
                            message: "Resource Added Successfully"
                        })
                    }).catch(function(err) {
                        var reason = err.message
                        return res.status(500).json({
                            status: 500,
                            message: reason
                        })
                    })
                })
            }
        }], function(err) {});
});

/*
edit an external resource
f*/
router.put('/resource/:id', passport.authenticate('jwt'), upload.any('file'), async (req, res, next) => {
    
   
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized"
        })
    }

     // convert string to boolean
    if (req.body.isGated && req.body.isGated == 'true') req.body.isGated = true;
    else if (req.body.isGated && req.body.isGated == 'false') req.body.isGated = false;

    if (req.body.publish && req.body.publish == 'true') req.body.publish = true;
    else  if (req.body.publish && req.body.publish == 'false') req.body.publish = false;

    var id = req.params.id;
    delete req.body.creator;

    req.body.cta = req.body.cta ? JSON.parse(req.body.cta) : []

    req.body.last_mod = Date.now();
    
    if (req.file) {
        req.body['cardImage'] = req.file.location;
    }

    for (i in req.files) {
        item = req.files[i];
         if(item.fieldname == 'file')    req.body['cardImage'] = item.location
         else if(item.fieldname == 'multiple_file'){
                req.body['uploaded_files'] = req.body['uploaded_files'] ? req.body['uploaded_files'] : [];
              req.body['uploaded_files'].push({
                name:item.originalname,
                url:item.location
              });
        }
    }
    var temp = req.body["uploaded_files"];
    if(temp!=undefined)
    {
        
    req.body["uploaded_files"] = [];

    for (i in temp) {
        req.body["uploaded_files"].push({url: temp[i], name:temp[i]})
    }
}

    History = {
        modified: Date.now(),
        editor: req.user.first_name + " " + req.user.last_name
    }

    async.waterfall([
        function(done)
        {
            if(req.body.default_image=='true'){
            
                Type.findOne({"name":req.body.type}).then(resolve=>{
                    req.body.cardImage =resolve.default_image;
                
                done(null);
            });
            }
            else
            {
                done(null);
            }
        },
        function(done)
        {
         
            Resource.findOneAndUpdate({
                _id: id
            }, {
                $set: req.body,
                $inc: {
                    revision: 1
                },
                $push: {
                    history: History
                }
            }).then(function(data) {
                if(req.body['cardImage'] && data.cardImage){
                     S3deleteObject(data.cardImage)
                }
                if(req.body['uploaded_files'] && data.uploaded_files){
                    for (i in data.uploaded_files)
                        S3deleteObject(data.uploaded_files[i].url)
                }
                
                req.body['_id'] = id;
                indexFileContentForSearch(req.body);

                return res.status(200).json({
                    status: 200,
                    message: "Data Updated Successfully"
                })
            }).catch(function(err) {
                return res.status(500).json({
                    status: 500,
                    message: err.message
                })
            })

            done(null);
        }],function(){});



});

/*
get all external resource
*/
router.get('/resource',async (req, res, next) => {
    sortOn = {
        createdAt: 'desc'
    };
    limit = parseInt(req.query.count) || 20;
    skipOn = 0 ;
    selectOn = null;
    findOn = {}

    if (req.query.sort == 'popularity') {
        sortOn['view_count'] = 'desc';
        limit = 2;
    }

    if (req.query.publish) {
        findOn = {publish : true};
    }


    var page = parseInt(req.query.page) || 1;

    if(page>1){

        skipOn = req.query.count?(page*parseInt(req.query.count))-parseInt(req.query.count) :(page*20)-20 
    }
    passport.authenticate('jwt', async (err, token) => {
      if(token && !token.role){
        
      }



         if(token && !token.role && token.customer_role || !token){
            findOn = {publish : true}
         }

         Resource.find(findOn).select(selectOn).sort(sortOn).skip(skipOn).limit(limit).then(function(data) {
            
            if (data.length < 0) {
                return res.status(404).json({
                    status: 404,
                    data: data
                })
            } else{ 
                data = fixCTA(data);

                   if(token && !token.role && token.customer_role || !token){
                      console.log(data.length);
                       var published_data = _.filter(data,(d)=> {
                        return d.publish == 'true'});
                       published_data = data;
                       
                       async.each(data,function(item, done) {
                       
                            if(item.isGated == true){
                                if(!token){
                                item.url = null;
                               }
                               // else if(token && !token.role && token.customer_role){
                               //      var roles = item.role
                               //      console.log(token.customer_role);
                               //      console.log(roles);
                               //      var index = roles.indexOf(token.customer_role)
                               //      if(index==-1){
                               //       item.url = null ;
                               //      }
                               // }
                            }
                     
                            done();
                        }, function(err) {
                            if(err) {
                                console.log("There was an error" + err);
                            } else {
                                res.status(200).json({status: 200,data: published_data})
                            }
                        });
                   }
                   else{
                   res.status(200).json({status: 200,data: data})
                    
                    
            } }
                
        })
        .catch(function(err) {
            return res.status(500).json({
                status: 500,
                message: err.message
            })
        })

    })(req, res, next);
});


function find_resource (res, findOn,skipOn,limitOn) {
    findOn['publish'] = true;
    Resource.find(findOn).skip(skipOn).limit(limitOn).then(function(data) {
        if (data.length < 0) {
                return res.status(404).json({
                    status: 404,
                    data: data
                })
            } else {
                if (findOn['_id'] && findOn['_id']["$in"]) {
                            let ids = findOn['_id']["$in"];
                            data.sort(function(a,b) {
                                    return ids.findIndex(id => a._id.equals(id)) -
                        ids.findIndex(id => b._id.equals(id));
                            });
                    }

                    data = fixCTA(data);

                return res.status(200).json({
                    status: 200,
                    data: data
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


function elastic_search (query, topics=[],audience=[],type=[]) {
    // query += ' ' + topics.join(' ')   + ' ' + audience.join( ' ') + ' ' + type.join (' ');
    // var filters =[ ];
    // if (topics.length > 0) filters.push( { "terms":  { "topics":  topics}});
    // if (audience.length > 0) filters.push( { "terms":  { "audience":  topics}});
    // if (type.length > 0) filters.push( { "terms":  { "type":  type}});
    const esQuery = {
            query: {
                bool: {
                    should: [{
                        "multi_match" : {
                             "query" : query, // search for exact match of any of thse word after space
                             fields : ["title^2", "url", "html", "upload_files.file.content"],
                              fuzziness: '1'
                        } },
                        {
                            query_string: {
                                "type": "phrase_prefix",
                                fields: ["title^2", "url", "html", "upload_files.file.content"],
                                query: query
                            }
                        },
                 ], 
                    minimum_should_match: 1,
                },
            },
            _source: ["_id", "title"]
        };

    return es.search(
        'cards',
        esQuery, {
            size: 100,
             sort: "_score:desc"
        });
}


/*
get resource info on the basis of filter.
*/
router.get('/filter', async (req, res, next) => {
     var dec = decodeURI(req.url);
     var api = url.parse(dec, true)
     var queryData = api.query;
     var limitOn = parseInt(req.query.count) || 20;
     var skipOn = 0;
     var page = parseInt(req.query.page) || 1;
     var findOn ={};

     if(page>1){
        skipOn = req.query.count?(page*parseInt(req.query.count))-parseInt(req.query.count) :(page*20)-20 
     }

     if(queryData.type){
        queryData.type =   typeof(queryData.type) =='string' ? queryData.type.split() :  queryData.type;
        findOn['type'] = { $in: queryData.type}  
    }

    if(queryData.topics){
        queryData.topics =   typeof(queryData.topics) =='string'? queryData.topics.split() :  queryData.topics;
        findOn['topics'] =  { $elemMatch: { $in: queryData.topics} }
    }

    if(queryData.audience){
        queryData.audience =   typeof(queryData.audience) =='string' ? queryData.audience.split() :  queryData.audience;
        findOn['audience'] =  { $elemMatch: { $in: queryData.audience} } 
    }

     if (req.query.search && req.query.search.length > 0 && req.query.search != 'undefined') {
         elastic_search(queryData.search, queryData.topics, queryData.audience, queryData.type).then((data) => {
            
            console.log(data[0].hits.hits);
            findOn['_id'] =  { $in: data[0].hits.hits.map(a => a._id)};
            find_resource (res, findOn,skipOn,limitOn);
        });
    
     } else {
        
        find_resource (res, findOn,skipOn,limitOn);
    }
    
})

increase_view_count = function(Slug){
    
    Resource.update({
            slug: Slug
        }, {
            $inc: {
                view_count: 1
            }
        }).then(function(data) {}, function(err) {
            console.log(err)
        })
}

increase_download_count = function(Slug){
    
    Resource.update({
            slug: Slug
        }, {
            $inc: {
                downloads: 1
            }
        }).then(function(data) {}, function(err) {
            console.log(err)
        })
}


/*
get one external resource info.
*/
router.get('/resource/:slug',async (req, res, next) => {
    var Slug = req.params.slug;
    var query = req.query;

    findOn = {
        slug: Slug
    }
    if (Slug == 'external' || Slug == 'native') {
        findOn = {
            origin: Slug
        }
    }
    if (Slug == 'dynamic') {
        findOn = {
            origin: {
                $nin: ['external', 'native']
            }
        }
    }
     passport.authenticate('jwt', async (err, token) => {

        Resource.find(findOn).sort({
            createdAt: 'desc'
        }).then(function(data) {
            if (data.length < 0) {
                return res.status(404).json({
                    status: 404,
                    data: data
                })
            } else {
                data = fixCTA(data);
                if (Slug != 'external' && Slug != 'dynamic' && Slug != 'native') {
                
                // if(!token && data[0].isGated){
                //   return res.status(401).json({message:"Unauthorized"})
                // }
                // all this commented code because any1 can see the details if requested.
                

                // if(token){
                      // if(data[0].isGated == true){
                      //   if(true){
                          if(query.data=="download"){    
                                increase_download_count(Slug);
                          }else{
                                increase_view_count(Slug);
                          }
                                   
                           return res.status(200).json({data:data})
                      //   }
                      //   else{
                      //     return res.status(401).json({message:"Unauthorized role"})
                      //   }
                      // }

                      // else{
                      //   increase_view_count(Slug)
                      //   return res.status(200).json({data:data})}
                      // }
               // else{
               //  increase_view_count(Slug)
               //  return res.status(200).json({status: 200,data: data})
                // }
            }
            else if(token.role && (Slug == 'external' || Slug == 'dynamic' || Slug == 'native')){
              return res.status(200).json({status: 200,data: data})
            }
           }
        })
        .catch(function(err) {
            return res.status(500).json({
                status: 500,
                message: err.message
            })
        })
 })(req, res, next);



})





router.post('/resource/delete', passport.authenticate('jwt'), async (req, res, next) => {
    var arr = req.body.arr;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }


    Resource.find({
        _id: {
            $in: arr
        }
    }).then(function(data) {
               async.each(data,function(item, done) {
                                S3deleteObject(item.cardImage);
                                if (item.uploaded_files)
                                    for (i in item.uploaded_files) S3deleteObject(item.uploaded_files[i].url)
                                done();
                            }, function(err) {
                                    Resource.remove({
                                            _id: {
                                                $in: arr
                                            }
                                        }).then(function(data) {
                                                    async.each(arr,function(item1, done1) {
                                                        var query = es.bulkQuery('cards', 'docs');
                                                        query.remove(item1)
                                                        es.execBulk(query.value());
                                                        done1();
                                                    }, function(err) {
                                                    })
                                               
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
    }).catch(function(err) {
    })
})

router.delete('/resource/:id', passport.authenticate('jwt'), async (req, res, next) => {
    var id = req.params.id;
    if (!req.user || (req.user.role != "admin" && req.user.role != "super_admin")) {
        return res.status(401).json({
            status: 401,
            message: "Unauthorized access"
        })
    }
    Resource.findOneAndRemove({
        _id: id
    }).then(function(data) {
        S3deleteObject(data.cardImage)

    var query = es.bulkQuery('cards', 'docs');
    query.remove(data._id);
    es.execBulk(query.value());


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


router.post('/upload_editor', upload.single('file'), async (req, res, next) => {

    return res.status(200).json({
                url: req.file.location
            });
})




router.post('/featured', passport.authenticate('jwt'), async (req, res, next) => {
    
    Featured.update(req.body).then(function(data)  {
                            return res.status(200).json({
                            status: 200,
                            message: "Featured Added Successfully"
                        })
                    }).catch(function(err) {
                        var reason = err.message
                        return res.status(500).json({
                            status: 500,
                            message: reason
                        })
                    })
   })



router.get('/featured', async (req, res, next) => {
    Featured.find().then(function(data) {
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

router.get('/list_publish',async (req, res, next) => {
    sortOn = {
        createdAt: 'desc'
    };
    limit = parseInt(req.query.count) || 20;
    selectOn = {'id':1, 'title':1};
    findOn = {publish : true};
    

    Resource.find(findOn).select(selectOn).sort(sortOn).limit(limit).then(function(data) {
            if (data.length < 0) {
                return res.status(404).json({
                    status: 404,
                    data: data
                })
            } else{ 
                 res.status(200).json({status: 200,data: data})
            }
        }).catch(function(err) {
            return res.status(500).json({
                status: 500,
                message: err.message
            })
        })
});

module.exports = router

function fixCTA(data) {
    data = JSON.parse(JSON.stringify(data));
    data = data.map(d => {
        if (d.cta.length === 0) {
            const cta = [{
                cta_display: d.cta_display || "Casa",
                is_cta_url: d.is_cta_url || false,
                cta_url: d.cta_url || "www.casa.com",
                cta_order: 0,
                is_cta_button: d.is_cta_button || false
            }];
            delete d.cta_display;
            delete d.is_cta_url;
            delete d.cta_url;
            delete d.is_cta_button;
            return Object.assign({}, { ...d }, { cta });

        } else {
            delete d.cta_display;
            delete d.is_cta_url;
            delete d.cta_url;
            delete d.is_cta_button;
            return { ...d };
        }
    })
    return data;
}