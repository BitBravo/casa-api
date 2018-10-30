// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose').Promise = global.Promise

// create a schema
var roleSchema = new Schema({
  name:{ type: String},
  admin_email: {type: String}
},{
  timestamps: true
 });

var Role = mongoose.model('Role', roleSchema);

module.exports = Role;