const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const bodyParser = require("body-parser");
const asyncHandler = require('express-async-handler');
const expressSession = require('express-session');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const productsRouter = require('./routes/products');
const cartRouter = require('./routes/cart');
const back_productsortRouter = require('./routes/backstage/productSort');
const back_productManageRouter = require('./routes/backstage/productManage');

const app = express();

// app.use(expressSession({
//     secret: "qiwuefsgjhgh1j23sa",
//     // cookie:{
//     //   maxAge: 3600000
//     // },
//     resave: false,
//     saveUninitialized: true,
//     httpOnly: true,
//     // secure: true,
//     name: 'session'
// }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/products', productsRouter);
app.use('/cart', cartRouter);
app.use('/back/productSort', back_productsortRouter);
app.use('/back/productManage', back_productManageRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

app.listen(4000);
console.log("Server running on port: 4000");
module.exports = app;