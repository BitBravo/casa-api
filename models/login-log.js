var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose').Promise = global.Promise

// create a schema
var loginLogSchema = new Schema({
  name:{ type: String},
  email: {type: String},
  date:{ type : Date},
  IP: {type:String},
  role: {type: String}
},{
  timestamps: true
 });

var LoginLog = mongoose.model('LoginLog', loginLogSchema);

module.exports = LoginLog;