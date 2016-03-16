var router = require('express').Router({ mergeParams: true });
module.exports = router;

router.callbacks    = require('./controllers/geo');
router.models       = require('./models');

// Module's Routes. Please note this is actually under /hello, because module is attached under /hello

router.get('/', router.callbacks.findAll);
router.get('/:id', router.callbacks.findById);
router.post('/', router.callbacks.addGeo);
router.put('/:id', router.callbacks.updateGeo);
router.delete('/:id', router.callbacks.deleteGeo);
