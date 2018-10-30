const Joi = require('joi');
require('dotenv').config();

const envVarsSchema = Joi.object({

    
        DB_HOST:    Joi.string().required(),
        DB_SECRET:   Joi.string().required(), 
        mandrillApiKey:  Joi.string().required(),
        templateSlug:  Joi.string().required(),
        region1:  Joi.string().required(),
        accessKeyId1:  Joi.string().required(),
        secretAccessKey1: Joi.string().required(),
        accessKeyId:  Joi.string().required(),
        secretAccessKey:  Joi.string().required(),
        Bucket:  Joi.string().required(),
        s3_cardImage_folder:  Joi.string().required(),
        s3_attachment_folder:  Joi.string().required(),
        FILE_CONTENT_INDEXER_LAMBDA: Joi.string().required(),
        Elastic_host: Joi.string().required(),
        aws_key: Joi.string().required(),
        aws_secret: Joi.string().required(),
        elastic_prod:Joi.string().required(),
        public_url:Joi.string().required()


})

if(Joi.validate(process.env, envVarsSchema)!=null){

}  
var envVars = process.env;

const config = {
    env: envVars.NODE_ENV,
    port: envVars.PORT,
    mongooseDebug: envVars.MONGOOSE_DEBUG,
    mongoURL:    envVars.MONGO_LINK,
    mongoCert:   envVars.MONGO_CERT,
    mongoUseSSL: envVars.MONGO_USE_SSL,
    DB_HOST:     envVars.DB_HOST,
    DB_SECRET:   envVars.DB_SECRET,
    mandrillApiKey:envVars.mandrillApiKey,
    templateSlug:envVars.templateSlug,
    region1:envVars.region1,
    accessKeyId1:envVars.accessKeyId1,
    secretAccessKey1:envVars.secretAccessKey1,
    accessKeyId:envVars.accessKeyId,
    secretAccessKey:envVars.secretAccessKey,
    Bucket:envVars.Bucket,
    s3_cardImage_folder:envVars.s3_cardImage_folder,
    s3_attachment_folder:envVars.s3_attachment_folder,
    FILE_CONTENT_INDEXER_LAMBDA:envVars.FILE_CONTENT_INDEXER_LAMBDA,    
    Elastic_host: envVars.Elastic_host,
    aws_key:envVars.aws_key,
    aws_secret:envVars.aws_secret,
    elastic_prod:envVars.elastic_prod,
    file:envVars.file,
    public_url:envVars.public_url,
    absorb_username:envVars.absorb_username,
    absorb_password:envVars.absorb_password,
    absorb_private_key:envVars.absorb_private_key,
    absorb_department_id:envVars.absorb_department_id,
    auth0_signup_url:envVars.auth0_signup_url,
    auth0_client_id:envVars.auth0_client_id,
    auth0_connection:envVars.auth0_connection,
    auth0_client_secret:envVars.auth0_client_secret,
    auth0_get_token_url:envVars.auth0_get_token_url,
    auth0_management_api:envVars.auth0_management_api

}




module.exports = {
	'secret':config.DB_SECRET,
	'database':config.DB_HOST,
	mandrillApiKey: config.mandrillApiKey,
   	templateSlug: config.templateSlug,
   	aws: {
   		region : config.region1,
		  accessKeyId : config.accessKeyId1,
		  secretAccessKey : config.secretAccessKey1},
	s3_aws:{
		accessKeyId: config.accessKeyId,
		secretAccessKey: config.secretAccessKey,
		Bucket:config.Bucket
	},
	s3_cardImage_folder: config.s3_attachment_folder,
	s3_attachment_folder: config.s3_attachment_folder,
    FILE_CONTENT_INDEXER_LAMBDA:config.FILE_CONTENT_INDEXER_LAMBDA,
    host:{
        host:config.Elastic_host
    },
    aws_lock:
    {
        key:config.aws_key,
        secret:config.aws_secret
    },
    elastic_prod:config.elastic_prod,
    file:config.file,
    public_url:config.public_url,
    absorb:{
        username : config.absorb_username,
        password : config.absorb_password,
        private_key : config.absorb_private_key,
        department_id : config.absorb_department_id

    },
    auth0:
    {
        signup_url:config.auth0_signup_url,
        client_id:config.auth0_client_id,
        connection:config.auth0_connection,
        client_secret:config.auth0_client_secret,
        get_token_url:config.auth0_get_token_url,
        management_api:config.auth0_management_api
    }
}
