const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/product.controller');

router.get('/categories', ProductController.getCategories);
router.get('/alertes', ProductController.getLowStock);
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.post('/', ProductController.create);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);

module.exports = router;
