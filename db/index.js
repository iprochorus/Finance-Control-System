var User = require('models/user').User;
var Wallet = require('models/wallet').Wallet;
var Operation = require('models/operation').Operation;

/*-----------USER MANAGEMENT-----------*/
exports.createUser = function createUser(username, password, callback)
{
    var user = new User({
        username: username,
        password: password
    });

    user.save(function(err, user, affected){
        if(err) {
            if (typeof(callback) == "function") callback(err);
            else console.error(err);
        }
        else{
            console.log('User %s was successfully created', username);
            if (typeof(callback) == "function") callback();
        }
    });
};

exports.findUser = function findUser(username, callback)
{
    var user = User.find({username: username}, callback);
};

/*-----------WALLET MANAGEMENT-----------*/
exports.createWallet = function createWallet(owner, name, type, callback)
{
    var wallet = new Wallet({
        owner: owner,
        name: name,
        type: type
    });
    wallet.save(function(err, wallet, affected){
        if(err) {
            if (typeof(callback) == "function") callback(err);
            else console.error(err);
        }
        else{
            console.log('Wallet %s for user: %s was successfully created', name, owner);
            if (typeof(callback) == "function") callback();
        }
    });
};
exports.findWallet = function findWallet(owner, callback)
{
    Wallet.find({owner: owner}, callback);
};
/*-----------OPERATIONS MANAGEMENT-----------*/
exports.createOperation = function createOperation(walletId, value, comment, callback)
{
    var operation = new Operation({
        walletId: walletId,
        value: value,
        comment: comment
    });
    //добавить операцию в wallet
    operation.save(function(err, wallet, affected){
        if(err) {
            if (typeof(callback) == "function") callback(err);
            else console.error(err);
        }
        else{
            console.log('Operation %s for wallet: %s was successfully created', value, walletId);
            //Wallet.update({id:walletId}, {value:value+1}).exec(callback);
            if (typeof(callback) == "function") callback();
        }
    });
};
exports.findOperations = function findOperations(walletId, callback)
{
    var operations = Operation.find({walletId: walletId}, callback);
};