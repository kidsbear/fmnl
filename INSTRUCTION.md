This template is from section 4.

`Regex.g4` is an antlr4 grammer for simple regular expressions. It is
used in a webpage, `index.html`, to build a simple regular expression
syntax highlighting application. If you type in a regular expression
and hit "compile!", the webpage will wrap it up with special HTML
spans such that mousing over an operator will highlight other parallel
operators (or matching parens) in cyan and the subexpression(s) being
operated on in yellow.

As an example, the page comes preloaded with working highlighting for a
fairly substantial regular expression.

To build the grammar, we have set up npm scripts that should work on both
Windows and Linux (and hopefully mac OS). They require Java 6 or higher.

First, make sure you have [Node.js](https://nodejs.org) installed, and set
up the module:
```
$ npm install
```

To build the Java version of the grammer, use:
```
$ npm run antlr4-java
```

Scripts have been provided to run antlr's provided inspection tools:
```
$ ./grun.sh Regex re -tree
foo
^D
(re (alternation (expression (expression (expression (atom f)) (expression (atom o))) (expression (atom o)))) <EOF>)
```

On Windows, the script `grun.bat` should have the same functionality. Pass the name of the grammar (Regex) and
the entry point (the rule "re"), plus an option to control the output. `-tree` prints a lisp representation
of the parse tree, and `-gui` will try to show the tree in a GUI window. The script will wait for input to
parse: tell it to stop and produce output by typing Control-D on Linux (or Control-Z, then Enter on Windows).

To build the JavaScript version of the grammar and bundle the files for the web application, use:
```
$ npm run antlr4
$ npm run build
```
To use the application, open `index.html` in a browser.

Unfortunately, the grammer isn't quite correct. First, it doesn't allow
capturing groups, and it also gets the precedence of Regex operators
wrong. In this section, you will familiarize yourself with antlr4 by
fixing the grammar and the highlighting application. We'll first focus on
getting the grammar right using antlr's provided debugging tools, and then
complete the listener-based application.

This starter code is originally distributed [here](https://bitbucket.org/billzorn/cse401-s4).

A [completed version](https://bitbucket.org/billzorn/cse401-s4-sol) will be made available.
