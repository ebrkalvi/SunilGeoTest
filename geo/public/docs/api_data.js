define({ "api": [  {    "type": "get",    "url": "/:id",    "title": "GetAction",    "name": "GetAction",    "group": "Actions",    "description": "<p>Request a specific action</p>",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "id",            "description": "<p>Action unique ID.</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "action",            "description": "<p>object</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n{\n        \"request\" : {\n            \"timestamp_end\" : 1459801715.18864,\n            \"host\" : \"combine.urbanairship.com\",\n            \"timestamp_start\" : 1459801715.15211,\n            \"path\" : \"/warp9/\",\n            \"scheme\" : \"https\",\n            \"method\" : \"POST\"\n        },\n        \"response\" : {\n            \"status_code\" : 200,\n            \"reason\" : \"OK\",\n            \"timestamp_end\" : 1459801715.5231,\n            \"timestamp_start\" : 1459801715.49952,\n            \"contentLength\" : 20\n        },\n        \"sid\" : \"5702ce5752509d222dadf965\",\n        \"action\" : \"Entering username\",\n        \"_id\" : \"5702ce7352509d222dadf97e\"\n    }",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "optional": false,            "field": "The",            "description": "<p><code>error</code>field will have more diagnostic info/message.</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./lib/geo/geo.js",    "groupTitle": "Actions"  },  {    "type": "get",    "url": "/actions",    "title": "GetActions",    "name": "GetActions",    "group": "Actions",    "description": "<p>Request all actions associated with a session</p>",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "sid",            "description": "<p>Session unique ID.</p>"          }        ]      }    },    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Object[]",            "optional": false,            "field": "array",            "description": "<p>of action objects</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n[\n  {\n        \"request\" : {\n            \"timestamp_end\" : 1459801715.18864,\n            \"host\" : \"combine.urbanairship.com\",\n            \"timestamp_start\" : 1459801715.15211,\n            \"path\" : \"/warp9/\",\n            \"scheme\" : \"https\",\n            \"method\" : \"POST\"\n        },\n        \"response\" : {\n            \"status_code\" : 200,\n            \"reason\" : \"OK\",\n            \"timestamp_end\" : 1459801715.5231,\n            \"timestamp_start\" : 1459801715.49952,\n            \"contentLength\" : 20\n        },\n        \"sid\" : \"5702ce5752509d222dadf965\",\n        \"action\" : \"Entering username\",\n        \"_id\" : \"5702ce7352509d222dadf97e\"\n    },\n  {\n        \"request\" : {\n            \"timestamp_end\" : 1459801715.18864,\n            \"host\" : \"combine.urbanairship.com\",\n            \"timestamp_start\" : 1459801715.15211,\n            \"path\" : \"/warp9/\",\n            \"scheme\" : \"https\",\n            \"method\" : \"POST\"\n        },\n        \"response\" : {\n            \"status_code\" : 200,\n            \"reason\" : \"OK\",\n            \"timestamp_end\" : 1459801715.5231,\n            \"timestamp_start\" : 1459801715.49952,\n            \"contentLength\" : 20\n        },\n        \"sid\" : \"5702ce5752509d222dadf965\",\n        \"action\" : \"Entering username\",\n        \"_id\" : \"5702ce7352509d222dadf97e\"\n    }\n]",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "optional": false,            "field": "The",            "description": "<p><code>error</code>field will have more diagnostic info/message.</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./lib/geo/geo.js",    "groupTitle": "Actions"  },  {    "type": "post",    "url": "/app",    "title": "AddApp",    "name": "AddApp",    "group": "Apps",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "File",            "optional": false,            "field": "file",            "description": "<p>apk or ipa.</p>"          }        ]      }    },    "description": "<p>Create a new App</p>",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "_id",            "description": "<p>unique id of the app</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n\"572c8a690ef6dd9e4aaa4642\"",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "optional": false,            "field": "The",            "description": "<p><code>error</code>field will have more diagnostic info/message.</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./lib/geo/geo.js",    "groupTitle": "Apps"  },  {    "type": "get",    "url": "/app/:id",    "title": "GetApp",    "name": "GetApp",    "group": "Apps",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "id",            "description": "<p>App unique ID.</p>"          }        ]      }    },    "description": "<p>Request a app with specified id for the authenticated user</p>",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "App",            "description": "<p>object</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n{\n    \"createdAt\":\"2016-05-06T12:13:29.283Z\",\"name\":\"eB-Test1\",\"appName\":\"Jamba Juice\",\"_id\":\"572c8a690ef6dd9e4aaa4642\"\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "optional": false,            "field": "The",            "description": "<p><code>id</code> of the App was not found.</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./lib/geo/geo.js",    "groupTitle": "Apps"  },  {    "type": "get",    "url": "/app",    "title": "GetApps",    "name": "GetApps",    "group": "Apps",    "description": "<p>Request all apps for the authenticated user</p>",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Object[]",            "optional": false,            "field": "array",            "description": "<p>of app objects</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n[\n {\"createdAt\":\"2016-05-06T12:13:29.283Z\",\"name\":\"eB-Test1\",\"appName\":\"Jamba Juice\",\"_id\":\"572c8a690ef6dd9e4aaa4642\"},\n {\"createdAt\":\"2016-04-19T17:00:10.754Z\",\"name\":\"Appium Android Testcases\",\"appName\":\"com.olo.jambajuice\",\"_id\":\"5716641a52509d222dae0442\"}\n]",          "type": "json"        }      ]    },    "version": "0.0.0",    "filename": "./lib/geo/geo.js",    "groupTitle": "Apps"  },  {    "type": "post",    "url": "/session/activate",    "title": "ActivateSession",    "name": "ActivateSession",    "group": "Sessions",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "id",            "description": "<p>Unique id of the Session.</p>"          }        ]      }    },    "description": "<p>Activate/Start a Session</p>",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "_id",            "description": "<p>unique id of the session</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n\"572c8a690ef6dd9e4aaa4642\"",          "type": "json"        }      ]    },    "version": "0.0.0",    "filename": "./lib/geo/geo.js",    "groupTitle": "Sessions"  },  {    "type": "post",    "url": "/session",    "title": "AddSession",    "name": "AddSession",    "group": "Sessions",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "name",            "description": "<p>Name of the Session.</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "appName",            "description": "<p>Name of the App.</p>"          },          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "os",            "description": "<p>OS where the App would be run/test.</p>"          }        ]      }    },    "description": "<p>Create a new Session</p>",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "_id",            "description": "<p>unique id of the session</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n\"572c8a690ef6dd9e4aaa4642\"",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "optional": false,            "field": "The",            "description": "<p><code>error</code>field will have more diagnostic info/message.</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./lib/geo/geo.js",    "groupTitle": "Sessions"  },  {    "type": "post",    "url": "/session/deactivate",    "title": "DeactivateSession",    "name": "DeactivateSession",    "group": "Sessions",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "id",            "description": "<p>Unique id of the Session.</p>"          }        ]      }    },    "description": "<p>DeactivateSession/Stop a Session</p>",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "_id",            "description": "<p>unique id of the session</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n\"572c8a690ef6dd9e4aaa4642\"",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "optional": false,            "field": "The",            "description": "<p><code>error</code>field will have more diagnostic info/message.</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./lib/geo/geo.js",    "groupTitle": "Sessions"  },  {    "type": "post",    "url": "/session",    "title": "DeleteSession",    "name": "DeleteSession",    "group": "Sessions",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "id",            "description": "<p>Unique id of the Session.</p>"          }        ]      }    },    "description": "<p>Delete a Session</p>",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "_id",            "description": "<p>unique id of the session</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n\"572c8a690ef6dd9e4aaa4642\"",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "optional": false,            "field": "The",            "description": "<p><code>error</code>field will have more diagnostic info/message.</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./lib/geo/geo.js",    "groupTitle": "Sessions"  },  {    "type": "get",    "url": "/session/:id",    "title": "GetSession",    "name": "GetSession",    "group": "Sessions",    "parameter": {      "fields": {        "Parameter": [          {            "group": "Parameter",            "type": "String",            "optional": false,            "field": "id",            "description": "<p>Session unique ID.</p>"          }        ]      }    },    "description": "<p>Request a session with specified id for the authenticated user</p>",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Object",            "optional": false,            "field": "Session",            "description": "<p>object</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n{\n    \"createdAt\":\"2016-05-06T12:13:29.283Z\",\"name\":\"eB-Test1\",\"appName\":\"Jamba Juice\",\"_id\":\"572c8a690ef6dd9e4aaa4642\"\n}",          "type": "json"        }      ]    },    "error": {      "fields": {        "Error 4xx": [          {            "group": "Error 4xx",            "optional": false,            "field": "The",            "description": "<p><code>id</code> of the Session was not found.</p>"          }        ]      }    },    "version": "0.0.0",    "filename": "./lib/geo/geo.js",    "groupTitle": "Sessions"  },  {    "type": "get",    "url": "/session",    "title": "GetSessions",    "name": "GetSessions",    "group": "Sessions",    "description": "<p>Request all sessions for the authenticated user</p>",    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "type": "Object[]",            "optional": false,            "field": "array",            "description": "<p>of session objects</p>"          }        ]      },      "examples": [        {          "title": "Success-Response:",          "content": "HTTP/1.1 200 OK\n[\n {\"createdAt\":\"2016-05-06T12:13:29.283Z\",\"name\":\"eB-Test1\",\"appName\":\"Jamba Juice\",\"_id\":\"572c8a690ef6dd9e4aaa4642\"},\n {\"createdAt\":\"2016-04-19T17:00:10.754Z\",\"name\":\"Appium Android Testcases\",\"appName\":\"com.olo.jambajuice\",\"_id\":\"5716641a52509d222dae0442\"}\n]",          "type": "json"        }      ]    },    "version": "0.0.0",    "filename": "./lib/geo/geo.js",    "groupTitle": "Sessions"  },  {    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "optional": false,            "field": "varname1",            "description": "<p>No type.</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "varname2",            "description": "<p>With type.</p>"          }        ]      }    },    "type": "",    "url": "",    "version": "0.0.0",    "filename": "./doc/main.js",    "group": "_Users_sunilreddy_Desktop_crystalmatter_GeoTesting_geo_doc_main_js",    "groupTitle": "_Users_sunilreddy_Desktop_crystalmatter_GeoTesting_geo_doc_main_js",    "name": ""  },  {    "success": {      "fields": {        "Success 200": [          {            "group": "Success 200",            "optional": false,            "field": "varname1",            "description": "<p>No type.</p>"          },          {            "group": "Success 200",            "type": "String",            "optional": false,            "field": "varname2",            "description": "<p>With type.</p>"          }        ]      }    },    "type": "",    "url": "",    "version": "0.0.0",    "filename": "./public/docs/main.js",    "group": "_Users_sunilreddy_Desktop_crystalmatter_GeoTesting_geo_public_docs_main_js",    "groupTitle": "_Users_sunilreddy_Desktop_crystalmatter_GeoTesting_geo_public_docs_main_js",    "name": ""  }] });
