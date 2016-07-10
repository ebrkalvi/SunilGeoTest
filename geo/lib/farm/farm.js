/**
* This is a "mini-app" that encapsulates router definitions. See more
* at: http://expressjs.com/guide/routing.html (search for "express.Router")
*
*/

var router = require('express').Router({ mergeParams: true });
module.exports = router;

// Don't just use, but also export in case another module needs to use these as well.
router.callbacks    = require('./controllers/manager');
router.models       = require('./models');

router.get('/', router.callbacks.getFarms);
router.get('/index.html', router.callbacks.showFarms);
router.get('/geos', router.callbacks.getGeos);
router.post('/register', router.callbacks.register);
router.get('/:uid/device.html', router.callbacks.showDevices)
router.get('/:uid/device/:udid/info', router.callbacks.getDeviceInfo)
router.post('/:farm/approve', router.callbacks.approve);
router.post('/:farm/ota', router.callbacks.ota);

