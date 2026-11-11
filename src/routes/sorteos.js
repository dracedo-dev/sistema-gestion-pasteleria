const express = require('express');
const router = express.Router();
const { getSorteo, guardarSorteo } = require('../controllers/sorteosController');

router.get('/', getSorteo);
router.post('/', guardarSorteo);

module.exports = router;