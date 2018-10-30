var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose').Promise = global.Promise

// create a schema
var RedirectSchema = new Schema({
  url:{ type: String},
  redirect_url: {type: String},
  hits: {type:Number, default:0 }
},{
  timestamps: true
 });

var Redirect = mongoose.model('Redirect', RedirectSchema);

module.exports = Redirect;