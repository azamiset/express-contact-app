const express = require('express');
const layouts = require('express-ejs-layouts');
const { loadContact, findContact, addContact, cekDuplikat } = require('./utils/contact');
const { body, validationResult, check } = require('express-validator');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');

const app = express();
const port = 3000;

app.set('view engine', 'ejs'); // Template Engine
app.use(layouts); // Main Layout
app.use(express.static('public')); // Built-in Middleware
app.use(express.urlencoded({ extended: true })); // Built-in Middleware

// konfigurasi flash
app.use(cookieParser('secret'));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());

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
  const contacts = loadContact();
  res.render('pages/contacts', {
    layout: 'layouts/main',
    title: 'Contact',
    contacts,
    msg: req.flash('msg'),
  });
})

app.get('/add-contact', (req, res) => {
  res.render('contact/add', {
    layout: 'layouts/main',
    title: 'Add New Contact'
  })
})

// proses data contact
app.post('/contact',
  [
    body('nama').custom((value) => {
      const duplikat = cekDuplikat(value);
      if (duplikat) {
        throw new Error('Nama contact sudah digunakan!');
      }
      return true;
    }),
    check('email', 'Email tidak valid!').isEmail(),
    check('nohp', 'No HP tidak valid!').isMobilePhone()
  ], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // return res.status(400).json({ errors: errors.array() });
      res.render('contact/add', {
        layout: 'layouts/main',
        title: 'Add New Contact',
        errors: errors.array(),
      });
    } else {
      addContact(req.body);
      // flash message
      req.flash('msg', 'Data contact berhasil ditambahkan!');
      res.redirect('/contact');
    }
  }
);

// halaman detail contact
app.get('/contact/:nama', (req, res) => {
  let contact = findContact(req.params.nama);
  res.render('contact/detail', {
    layout: 'layouts/main',
    title: 'Detail Contact',
    contact,
  });
})

app.use('/', (req, res) => {
  res.status(404);
  res.send('<h1>404</h1>');
})

app.listen(port, () => {
  console.log(`Contact app berjalan di http://localhost:${port}`)
})