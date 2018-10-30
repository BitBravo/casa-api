var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose').Promise = global.Promise

// create a schema
var token_schema = new Schema({
  token:{ type: String},
  generation_date: {type: Date}
},{
  timestamps: true
 });

var Token = mongoose.model('Token', token_schema);

module.exports = Token;