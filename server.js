const express = require('express');
const app = express();
const path = require('path');
const mysql = require('mysql2');

// Подключение к базе данных
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Gagarin1',
  database: 'horse_racing'
});

db.connect((err) => {
  if (err) {
    console.error('Ошибка подключения к базе:', err);
    return;
  }
  console.log('MySQL Connected');
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API для регистрации пользователя
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;

  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Ошибка сервера при проверке' });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким именем уже существует' });
    }

    db.query('INSERT INTO users (username, password) VALUES (?, ?)', [username, password], (err) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при создании пользователя' });
      }

      res.json({ message: 'Регистрация прошла успешно', redirect: '/login.html' });
    });
  });
});

// API для авторизации
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;

  db.query(
    'SELECT * FROM users WHERE username = ? AND password = ?',
    [username, password],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: 'Серверная ошибка' });
        return;
      }

      if (results.length === 0) {
        res.status(401).json({ error: 'Неверный логин или пароль' });
      } else {
        const user = results[0];
        if (user.username === 'admin' && user.password === 'admin') {
          res.json({ redirect: '/admin.html' });
        } else {
          res.json({ redirect: '/bets.html' });
        }
      }
    }
  );
});

// API для получения списка лошадей
app.get('/api/horses', (req, res) => {
  db.query('SELECT * FROM horses', (err, result) => {
    if (err) {
      res.status(500).send('Ошибка при получении лошадей');
      return;
    }
    res.json(result);
  });
});

// API для добавления лошади
app.post('/api/add-horse', (req, res) => {
  const { name, race_id } = req.body;

  db.query(
    'INSERT INTO horses (name, race_id) VALUES (?, ?)', 
    [name, race_id], 
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Ошибка при добавлении лошади' });
      }
      res.json({ message: 'Лошадь успешно добавлена' });
    }
  );
});

// API для размещения ставки
app.post('/api/place-bet', (req, res) => {
  const { horse_id, amount } = req.body;
  const user_id = 1; // временно (позже можно заменить на реального пользователя)

  db.query(
    'INSERT INTO bets (user_id, horse_id, amount) VALUES (?, ?, ?)',
    [user_id, horse_id, amount],
    (err) => {
      if (err) {
        res.status(500).send('Ошибка при размещении ставки');
        return;
      }
      res.json({ message: 'Ставка успешно размещена!' });
    }
  );
});

// API для получения списка ставок
app.get('/api/bets', (req, res) => {
  db.query(
    `SELECT bets.*, horses.name AS horse_name 
     FROM bets 
     JOIN horses ON bets.horse_id = horses.id 
     ORDER BY bets.created_at DESC`,
    (err, result) => {
      if (err) {
        res.status(500).send('Ошибка при получении ставок');
        return;
      }
      res.json(result);
    }
  );
});

// Запуск сервера
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
