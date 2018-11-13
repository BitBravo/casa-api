// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose').Promise = global.Promise

// create a schema
var userHistorySchema = new Schema({
  user: { type: String },
  project: { type: String },
  eventType: { type: String, required: true },
  event: { type: String, required: true },
  content: { type: String, required: true },
  action: { type: String, default: '' },
  metadata: { type: Object },
  ip: { type: String },
  userAgent: { type: String },
  callback: { type: String }
}, {
    timestamps: true
  });

var UserHistory = mongoose.model('UserHistory', userHistorySchema);

module.exports = UserHistory;