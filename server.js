const express = require('express');
const bodyPaser = require('body-parser');
const path = require('path');
const mysql = require('mysql');
const flash = require('express-flash');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const ejs = require('ejs');
const app = express();

var connection = mysql.createConnection({
  host     : '10.10.9.171',
  user     : 'Dion',
  password : 'Capping1!',
  database : 'cappingTest'
});
 
connection.connect((err) => {
    if (err) {
        console.log('error connecting to mysql db')
    } else {
        console.log('successfully connected to db')
    }
});

app.set('view engine', 'ejs');
app.use(cookieParser('secret'));
app.use(session({
    cookie: {maxAge: 500000},
    saveUninitialized: true,
    resave: 'true',
    secret: 'secret'    
}));
app.use(flash());
app.use(bodyPaser.urlencoded({extended: true}));
app.use(express.static(path.resolve(__dirname + '/frontend')))

// Custom flash middleware -- from Ethan Brown's book, 'Web Development with Node & Express'
app.use(function(req, res, next){
    // if there's a flash message in the session request, make it available in the response, then delete it
    res.locals.sessionFlash = req.session.sessionFlash;
    delete req.session.sessionFlash;
    next();
});

// Route that creates a flash message using the express-flash module
app.all('/express-flash', function( req, res ) {
    req.flash('success', 'This is a flash message using the express-flash module.');
    res.redirect(301, '/');
});

// Route that creates a flash message using custom middleware
app.all('/session-flash', function( req, res ) {
    req.session.sessionFlash = {
        type: 'success',
        message: 'This is a flash message using custom middleware and express-session.'
    }
    res.redirect(301, '/');
});

app.get('/', (req, res) => {
    res.render('index', { expressFlash: req.flash('error'), sessionFlash: res.locals.sessionFlash });
});

app.get('/loggedin', (req, res) => {
    res.send('logged in now');
});

app.post('/create-user', (req, res) => {
    connection.query(`SELECT * FROM Users`, (error, results, fields) => {
        const user = results.find(user => user.Email === req.body.email && user.password === req.body.password);
        const admin = results.find(admin => admin.Email === req.body.email && admin.password === req.body.password && admin.isAdmin == 1);
	if(admin){
            req.flash('success', 'Successfully logged in');
            res.sendFile(path.resolve(__dirname + '/frontend/admin-homepage.html'));
	 } else if (user) {
           req.flash('success', 'Successfully logged in');
           res.sendFile(path.resolve(__dirname + '/frontend/profilepage.html'));
        } else {
            req.flash('error', 'invalid username and password');
            res.redirect('/');
        }
    });
});



app.listen(3000, () => console.log('App started on 3000'));
