/*
 * routes
 */

var q = require('q')
,_ = require('lodash')
,fs = require('fs')
,tools = require('../lib/tools')
,qr = tools.qr
,tasks = tools.tasks
,request = require('request')
,setting = wnc.setting
,path = require('path')
,fsWrite = q.denodeify(fs.writeFile)
,fsExists = q.denodeify(fs.exists)
,fsMkdir = q.denodeify(fs.mkdir)
,urlReg = new RegExp(
	setting.wordpressUrl
	.replace(/\:/g,'\\:')
	.replace(/\./g,'\\.')
	.replace(/\//g,'\\/')
	.replace(/\-/g,'\\-')
, 'g')

function proxy(req, res, next) {

	var op = req.path
	,ou = req.originalUrl
	,extArr = op.split('.')
	,ext = extArr.length > 1?extArr[extArr.length - 1]:''
	,isIndex = op[op.length - 1] === '/'
	,isFile =  isIndex || ext
	,targetFile = isIndex?op + 'index.html':(ext?op:(ou.replace(/\/+/g, '/').replace(/\//g, '-') + '.html'))
	,targetPathStr = 'res' + targetFile
	,targetPath = path.resolve(targetPathStr)
	,isHtml = isIndex || !ext

	if(!isFile) fsExists(targetPath).done(function(exist) {
		if(exist) res.sendFile(targetPath)
		else getHtmlFile()
	}, handleErr)

	else if(!isHtml) getFile()
	else getHtmlFile()


	function getFile() {

		return writeFile(targetPathStr, '', true)
		.done(function() {
			request({
				uri: setting.wordpressUrl + ou
				,method: 'get'
			})
			//.pipe(res)
			.pipe(fs.createWriteStream(targetPath))	

			request({
				uri: setting.wordpressUrl + ou
				,method: 'get'
			})
			.pipe(res)
			//.pipe(fs.createWriteStream(targetPath))
		}, function(err) {
			res.status(500).send(err)
		})	
	}

	function getHtmlFile() {
		return qr({
			uri: setting.wordpressUrl + ou
			,method: 'get'
		})
		.done(handleHtmlRes, handleErr)		
	}

	function handleHtmlRes(data) {

		var response = data.response
		,body = data.body.toString().replace(urlReg, setting.host)
		,statusCode = response.statusCode

		res.status(statusCode).end(body)
		if(statusCode === 200) writeFile(targetPathStr, body)
	}

	function writeFile(targetPathStr, body, onlyFolder) {
		var 
		def = q.defer()
		,arr = targetPathStr.split('/')
		,i = 1
		,len = arr.length
		,pth = arr[0]
		,errs = ''
		loopCreateFile(i)

		function loopCreateFile(i) {
			pth += '/' + arr[i]

			if(i === len - 1 && !onlyFolder) {			
				fsWrite(path.resolve(pth), body)
				.done(done, errWork)
			}
			else if(i < len - 1) mkDir().done(done, function(err) {
				if(err && err.code && err.code === 'EEXIST') done()
				else errWork(err)
			})

				
				
			else if(!errs) def.resolve('ok')
			else  def.reject(errs)
		}

		function mkDir() {
			return fsMkdir(path.resolve(pth), '0755')
		}

		function done(data) {
			i++
			loopCreateFile(i)
		}

		function errWork(err) {
			var errStr = 'err when creating ' + pth + ' : ' + err + ';'
			errs += errStr
			handleErr(errStr)
		}

		return def.promise
	}



	function handleErr(err) {
		console.error(new Date() + ' --- ' +err)
	}

}


exports.init = function(app) {
	tasks(app)
	app.use(proxy)
}