const express = require('express');
const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
const Blogs = require('./models/Blogs');
const { render } = require('ejs');
require('dotenv').config();

// Connetion to the database
const dbURI = process.env.DB_URI;
mongoose.connect(dbURI)
  .then(result => {
      console.log('Database connected!');
      // Listen on port number
      app.listen(4000);
  })
  .catch(err => console.log(err.message));

// register view engine
app.set('view engine', 'ejs');

// middleware & static file
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(morgan('dev'));


// Home Page
app.get('/', (req, res) => { 
    res.redirect('/blogs');
});

// About us page
app.get('/about', (req, res) =>  {
    res.render('about', { title: 'About'});
});

// Blog routes
app.get('/blogs', (req, res) => {
  Blogs.find().sort({createdAt: -1})
    .then(result => {
      res.render('index', {title: "All blogs", blogs: result})
    })
    .catch(err => console.log(err.message));
})
app.post('/blogs', (req, res) => {
  const blog = new Blogs(req.body);
  blog.save()
    .then(result => res.redirect('/blogs'))
    .catch(err => console.log(err.message));
})

app.get('/blogs/:id', (req, res) => {
  const id = req.params.id;
  Blogs.findById(id)
    .then(result => {
      res.render('detail', {blog: result, title: "Blog details"})
    })
    .catch(err => console.log(err.message));
});

app.delete('/blogs/:id', (req, res) => {
  const id = req.params.id;
  Blogs.findByIdAndDelete(id).then(result => {
    res.json({
      redirect: '/blogs'
    });
  })
  .catch(err => console.log(err));
})

app.get('/create', (req, res) => {
  res.render('create', { title: 'Create a new blog' });
});

// 404 page
app.use((req, res) => {
    res.status(404).render('404', { title: 'Error Page'});
})