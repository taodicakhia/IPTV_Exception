'use strict';
var express = require('express');
var app = express();
var http = require('http');
var url = require('url');
var fs = require('fs');
var webdriver = require('selenium-webdriver');
var chrome = require('selenium-webdriver/chrome');
var chromedriver_path = require('chromedriver').path;
var vtvgo_re = new RegExp('https:\/\/(vtvgo-live|vtv-live|vtvnews-live)[^\"]+(index\.m3u8|playlist\.m3u8)', 'm');
var data_json = JSON.parse(fs.readFileSync("m3u8_url.json", 'utf-8'));
console.log(process.env.CHROMEDRIVER_PATH)
async function get_m3u8_selenium(url, res) {
	var service = await new chrome.ServiceBuilder().build();
	chrome.setDefaultService(service);
	var options = await new chrome.Options();
	options.headless()
	options.addArguments('--disable-gpu');
	options.addArguments('--disable-dev-shm-usage');
	var loggingPrefs = await new webdriver.logging.Preferences();
	loggingPrefs.setLevel(webdriver.logging.Type.BROWSER, webdriver.logging.Level.ALL);
	loggingPrefs.setLevel(webdriver.logging.Type.PERFORMANCE, webdriver.logging.Level.ALL);
	options.setLoggingPrefs(loggingPrefs);
	options.setPerfLoggingPrefs({'enableNetwork': true, 'enablePage': true});
	var driver = await new webdriver.Builder().forBrowser('chrome').withCapabilities(webdriver.Capabilities.chrome()).setChromeOptions(options).build();
	driver.get(url);
	var log = await driver.manage().logs().get('performance');
	driver.quit();
	for (var i = log.length - 1; i >= 0; i--) {
		var m3u8 = vtvgo_re.exec(JSON.stringify(log[i]));
		if (m3u8 != null) {
			var link = m3u8[0]
			break;
		}
	}
	res.redirect(link);
}
app.get('/m3u8_query', function(req, res){
	var id = req.query.id
	var server = req.query.server
	if (server == 'vtvgo') {
		if (id == 'vtv1') {
			var url = (data_json.server)[0].vtvgo.vtv1
		}
		else if (id == 'vtv2') {
			var url = (data_json.server)[0].vtvgo.vtv2
		}
		else if (id == 'vtv3') {
			var url = (data_json.server)[0].vtvgo.vtv3;
		}
		else if (id == 'vtv4') {
			var url = (data_json.server)[0].vtvgo.vtv4;
		}
		else if (id == 'vtv5') {
			var url = (data_json.server)[0].vtvgo.vtv5;
		}
		else if (id == 'vtv6') {
			var url = (data_json.server)[0].vtvgo.vtv6;
		}
		else if (id == 'vtv7') {
			var url = (data_json.server)[0].vtvgo.vtv7;
		}
		else if (id == 'vtv8') {
			var url = (data_json.server)[0].vtvgo.vtv8;
		}
		else if (id == 'vtv9') {
			var url = (data_json.server)[0].vtvgo.vtv9;
		}
		else if (id == 'vtv5tnb') {
			var url = (data_json.server)[0].vtvgo.vtv5tnb;
		}
		else if (id == 'vtv5tn') {
			var url = (data_json.server)[0].vtvgo.vtv5tn;
		}
		get_m3u8_selenium(url, res)
	}
});
app.listen(process.env.PORT | 5000);