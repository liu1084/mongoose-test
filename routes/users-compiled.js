var express = require('express');
var mongoose = require('mongoose');

var db = mongoose.connect('mongodb://localhost/user').connection;
db.on('error', function (err) {
    console.log(err);
}).on('open', function () {
    console.log('opened');
});
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

var Schema = mongoose.Schema;
var UserSchema = new Schema({
    name: { type: 'String', default: '' },
    email: { type: 'String', default: '' }
});

UserSchema.pre('save', function (next) {
    next();
});

UserSchema.methods = {
    speak: function (words) {
        console.log(words);
    }
};

var User = mongoose.model('User', UserSchema);

router.post('/', function (req, res, next) {
    var person = new User({ name: 'liujun', email: 'liu1084@163.com' });
    person.speak(req);
    person.save(function (error) {
        if (error) throw new Error(error);
        User.findOne({ name: 'liujun' }, function (err, data) {
            console.log(data);
            res.send(data);
        });
    });
});

module.exports = router;

//# sourceMappingURL=users-compiled.js.map