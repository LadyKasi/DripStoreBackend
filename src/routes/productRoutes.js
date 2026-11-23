const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas públicas
router.get('/search', (req, res, next) => productController.pesquisar(req, res, next));
router.get('/:id', (req, res, next) => productController.obterPorId(req, res, next));

// Rotas protegidas por JWT
router.post('/', authMiddleware, (req, res, next) => productController.criar(req, res, next));
router.put('/:id', authMiddleware, (req, res, next) => productController.atualizar(req, res, next));
router.delete('/:id', authMiddleware, (req, res, next) => productController.deletar(req, res, next));

module.exports = router;

