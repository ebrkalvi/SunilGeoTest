var router = require('express').Router({
    mergeParams: true
});
module.exports = router;

router.callbacks = require('./controllers/geo');
router.models = require('./models');


router.get('/', router.callbacks.sessions);

/**
 * @api {get} /app GetApps
 * @apiName GetApps
 * @apiGroup Apps
 *  
 * @apiDescription  Request all apps for the authenticated user
 *
 * @apiSuccess {Object[]} array of app objects
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {"createdAt":"2016-05-06T12:13:29.283Z","name":"eB-Test1","appName":"Jamba Juice","_id":"572c8a690ef6dd9e4aaa4642"},
 *      {"createdAt":"2016-04-19T17:00:10.754Z","name":"Appium Android Testcases","appName":"com.olo.jambajuice","_id":"5716641a52509d222dae0442"}
 *     ]
 */
router.get('/app', router.callbacks.getApps);

/**
 * @api {get} /app/:id GetApp
 * @apiName GetApp
 * @apiGroup Apps
 * @apiParam {String} id App unique ID.
 *  
 * @apiDescription  Request a app with specified id for the authenticated user
 *
 * @apiSuccess {Object} App object
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "createdAt":"2016-05-06T12:13:29.283Z","name":"eB-Test1","appName":"Jamba Juice","_id":"572c8a690ef6dd9e4aaa4642"
 *     }
 *
 * @apiError The <code>id</code> of the App was not found.
 */
router.get('/app/:id', router.callbacks.getApp);

/**
 * @api {post} /app AddApp
 * @apiName AddApp
 * @apiGroup Apps
 * @apiParam {String} name Name of the Session.
 * @apiParam {String} appName Name of the App.
 * @apiParam {String} os OS where the App would be run/test.
 *  
 * @apiDescription Create a new App
 *
 * @apiSuccess {String} _id unique id of the app
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     "572c8a690ef6dd9e4aaa4642"
 *
 * @apiError The <code>error</code>field will have more diagnostic info/message.
 */
router.post('/app', router.callbacks.addApp);



/**
 * @apiDefine SessionNotFoundError
 *
 * @apiError SessionNotFound The id of the Session was not found.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "SessionNotFound"
 *     }
 */

/**
 * @api {get} /session GetSessions
 * @apiName GetSessions
 * @apiGroup Sessions
 *  
 * @apiDescription  Request all sessions for the authenticated user
 *
 * @apiSuccess {Object[]} array of session objects
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *      {"createdAt":"2016-05-06T12:13:29.283Z","name":"eB-Test1","appName":"Jamba Juice","_id":"572c8a690ef6dd9e4aaa4642"},
 *      {"createdAt":"2016-04-19T17:00:10.754Z","name":"Appium Android Testcases","appName":"com.olo.jambajuice","_id":"5716641a52509d222dae0442"}
 *     ]
 */
router.get('/session', router.callbacks.getSessions);

/**
 * @api {get} /session/:id GetSession
 * @apiName GetSession
 * @apiGroup Sessions
 * @apiParam {String} id Session unique ID.
 *  
 * @apiDescription  Request a session with specified id for the authenticated user
 *
 * @apiSuccess {Object} Session object
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *         "createdAt":"2016-05-06T12:13:29.283Z","name":"eB-Test1","appName":"Jamba Juice","_id":"572c8a690ef6dd9e4aaa4642"
 *     }
 *
 * @apiError The <code>id</code> of the Session was not found.
 */
router.get('/session/:id', router.callbacks.getSession);

/**
 * @api {post} /session AddSession
 * @apiName AddSession
 * @apiGroup Sessions
 * @apiParam {String} name Name of the Session.
 * @apiParam {String} appName Name of the App.
 * @apiParam {String} os OS where the App would be run/test.
 *  
 * @apiDescription Create a new Session
 *
 * @apiSuccess {String} _id unique id of the session
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     "572c8a690ef6dd9e4aaa4642"
 *
 * @apiError The <code>error</code>field will have more diagnostic info/message.
 */
router.post('/session', router.callbacks.addSession);
router.post('/session/currentAction', router.callbacks.setCurrentAction);

