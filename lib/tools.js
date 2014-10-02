/*
 * tools
 */

var q = require('q')
,_ = require('lodash')
,fs = require('fs')
,request = require('request')
,setting = wnc.setting
,request = require('request')
,qexe = q.denodeify(require('child_process').exec)

exports.qr = function(args) {

	var uri = args.uri || args.url
	,def = q.defer()

	request(args, function(err, response, body) {
		if(err) def.reject(err)
		else def.resolve({
			response: response
			,body: body
		})
	})

	return def.promise
}

//cmds
exports.cmds = function(req, res) { 
	var
	cmd = req.params.cmd || ''
	,cmds = ['git-pull', 'pm2', 'clear-cache']
	,nocluster = req.query.nocluster
	,pass = req.query.pass
	if(_.indexOf(cmds, cmd) > -1 && pass === setting.pass) {

		if(setting.servers && !nocluster) requestCluster(cmd)
		qexe('bash cmds/' + cmd + '.sh').done(function(data) {
			console.log(new Date() + ' --- ' + cmd + ' - ' + ' ok')
			res.send('ok')
		}, function(why) {
			console.error(new Date() + ' --- ' + cmd + ' - ' + ' not ok - ' + why)
			res.send(why)
		})
	}
	else res.send('not ok')

}

exports.tasks = function(app) {
	app.get('/exec/:cmd', exports.cmds)
}


function requestCluster(cmd) {
	_.each(setting.servers, function(v, i) {
		request({
			uri: v + '/exec/' + cmd + '?nocluster=1'
			,method: 'get'
		})
	})
}