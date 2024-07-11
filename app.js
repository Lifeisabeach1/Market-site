const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const Selling = require('./sellmodel/selling');
const fs = require('fs');

const app = express();

const dbURI = 'mongodb+srv://database:test1234@cluster0.1zjcr4u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
mongoose.connect(dbURI)
  .then((result) => app.listen('3000'))
  .catch((err) => console.log(err));

app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));


const storage = multer.diskStorage({
  destination: (req, file, pics) => {
    pics(null, 'public/uploads'); // Directory to store uploaded files
  },
  filename: (req, file, pics) => {
    pics(null, Date.now() + path.extname(file.originalname)); // Appending extension
  }
});

const upload = multer({ storage: storage });

app.use((req, res, next) => {
  res.locals.path = req.path;
  next();
});

app.get('/', (req, res) => {
  res.redirect('/items');
});



app.get('/create', (req, res) => {
  res.render('create', { title: 'Create a new sale' });
});

app.get('/items', (req, res) => {
  Selling.find().sort({ createdAt: -1 })
    .then(result => {
      res.render('index', { items: result, title: 'All items' });
    })
    .catch(err => {
      console.log(err);
    });
});


app.post('/items', upload.single('image'), (req, res) => {
  const sale = new Selling({
    ...req.body,
    imagePath: req.file ? `/uploads/${req.file.filename}` : null
  });


  sale.save()
    .then(result => {
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
    });
});

app.get('/items/:id', (req, res) => {
  const id = req.params.id;
  Selling.findById(id)
    .then(result => {
      res.render('details', { item: result, title: 'Selling Details' });
    })
    .catch(err => {
      console.log(err);
    });
});

app.delete('/items/:id', (req, res) => {
  const id = req.params.id;
  
  Selling.findByIdAndDelete(id)
    .then(result => {
      res.json({ redirect: '/items' });
    })
    .catch(err => {
      console.log(err);
    });
});

app.delete('/delete/:filename', (req, res) => {
  const filePath = path.join(__dirname, 'public/uploads', req.params.filename);

  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      // File does not exist
      return res.status(404).send('File not found');
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        // Error deleting file
        return res.status(500).send('Error deleting file');
      }

      res.send('File deleted successfully');
    });
  });
});


app.use((req, res) => {
  res.status(404).render('404', { title: '404' });
});
