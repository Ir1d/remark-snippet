/* eslint-disable max-statements, func-names */
let path = require('path')
let rebuild = require('./rebuild.js')
let walkers = require('./walkers.js')
const zero = 0
const one  = 1
const PLUGIN_NAME = 'remark-snippet'
// const SNIPPET_TOKEN = "--8<--"

function addPrefix(f, prefix) {
  return f.split('\n').map(s => (prefix + s)).join('\n');
}

function bumpAndLink (root, headerLevel, child) {
  root = rebuild.headings(root, headerLevel)
  root = rebuild.links(root, child.fpath.replace(/"/g, ''), child.source.dirname)
  return root
}

function splitAndMerge (children, i, root) {
  let head = children.slice(zero, i)
  let tail = children.slice(i + one)

  children = head.concat(root.children)
    .concat(tail)

  return children
}

function tokenizer (eat, value, silent) {
  let parseSnippet = /^(.*)--8<-- (.*?)(\n|$)/
  let node

  while (parseSnippet.test(value)) {
    const res = value.match(parseSnippet)
    let prefix = res[1]
    let file = res[2]
    let frag = prefix + '--8<-- ' + file

    value = value.slice(frag.length)

    eat(frag)({
      source : this.file,
      type   : 'snippet',
      fpath  : file,
      prefix: prefix,
      data: {
        hProperties: {
          class: 'snippet',
          fpath: file
        }
      },
    })
  }
  return node
}

module.exports = function (options) {
  var proc = this
  var prt = proc.Parser.prototype

  prt.blockTokenizers.snippet = tokenizer
  prt.blockMethods.unshift('snippet')

  // console.log(options)
  expand = options?options.expand || 0:0

  if (expand) return function transformer (ast, file) {
    let children = ast.children
    var headerLevel = 0

    for (let i = 0; i < children.length; i++) {

      let child = children[i]

      if (child.type === 'snippet') {
        vfile = walkers.toFile(path.join(child.source.dirname, child.fpath.replace(/"/g, '')))
        vfile.contents = addPrefix(vfile.contents, child.prefix)
        let parsedSnippet = proc.parse(vfile)

        file.info(`Snippeting ${child.fpath} from --8<-- statement.`, child.position, PLUGIN_NAME)
        let root = proc.runSync(parsedSnippet)

        root = bumpAndLink(root, headerLevel, child)
        children = splitAndMerge(children, i, root)
        i += root.children.length - one
      }

      if (child.type === 'heading') headerLevel = child.depth
    }
    ast.children = children
  }
  else {
    // leave snippet node in AST
    const visitors = proc.Compiler.prototype.visitors
    visitors.snippet = function (node) {
      // return '$$\n' + node.value + '\n$$'
      // console.log('visited in index.js')
      // console.log(node.value)
      // console.log(node.children)
      // let res = '??? ' + node.title + '\n'
      // for (let w of node.children) {
      //   console.log(w)
      //   res += visitors[w.type].call(w)
      // }
      // console.olg
      // return this.encode(node.children)
      // return res
      // console.log('??' + String(node))
      str = node.prefix + '--8<-- ' + node.fpath
      // let children_ = this.all(node)
      // no children
      // .map((ele) => {
        // console.log(ele.split('\n').map(e => '    ' + e))
        // return ele.split('\n').map(e => '    ' + e).join('\n')
      // }
      // ).join('\n    \n')
      // console.log(children_)
      return str
      // return node.header + children_
    }
  }
}
