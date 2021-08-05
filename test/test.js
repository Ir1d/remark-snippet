"use strict";
const remark = require("remark");
const parse = require("remark-parse");
let vfile = require('to-vfile')
const snippet = require("./../");


const fs = require("fs");
const www = fs.readFileSync("includer.md");
let res = remark()
  .use(parse)
  .use(snippet)
  .parse(String(www), function(err, res) {
    console.log(String(res));
  });
  
  console.log(res)
  
remark()
  // .use(parse)
  // .use(snippet, {expand: true})
  .use(snippet, {expand: false})
  .process(vfile.readSync('includer.md'),(err, out) => {
  // .process(vfile.readSync('includer.md'),(err, out) => {
    if (err) console.log(err)
    console.log(String(out))
  });
