// grab the things we need
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
require('mongoose').Promise = global.Promise

bcrypt = require('bcrypt'),
SALT_WORK_FACTOR = 10;

// create a schema
var userSchema = new Schema({
  first_name: { type: String ,required: true},
  last_name:{ type: String ,required: true},
  email: {type: String, required:  [true, 'Email is required'], unique:[true, 'Email is required'] },
  password: { type: String, required: true },
  phone:{type:String , default : null},
  role : {type : String},
  customer_role : {type : String},
  last_login:{ type : Date},
  reset_password_token:{type : String},
  reset_password_expires:{type:Date},
  saml_cert: {type: String, default: null},
  auth_id: {type: String, default:null}
},{
  timestamps: true
 });

userSchema.methods.isValidPassword = async function(password){
  const user = this;
  const compare = await bcrypt.compare(password, user.password);
  return compare;
}

userSchema.pre('save', function(next) {
    var user = this;

    // only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);

        // hash the password using our new salt
        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.cleartextPassword = user.password;
            user.password = hash;
            next();
        });
    });
});

userSchema.pre('findOneAndUpdate', function(next) {
    var user = this;
    if (!user.getUpdate().password) return next();
    // generate a salt
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        if (err) return next(err);
        // hash the password using our new salt
        bcrypt.hash(user.getUpdate().password, salt, function(err, hash) {
            if (err) return next(err);

            // override the cleartext password with the hashed one
            user.getUpdate().password = hash;
            next();
        });
    });
  
});


var Users = mongoose.model('Users', userSchema);
module.exports = Users;