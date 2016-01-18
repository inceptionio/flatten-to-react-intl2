#!/usr/bin/env node

var program = require('commander');
var fs = require('fs');
var path = require('path');

function merge(obj1, obj2){
  var obj3 = {};
  for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
  for (var attrname2 in obj2) { obj3[attrname2] = obj2[attrname2]; }
  return obj3;
}

function upperCaseText(match, group1) {
  return group1.toUpperCase();
}

function eachRecursive(obj, key) {
  var newObject = {};

  for (var k in obj) {
    var newKey = k;
    newKey = (key) ? key + "." + newKey : newKey;

    if (typeof obj[k] == "object" && obj[k] !== null) {
      newObject = merge(newObject, eachRecursive(obj[k], newKey));
    }

    if (typeof obj[k] === "string") {
      var keyId = newKey.replace(/\.(.)/g, upperCaseText);

      newObject[keyId] = {
        id: newKey,
        defaultMessage: obj[k]
      };
    }
  }

  return newObject;
}

function eachTranslation(obj, key) {
  var newObject = {};

  for (var k in obj) {
    var newKey = k;
    newKey = (key) ? key + "." + newKey : newKey;

    if (typeof obj[k] == "object" && obj[k] !== null) {
      newObject = merge(newObject, eachTranslation(obj[k], newKey));
    }

    if (typeof obj[k] === "string") {
      newObject[newKey] = obj[k];
    }
  }

  return newObject;
}

function flatten(args) {
  var filename = args[0];

  fs.exists(filename, function(exists) {
    if (exists) {
      var fileObj = require(filename);

      var newObj = eachRecursive(fileObj);

      var newFilename = path.basename(filename, path.extname(filename))
                          + "-default-flat.json";

      var translation = eachTranslation(fileObj);
      
      console.log(translation);

      fs.writeFile(newFilename, JSON.stringify(newObj), function(err) {
        if (err) {
          return console.log(err);
        }

        console.log(newFilename + " saved");
      });
    } else {
      console.error('File does not exist');
    }
  });
}

program
  .version('0.0.1')
  .usage('[options] <file ...>')
  .option('-f, --flatten', 'Flatten')
  .parse(process.argv);

if (program.flatten) flatten(program.args);
