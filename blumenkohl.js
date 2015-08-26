#!/usr/bin/env node

var fs = require("fs");
var sane = require("sane");
var broccoli = require("broccoli");
var Watcher = require("broccoli-sane-watcher");
var ncp = require("ncp");
var path = require("path");
var mkdirp = require("mkdirp");
var clc = require("cli-color");

var args = process.argv.slice(2);

var appRoot = process.cwd();
var destDir = args[0] || "public";
var brocfile = path.join(appRoot, "Brocfile.js");

console.log("Reading Brocfile", brocfile);
console.log("Writing to", destDir, "\n");

mkdirp(destDir);

var tree = require(brocfile);
var builder = new broccoli.Builder(tree);

var broccoliWatcher = new Watcher(builder, {verbose: true});
broccoliWatcher.on("change", function(hash) {
  ncp(hash.directory, path.join(appRoot, destDir));
  console.log(clc.green("Build was successful: " + Math.round(hash.totalTime / 1e6) + "ms"));
});

broccoliWatcher.on("error", function(error) {
  console.log(clc.red("An error occurred:"), error.message);
});

process.addListener("exit", function () {
  console.log("exiting");
  builder.cleanup();
});

process.on("SIGINT", function () {
  process.exit(1);
});

process.on("SIGTERM", function () {
  process.exit(1);
});
