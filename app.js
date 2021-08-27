const express = require('express');
const layouts = require('express-ejs-layouts');
const app = express();
const port = 3000;

app.set('view engine', 'ejs'); // Template Engine
app.use(layouts); // Main Layout
app.use(express.static('public')); // Middleware

app.get('/', (req, res) => {
  const mahasiswa = [
    { nama: 'Andi', email: 'andi@gmail.com' },
    { nama: 'Haris', email: 'haris@gmail.com' },
    { nama: 'Testi', email: 'testi@gmail.com' },
    { nama: 'Wanda', email: 'wanda@gmail.com' },
  ];

  res.render('pages/index', {
    layout: 'layouts/main',
    title: 'Home',
    nama: 'Wandy Azami',
    mahasiswa
  });
})

app.get('/about', (req, res) => {
  res.render('pages/about', {
    layout: 'layouts/main',
    title: 'About',
  });
})

app.get('/contact', (req, res) => {
  res.render('pages/contact', {
    layout: 'layouts/main',
    title: 'Contact',
  });
})

app.get('/product/:id?', (req, res) => {
  res.send(`Product ID : ${req.params.id} <br> Category : ${req.query.category}`)
})

app.use('/', (req, res) => {
  res.status(404);
  res.send('<h1>404</h1>');
})

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})