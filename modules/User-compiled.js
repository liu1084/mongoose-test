/**
 * Created by liqing on 2016/4/27.
 */
const mongoose = require('mongoose');
const crypto = require('crypto');
const oAuthTypes = ['google', 'github', 'twitter', 'facebook', 'linkedin'];

const Schema = mongoose.Schema;
const validatePresenceOf = value => value && value.length > 0;
const nameValidator = [{
    //name can not be empty
    validator: function (name) {
        return name.length > 0;
    },
    msg: 'Name can not be empty'
}, {
    //name must be [a-z]+[0-9]*[_|-]
    validator: function (name) {
        var reg = new RegExp('^[a-z]+[0-9]*[_|-]*$', 'ig');
        return reg.test(name);
    },
    msg: 'name must be include a-z, 0-9, _ and -'
}];
const emailValidator = [{
    validator: function (email) {
        return email.length > 0;
    }, msg: 'email can not be empty'
}, {
    validator: function (email) {
        return (/\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*/.test(email)
        );
    }, msg: 'email must be xxx@xxx.xxx'
}];

/**
 * Usr Schema
 */
const UserSchema = new Schema({
    name: { type: String, default: '', trim: true, validate: nameValidator },
    email: { type: String, default: '', trim: true, validate: emailValidator },
    age: { type: Number, default: 0, min: [18, 'too little'], max: [100, 'maybe you are a GOD...'] },
    salt: { type: String, default: '' },
    hash_password: { type: String, default: '' },
    provider: { type: String, default: '', trim: true, enum: ['google', 'twitter', 'linkedin', 'facebook', 'github'] }
});

UserSchema.virtual('password').set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hash_password = this.encryptPassword(password);
}).get(function () {
    return this._password;
});

UserSchema.methods = {
    /**
     * encrypt password
     * @param password
     */
    encryptPassword: function (password) {
        if (!password) {
            return '';
        }

        try {
            return crypto.createHmac('sha1', this.salt).update(password).digest('hex');
        } catch (error) {
            return '';
        }
    },
    makeSalt: function () {
        return Math.round(new Date().valueOf() * Math.random()) + '';
    },

    /**
     * Authenticate -- Check password is the same.
     * @param plainText
     * @returns {boolean}
     */
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hash_password;
    },

    skipValidation: function () {
        return ~oAuthTypes.indexOf(this.provider);
    }
};

/**
 * Check user is existed.
 */
var User = mongoose.model('User', UserSchema);
UserSchema.path('name').validate(function (value, response) {
    var result = false;
    User.findOne({ name: value }, function (error, data) {
        if (error) {
            throw new Error(error);
        }
        if (data.length === 0) {
            result = true;
        }
        response(result);
    });
}, 'name is already existed.');

/**
 * Check email is existed.
 */
UserSchema.path('email').validate(function (value, response) {
    var result = false;
    User.find({ email: value }, function (error, data) {
        if (error) {
            throw new Error(error);
        }
        if (data.length === 0) {
            result = true;
        }
        response(result);
    });
}, 'email is already existed.');

/**
 * Check password is valid
 */
UserSchema.path('hash_password').validate(function (value, response) {
    if (this.skipValidation()) return true;
    return this._password.length && value.length;
}, 'password can not be empty');

/**
 * Pre-save hook
 */
UserSchema.pre('save', function (next) {
    if (!this.isNew) {
        next();
    }

    if (!validatePresenceOf() && !this.skipValidation()) {
        next(new Error('invalid password'));
    } else {
        next();
    }
});

UserSchema.statics = {
    load: function (options, callback) {
        options.select = options.select || 'name email';
        return this.findOne(options.criteria).select(options.select).exec(callback);
    }
};

module.exports = User;

//# sourceMappingURL=User-compiled.js.map