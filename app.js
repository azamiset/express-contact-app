const express = require('express');
const layouts = require('express-ejs-layouts');
const { loadContact, findContact, addContact, cekDuplikat, deleteContact, updateContact } = require('./utils/contact');
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

// Home Page
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

// About Page
app.get('/about', (req, res) => {
  res.render('pages/about', {
    layout: 'layouts/main',
    title: 'About',
  });
})

// Contact Page
app.get('/contact', (req, res) => {
  const contacts = loadContact();
  res.render('pages/contacts', {
    layout: 'layouts/main',
    title: 'Contact',
    contacts,
    msg: req.flash('msg'),
  });
})

// halaman form tambah data contact
app.get('/add-contact', (req, res) => {
  res.render('contact/add', {
    layout: 'layouts/main',
    title: 'Add New Contact'
  })
})

// proses tambah data contact
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

// halaman form ubah data contact
app.get('/edit-contact/:nama', (req, res) => {
  const contact = findContact(req.params.nama)
  res.render('contact/edit', {
    layout: 'layouts/main',
    title: 'Edit This Contact',
    contact,
  })
})

// proses ubah data
app.post('/update-contact',
  [
    body('nama').custom((value, { req }) => {
      const duplikat = cekDuplikat(value);
      if (value !== req.body.oldNama && duplikat) {
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
      res.render('contact/edit', {
        layout: 'layouts/main',
        title: 'Edit This Contact',
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      updateContact(req.body);
      // kirimkan flash message
      req.flash('msg', 'Data contact berhasil diubah!');
      res.redirect('/contact');
    }
  }
);

// proses  delete contact
app.get('/delete-contact/:nama', (req, res) => {
  const contact = findContact(req.params.nama);
  // jika contact tidak ada
  if (!contact) {
    res.status(400);
    res.send('<h1>404</h1>');
  } else {
    deleteContact(req.params.nama);
    req.flash('msg', 'Data contact berhasil dihapus!');
    res.redirect('/contact');
  }
})

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