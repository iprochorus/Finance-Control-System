
var express        = require('express');
var path           = require('path');
var config         = require('config');
var db             = require('db');
var session        = require('cookie-session');

/*---------- ROUTING ----------*/

var app = express();

app.use(session({keys: ['key1']}));

app.use(express.static(__dirname + '/public'));
app.set('view engine', 'jade');

//db.createUser('prochorus','pass');
/*db.findUser('prochorus', function(err, user){
    if(err) throw err;
    console.log(user.length);
});*//*
db.createWallet('Прохор', 'Банка под кроватью', 'cash');
db.createWallet('Прохор', 'В подушке', 'cash');*/
/*db.createOperation('5385ffd701f71ebc0a28dbe0', 300, 'За что-то там');
db.createOperation('5385ffd701f71ebc0a28dbe0', 235, 'Жека вернул');*/

app.get('/', function(req, res){
    var session = req.session;
    //Есть ли такая сессия, если пользователь есть в бд и пароль в сессии совпадает с паролем, то все ок, авторизируем его и отправляем на index
    //иначе тоже на index, только он остается неавторизированным.
    if(session.user) {
        db.findUser(session.user, function (err, user) {
            if(err) throw err;
            if(user.length && user[0].password == session.password){
                db.findWallet(session.user, function(err, wallets){
                    if(err)throw err;
                    var table='';

                    var i = 0;
                    wallets.forEach(function(wallet){
                        db.findOperations(wallet.id, function(err, operations){
                            if (err) throw err;
                            var sum = 0;
                            operations.forEach(function(operation){
                                sum+=operation.value;
                            });
                            table +=
                                '<tr>'+
                                    '<td><a href="wallet/'+wallet.id+'">'+wallet.name+'</a></td>'+
                                    '<td>'+wallet.type+'</td>'+
                                    '<td>'+sum+'</td>'+
                                '</tr>';
                            checkReady(++i);
                        });

                    });
                    if(wallets.length==0) renderPage();
                    function checkReady(i)
                    {
                        if(i==wallets.length) renderPage();
                    }
                    function renderPage()
                    {
                        res.render('dashboard', {
                            username: session.user,
                            walletsLength: wallets.length,
                            wallets: table
                        });
                        res.end();
                    }

                });
            }
            else{
                session = null;
                res.render('index');
                res.end();
            }
        });
    }
    else{
        res.render('index');
        res.end();
    }
});

app.post('/login', function(req, res){
    var session = req.session;

    req.on('data', function(data){
        data = data.toString().split('&');
        var login = decodeURIComponent(data[0].split('=')[1]).replace(/[\+]+/g,' ');
        var password = decodeURIComponent(data[1].split('=')[1]).replace(/[\+]+/g,' ');

        db.findUser(login, function(err, user){
            if(err) throw err;
            if(user.length){
                if(user[0].password == password) {
                    session.user = login;
                    session.password = password;
                    res.redirect('/');
                }else
                {
                    res.redirect('/');
                }
            }
            else{
                db.createUser(login,password, function(){
                    session.user = login;
                    session.password = password;
                    res.redirect('/');
                });
            }

        });
    });

});

app.get('/wallet/:id', function(req, res){
    var session = req.session;
    //Есть ли такая сессия, если пользователь есть в бд и пароль в сессии совпадает с паролем, то все ок, авторизируем его и отправляем на index
    //иначе тоже на index, только он остается неавторизированным.
    session.walletId = req.params.id;
    if(session.user) {
        db.findUser(session.user, function (err, user) {
            if(err) throw err;
            if(user.length && user[0].password == session.password){
                db.findOperations(req.params.id, function(err, operations){
                    if(err)throw err;
                    var table='';
                    operations.forEach(function(operation){
                        var date = operation.lastChange;

                        var day     = date.getDate();
                        var month   = date.getMonth()+1;
                        var year    = date.getFullYear();
                        var hours   = date.getHours();
                        var minutes = date.getMinutes();

                        date = (day  <10?'0':'') + day.toString()   + '.' +
                               (month<10?'0':'') + month.toString() + '.' +
                               (year.toString()) + ' ' +
                               (hours<10?'0':'') + hours.toString() + ':' +
                               (minutes<10?'0':'') + minutes.toString();
                        var income = operation.value > 0;
                        table +=
                            '<tr class="'+(income?'income':'outcome')+'">'+
                                '<td>'+operation.comment+'</td>'+
                                '<td>'+operation.value+'</td>'+
                                '<td>'+date+'</td>'+
                            '</tr>';
                    });

                    db.findWallet(session.user, function(err, wallets){
                        if(err)throw err;
                        res.render('wallet', {
                            username: session.user,
                            walletsLength: wallets.length,
                            operations: table
                        });
                        res.end();
                    });

                });
            }
            else{
                session = null;
                res.render('index');
                res.end();
            }
        });
    }
    else{
        res.render('index');
        res.end();
    }
});

app.post('/addWallet', function(req, res){
    var session = req.session;

    req.on('data', function(data){
        data = data.toString().split('&');
        var walletName = decodeURIComponent(data[0].split('=')[1]).replace(/[\+]+/g,' ');
        var walletType = decodeURIComponent(data[1].split('=')[1]);
        db.createWallet(req.session.user, walletName, walletType, function (err){
            if (err) throw err;
            res.redirect('/');
        });
    });
});

app.post('/wallet/addIncome', function(req, res){
    var session = req.session;

    req.on('data', function(data){
        data = data.toString().split('&');
        var operationValue = decodeURIComponent(data[0].split('=')[1]);
        var operationComment = decodeURIComponent(data[1].split('=')[1]).replace(/[\+]+/g,' ');
        db.createOperation(session.walletId, operationValue, operationComment, function(err){
            if (err)throw err;
            res.redirect('/wallet/'+session.walletId);
        });
    });
});

app.post('/wallet/addOutcome', function(req, res){
    var session = req.session;

    req.on('data', function(data){
        data = data.toString().split('&');
        var operationValue = '-'+decodeURIComponent(data[0].split('=')[1]);
        var operationComment = decodeURIComponent(data[1].split('=')[1]).replace(/[\+]+/g,' ');
        db.createOperation(session.walletId, operationValue, operationComment, function(err){
            if (err)throw err;
            res.redirect('/wallet/'+session.walletId);
        });
    });
});

app.post('/wallet/logout', function(req, res){
    req.session = null;
    res.redirect('/');
});

app.post('/logout', function(req, res){
    req.session = null;
    res.redirect('/');
});

app.listen(config.get('port'));

/*----------  ----------*/