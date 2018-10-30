var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose').Promise = global.Promise

// create a schema
var audienceSchema = new Schema({
  name:{ type: String},
  admin_email: {type: String}
},{
  timestamps: true
 });

var Audience = mongoose.model('Audience', audienceSchema);

module.exports = Audience;