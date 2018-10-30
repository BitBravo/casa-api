// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose').Promise = global.Promise

// create a schema
var featuredSchema = new Schema({
  id:{ type: String},
  cardImage: {type: String}
},{
  timestamps: true
 });

var Featured = mongoose.model('Featured', featuredSchema);

module.exports = Featured ;