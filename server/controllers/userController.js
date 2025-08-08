const db = require('../db');
const User= require('./user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = (req, res) => {
  const { username, email, password, role } = req.body;
  console.log('Incoming register request:', req.body);

  if (!username || !email || !password || !role) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
      console.error('Password hash error:', err);
      return res.status(500).json({ error: 'Hashing failed' });
    }

    const sql = 'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)';
    db.query(sql, [username, email, hash, role], (err, result) => {
      if (err) {
        console.error('Database error:', err);
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(400).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: 'Database insert failed' });
      }
      res.status(201).json({ message: 'User registered successfully' });
    });
  });
};


exports.login = (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT id, role, username, is_active, password FROM users WHERE email = ?';
  
  console.log('Before SQL query execution');
db.query(sql, [email], (err, results) => {
  if (err) {
    console.log('SQL error:', err);
    return res.status(500).json({ error: 'Database query error' });
  }
  
  console.log('Query Results:', results);
  if (results.length === 0) {
    console.log('No user found');
    return res.status(404).json({ message: 'User not found' });
  }

  const user = results[0];
  console.log('User Data:', user);
    if (user.is_active) {
      return res.status(403).json({
        message: 'Your account has been deactivated. Please contact the admin.',
      });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) return res.status(500).json({ error: 'Password validation error' });
      if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

      const token = jwt.sign({ id: user.id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

      res.json({
        token,
        role: user.role,
        name: user.username,
        is_active: user.is_active,
      });
    });
  });
};



exports.getAllUsers = (req, res) => {
  const role = req.user.role;
  if (role !== 'manager') return res.status(403).json({ message: 'Access denied' });

  db.query('SELECT * FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
  });
};



 
exports.toggleUser = function (req,res){
  User.toggleUser(req.params.id,(err,result)=>{
    if (err) throw err;
    res.json({message:'toggled successfully'})
  });
};


exports.deleteUser = function (req,res){
  User.deleteUser(req.params.id,(err,result)=>{
    if (err) throw err;
    res.json({message:"user deleted successfully"})
  });
};

exports.userDetail = (req, res) => {
  User.userDetail(req.params.email, (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.json(results);
    console.log('hello',results)
  });
};

exports.updateUser = (req, res) => {
  const { id } = req.params;
  const { username, email, role } = req.body;

  if (!username || !email || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const sql = 'UPDATE users SET username = ?, email = ?, role = ? WHERE id = ?';

  db.query(sql, [username, email, role, id], (err, result) => {
    if (err) {
      console.error('Update user error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully' });
  });
};

exports.updateSingleUser = (req, res) => {
  const { id } = req.params;
  const { username, email} = req.body;

  if (!username || !email) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const sql = 'UPDATE users SET username = ?, email = ? WHERE id = ?';

  db.query(sql, [username, email, id], (err, result) => {
    if (err) {
      console.error('Update user error:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'User updated successfully' });
  });
};


