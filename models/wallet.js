var mongoose = require('lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    owner: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true // Also can be: 'cash', 'bank', 'electronic'
    },
    value: {
        type: Number,
        default: 0
    },
    lastChange: {
        type: Date,
        default: Date.now
    }
});

exports.Wallet = mongoose.model('Wallet', schema);