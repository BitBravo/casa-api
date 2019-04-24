var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose').Promise = global.Promise

// create a schema
var topicSchema = new Schema({
  name:{ type: String},
  category: {type: String},
  admin_email: {type: String}
},{
  timestamps: true
 });

var Topic = mongoose.model('Topic', topicSchema);

module.exports = Topic;