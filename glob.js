//local setting

var 
_ = require('lodash')
,share = {
	pass: 'stoya'
}

global.wnc = {}

wnc.setting = _.extend(share, require('./local.js'))
