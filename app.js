require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const path = require('path');

const app = express();


const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('Connected to MySQL');
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  db.query('SELECT * FROM students ORDER BY id DESC', (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Database error');
    }
    res.render('index', {
      students: results
    });
  });
});

app.get('/students/add', (req, res) => {
  res.render('add');
});

app.post('/students/add', (req, res) => {
  const {
    student_id,
    first_name,
    last_name,
    course,
    year_level,
    email
  } = req.body;

  const sql = `
    INSERT INTO students 
    (student_id, first_name, last_name, course, year_level, email)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const values = [
    student_id,
    first_name,
    last_name,
    course,
    year_level,
    email
  ];

  db.query(sql, values, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Unable to save student');
    }
    res.redirect('/');
  });
});

app.get('/students/search', (req, res) => {
  const keyword = req.query.keyword || '';

  const sql = `
    SELECT * FROM students
    WHERE student_id LIKE ?
    OR first_name LIKE ?
    OR last_name LIKE ?
    OR course LIKE ?
  `;

  const searchValue = `%${keyword}%`;

  db.query(
    sql,
    [
      searchValue,
      searchValue,
      searchValue,
      searchValue
    ],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Search error');
      }

      res.render('index', {
        students: results
      });
    }
  );
});

app.listen(5000, () => {
  console.log('Server running at http://localhost:5000');
});

app.post('/students/add', (req, res) => {
    const {
      student_id,
      first_name,
      last_name,
      course,
      year_level,
      email
    } = req.body;
  
    const sql = `
      INSERT INTO students
      (student_id, first_name, last_name, course, year_level, email)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
  
    const values = [
      student_id,
      first_name,
      last_name,
      course,
      year_level,
      email
    ];
  
    db.query(sql, values, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Unable to save student');
      }
      res.redirect('/');
    });
  });

app.post('/students/delete/:id', (req, res) => {
  const studentId = req.params.id;
  const sql = 'DELETE FROM students WHERE id = ?';

  db.query(sql, [studentId], (err, result) => {
    if (err) {
      console.error('Error deleting student:', err);
      return res.status(500).send('Database error');
    }
    res.redirect('/');
  });
});

// Render Edit Form
app.get('/students/edit/:id', (req, res) => {
  const studentId = req.params.id;
  const sql = 'SELECT * FROM students WHERE id = ?';
  
  db.query(sql, [studentId], (err, results) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Database error');
      }
      if (results.length === 0) {
          return res.status(404).send('Student not found');
      }
      res.render('edit', { student: results[0] });
  });
});


app.post('/students/edit/:id', (req, res) => {
  const studentId = req.params.id;
  const { student_id, first_name, last_name, course, year_level, email } = req.body;
  
  const sql = `
      UPDATE students 
      SET student_id = ?, first_name = ?, last_name = ?, course = ?, year_level = ?, email = ? 
      WHERE id = ?
  `;
  
  db.query(sql, [student_id, first_name, last_name, course, year_level, email, studentId], (err, result) => {
      if (err) {
          console.error(err);
          return res.status(500).send('Database error');
      }
      res.redirect('/');
  });
});

