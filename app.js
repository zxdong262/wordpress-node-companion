
/**
 * Module dependencies.
 */

var 

//module
express = require('express')
,bodyParser = require('body-parser')
,compress = require('compression')
,glob = require('./glob')

//user setting
,_ = require('lodash')
,setting = wnc.setting
,port = setting.port
,routes = require('./routes/')
,oneYear = 1000 * 60 * 60 * 24 * 365

// all environments
,app = express()
app.disable('x-powered-by')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
	extended: true
}))

// parse application/json
app.use(bodyParser.json())

// parse application/vnd.api+json as json
app.use(bodyParser.json({ type: 'application/vnd.api+json' }))

//static files
app.use(express.static(__dirname + '/public', {
	maxAge: oneYear
}))
app.use(express.static(__dirname + '/res', {
	maxAge: oneYear
}))

//routes
routes.init(app)

//404
app.use(function(req, res) {
	res.send('res/404.html')
})

//compression
app.use(compress())

//start
app.listen(port, function() {
	console.log('Magic happens on port ' + port)
})

