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
	var url = (data_json.server)[0][server][id]
	if (url != undefined) {
		get_m3u8_selenium(url, res)
	}
	else {
		res.send('Error')
	}
});
app.listen(process.env.PORT | 5000);