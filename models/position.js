// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose').Promise = global.Promise

// create a schema
var positionSchema = new Schema({
  position: { type: String },
  resource_id: { type: String }
}, {
    timestamps: true
  });

var Position = mongoose.model('Position', positionSchema);

module.exports = Position;