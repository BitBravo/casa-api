// grab the things we need
var slug = require('mongoose-slug-generator');
var mongoose = require('mongoose');
var options = {
        lang: "en",
        truncate: 120
    };
mongoose.plugin(slug);
var Schema = mongoose.Schema;
require('mongoose').Promise = global.Promise


// create a schema
var resourceSchema = new Schema({
  origin:{type: String},
  title: {type: String ,required:[true, 'Title is required']},
  type: {type: String},
  topics: [{
    type: String
  }],
  audience: [{
    type: String
  }],
  role: [{
    type: String
  }],
  url: {type: String},
  cardImage: {type: String},
  duration: {type: String},
  hasDetails:{type: Boolean},
  slug: { type: String, slug: ["title"], unique: true },
  html:{type: String},
  uploaded_files:[{
   name:String,
   url:String
  }],
  date:{ type : Date, default: Date.now },
  publish:{type: Boolean},
  creator:{type: String},
  admin_id:{
    type: mongoose.Schema.Types.ObjectId,   // here save admin_id
    ref : 'user',
  },
  isGated:{type: Boolean},
  last_mod:{ type : Date , default: Date.now},
  view_count :{type:Number},
  downloads:{type:Number},
  history:{type:[{ modified:Date , 
                  editor: String,
                }],select: false},
  revision:{type:Number, default:0 ,select: false},
  is_cta_button: {type: Boolean},
  cardColumn:{type:Boolean},
  cta: [{
    cta_display: {type: String},
    is_cta_url: {type: Boolean},
    cta_url: {type: String},
    cta_order: {type: Number},
    is_cta_button: {type: Boolean}
  }]

},{
  timestamps: true
  });


var Resource = mongoose.model('Resources', resourceSchema);

module.exports = Resource;
