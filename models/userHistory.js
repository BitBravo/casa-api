// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose').Promise = global.Promise

// create a schema
var userHistorySchema = new Schema({
  clientId: {type: String, required: true},
  eventType: {type: String, required: true},
  event: {type: String},
  content: {type: String, required: true},
  ip: {type: String}
},{
  timestamps: true
 });

var UserHistory = mongoose.model('UserHistory', userHistorySchema);

module.exports = UserHistory ;