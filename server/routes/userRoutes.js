const express = require('express');
const router = express.Router();
const { register, login, getAllUsers } = require('../controllers/userController');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/users', auth, getAllUsers); 
router.put('/user/:id/toggle',  userController.toggleUser);
router.delete('/user/:id', userController.deleteUser);
router.get('/user/:email',userController.userDetail);
router.put('/user/:id', auth, userController.updateUser);
router.put('/user/:id/single', auth, userController.updateSingleUser);




module.exports = router;
