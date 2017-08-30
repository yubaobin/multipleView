var fs = require('fs');
var path = require('path');
var getFilename = function(name) {
  var index = name.indexOf('.');
  return name.substring(0, index);
}
var getJsFile = function() {
  var jsPath = path.resolve(__dirname,'./app/js/');
  var jsList = fs.readdirSync(jsPath, 'utf-8');
  var obj = {};
  for(var i in jsList) {
    var filename = getFilename(jsList[i]);
    obj[filename] = path.resolve(__dirname, path.resolve(jsPath,  filename));
  }
  return obj;
};

var getHtmlFile = function() {
  var htmlPath = path.resolve(__dirname,'./app/view/');
  var htmlList = fs.readdirSync(htmlPath, 'utf-8');
  var list = [];
  for(var i in htmlList) {
    var obj = {}, filename = getFilename(htmlList[i]);
    obj.name = filename;
    obj.title = filename;
    obj.path = path.resolve(__dirname, htmlPath + '/' + htmlList[i]);
    obj.js = filename;
    list.push(obj);
  }
  return list;
};

exports.htmlFile = getHtmlFile();
exports.jsFile = getJsFile();
