var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose').Promise = global.Promise

// create a schema
var typeSchema = new Schema({
  name:{ type: String},
  admin_email: {type: String},
  default_image:{type: String}
},{
  timestamps: true
 });

var Type = mongoose.model('Type', typeSchema);

module.exports = Type;