var config = require('../config/conf');
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');


// this is just to test locally if multer is working fine.
const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, 'public/uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

const multerS3Config = multerS3({
    s3: new AWS.S3(config.s3_aws),
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    bucket:  'curtisdigital-casa-uploads',
    metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
    },
    key: function (req, file, cb) {
        if(file.fieldname=='file')
        cb(null, config.s3_cardImage_folder + '-' + Math.floor(Math.random() * 900 + 10) + '-' +  file.originalname )
        else{
         cb(null, config.s3_attachment_folder + '-' + Math.floor(Math.random() * 900 + 10) + '-' +  file.originalname )   
        }
    }
});

const upload = multer({
    storage: multerS3Config
})

module.exports = upload

