const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { isAdmin } = require('../middlewares/authMiddleware');

router.get('/admin/login', adminController.renderLogin);
router.post('/admin/login', adminController.login);
router.get('/admin/logout', adminController.logout);
router.get('/admin', isAdmin, adminController.dashboard);
router.post('/admin/add-item', isAdmin, adminController.upload.single('imageFile'), adminController.addItem);
router.post('/admin/update-status/:id', isAdmin, adminController.updateStatus);
router.post('/admin/delete-item', isAdmin, adminController.deleteItem);

module.exports = router;
