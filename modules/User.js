/**
 * Created by liqing on 2016/4/27.
 */
const mongoose = require('mongoose');
const crypto = require('crypto');
const providers = [
    'google',
    'github',
    'twitter',
    'facebook',
    'linkedin'
];

const Schema = mongoose.Schema;
/**
 * Usr Schema
 */
const UserSchema = new Schema({
    name: {type: String, default: '', trime: true},
    email: {type: String, default: '', trime: true},
    age: {type: Number, default: 0, trim: true},
    salt: {type: String, default: ''},
    hash_password: {type: String, default: '', trim: true},
    provider: {type: String, default: '', trim: true}
});

UserSchema
    .virtual('password')
    .set(function(password){
        this._password = password;
        this.salt = this.makeSalt();
        this.hash_password = this.encryptPassword(password);
    })
    .get(function(){
        return this._password;
    });

UserSchema.methods = {
    /**
     * encrypt password
     * @param password
     */
    encryptPassword: function (password) {
        if (!password){
            return '';
        }

        try{
            return crypto
                .createHmac('sha1', this.salt)
                .update(password)
                .digest('hex');
        }catch(error){
            return '';
        }
    },
    makeSalt: function () {
        return Math.round((new Date().valueOf() * Math.random())) + '';
    },

    /**
     * Authenticate -- Check password is the same.
     * @param plainText
     * @returns {boolean}
     */
    authenticate: function (plainText) {
        return this.encryptPassword(plainText) === this.hash_password;
    }
};

module.exports = UserSchema;