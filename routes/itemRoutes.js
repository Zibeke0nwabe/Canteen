const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { isLoggedIn } = require('../middlewares/authMiddleware');

// Public landing and menu
router.get('/', itemController.landingPage);                   
router.get('/menu', itemController.menuAll);                    
router.get('/menu/:category', itemController.menuByCategory);   

// Logged-in home routes
router.get('/home', isLoggedIn, itemController.home);           
router.get('/home/:category', isLoggedIn, itemController.homeByCategory);

module.exports = router;