/**
 * @api {post} /session/activate ActivateSession
 * @apiName ActivateSession
 * @apiGroup Sessions
 * @apiParam {String} id Unique id of the Session.
 *  
 * @apiDescription Activate/Start a Session
 *
 * @apiSuccess {String} _id unique id of the session
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     "572c8a690ef6dd9e4aaa4642"
 */
router.post('/session/activate', router.callbacks.activateSession);

/**
 * @api {post} /session/deactivate DeactivateSession
 * @apiName DeactivateSession
 * @apiGroup Sessions
 * @apiParam {String} id Unique id of the Session.
 *  
 * @apiDescription DeactivateSession/Stop a Session
 *
 * @apiSuccess {String} _id unique id of the session
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     "572c8a690ef6dd9e4aaa4642"
 *
 * @apiError The <code>error</code>field will have more diagnostic info/message.
 */
router.post('/session/deactivate', router.callbacks.deactivateSession);

/**
 * @api {post} /session DeleteSession
 * @apiName DeleteSession
 * @apiGroup Sessions
 * @apiParam {String} id Unique id of the Session.
 *  
 * @apiDescription Delete a Session
 *
 * @apiSuccess {String} _id unique id of the session
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     "572c8a690ef6dd9e4aaa4642"
 *
 * @apiError The <code>error</code>field will have more diagnostic info/message.
 */
router.delete('/session', router.callbacks.deleteSession);

/**
 * @api {get} /actions GetActions
 * @apiName GetActions
 * @apiGroup Actions
 *  
 * @apiDescription  Request all actions associated with a session
 *
 * @apiParam {String} sid Session unique ID.
 *
 * @apiSuccess {Object[]} array of action objects
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     [
 *       {
            "request" : {
                "timestamp_end" : 1459801715.18864,
                "host" : "combine.urbanairship.com",
                "timestamp_start" : 1459801715.15211,
                "path" : "/warp9/",
                "scheme" : "https",
                "method" : "POST"
            },
            "response" : {
                "status_code" : 200,
                "reason" : "OK",
                "timestamp_end" : 1459801715.5231,
                "timestamp_start" : 1459801715.49952,
                "contentLength" : 20
            },
            "sid" : "5702ce5752509d222dadf965",
            "action" : "Entering username",
            "_id" : "5702ce7352509d222dadf97e"
        },
 *       {
            "request" : {
                "timestamp_end" : 1459801715.18864,
                "host" : "combine.urbanairship.com",
                "timestamp_start" : 1459801715.15211,
                "path" : "/warp9/",
                "scheme" : "https",
                "method" : "POST"
            },
            "response" : {
                "status_code" : 200,
                "reason" : "OK",
                "timestamp_end" : 1459801715.5231,
                "timestamp_start" : 1459801715.49952,
                "contentLength" : 20
            },
            "sid" : "5702ce5752509d222dadf965",
            "action" : "Entering username",
            "_id" : "5702ce7352509d222dadf97e"
        }
 *     ]
 *
 * @apiError The <code>error</code>field will have more diagnostic info/message.
 */
router.get('/actions', router.callbacks.actions);

/**
 * @api {get} /:id GetAction
 * @apiName GetAction
 * @apiGroup Actions
 *  
 * @apiDescription  Request a specific action
 *
 * @apiParam {String} id Action unique ID.
 *
 * @apiSuccess {String} action object
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
            "request" : {
                "timestamp_end" : 1459801715.18864,
                "host" : "combine.urbanairship.com",
                "timestamp_start" : 1459801715.15211,
                "path" : "/warp9/",
                "scheme" : "https",
                "method" : "POST"
            },
            "response" : {
                "status_code" : 200,
                "reason" : "OK",
                "timestamp_end" : 1459801715.5231,
                "timestamp_start" : 1459801715.49952,
                "contentLength" : 20
            },
            "sid" : "5702ce5752509d222dadf965",
            "action" : "Entering username",
            "_id" : "5702ce7352509d222dadf97e"
        }
 *
 * @apiError The <code>error</code>field will have more diagnostic info/message.
 */
router.get('/:id', router.callbacks.findById);

router.post('/', router.callbacks.addGeo);

router.put('/:id', router.callbacks.updateGeo);

router.delete('/:id', router.callbacks.deleteGeo);