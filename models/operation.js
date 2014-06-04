var mongoose = require('lib/mongoose'),
    Schema = mongoose.Schema;

var schema = new Schema({
    walletId: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    comment: {
        type: String,
        default: ''
    },
    lastChange: {
        type: Date,
        default: Date.now
    }
});

exports.Operation = mongoose.model('Operation', schema);