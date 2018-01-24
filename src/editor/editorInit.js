const lineNumbersFunc = require("./editor");

let autoSave = true;
module.exports = {
    setAutoSave: function(val) {
        autoSave = val;
    },

    init: function (defaultValue, onType) {
        // "amdrequire" is from index.html
        amdrequire.config({ paths: { 'vs': '../node_modules/monaco-editor/min/vs' }});
        amdrequire(['vs/editor/editor.main'], function() {
            // Register a new language
            monaco.languages.register({ id: 'fmnl' });

            monaco.languages.setLanguageConfiguration('fmnl', {
                brackets: [
                    ['{', '}'],
                    ['[', ']'],
                    ['(', ')'],
                    ['<', '>'],
                ],
                autoClosingPairs: [
                    { open: '[', close: ']' },
                    { open: '{', close: '}' },
                    { open: '(', close: ')' },
                    { open: '<', close: '>' },
                ],
                surroundingPairs: [
                    { open: '{', close: '}' },
                    { open: '[', close: ']' },
                    { open: '(', close: ')' },
                    { open: '<', close: '>' },
                ]
            });

            // Register a tokens provider for the language
            monaco.languages.setMonarchTokensProvider('fmnl', {
                tokenizer: {
                    root: [
                        [/setting/, "setting-key"],
                        [/export/, "exp-key"],
                        [/function/, "fnc-key"],
                        [/note/, "note-key"],
                        [/<[a-zA-Z0-9+\-#/\\]+>/, "fnc-name"],
                        [/[#b/\\]/, "note-prefix"],
                        [/`.*/, "comment"],
                    ]
                }
            });

            // Define a new theme that constains only rules that match this language
            monaco.editor.defineTheme('fmnlColor', {
                base: 'vs-dark',
                inherit: true,
                rules: [
                    { token: 'setting-key', foreground: '00BFFF' },
                    { token: 'exp-key', foreground: '00BFFF' },
                    { token: 'fnc-key', foreground: '00BFFF' },
                    { token: 'note-key', foreground: '00BFFF' },
                    { token: 'fnc-name', foreground: '7FFF00' },
                    { token: 'note-prefix', foreground: 'FFD700' },
                    { token: 'comment', foreground: '808080' },
                ]
            });

            // Register a completion item provider for the new language
            monaco.languages.registerCompletionItemProvider('fmnl', {
                provideCompletionItems: () => {
                    return [
                        {
                            label: 'function',
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: {
                                value: 'function <${1:name}>(${2:param}) = ${0}'
                            }
                        },
                        {
                            label: 'setting',
                            kind: monaco.languages.CompletionItemKind.Keyword,
                            insertText: {
                                value: 'setting ${1:name} = ${2:value}'
                            }
                        },
                    ]
                }
            });

            let storedValue = window.localStorage.getItem("input");
            if (storedValue) {
                defaultValue = storedValue;
            }
            let editor = monaco.editor.create(document.getElementById('input'), {
                value: defaultValue,
                language: 'fmnl',
                lineNumbers: lineNumbersFunc,
                theme: "fmnlColor",
                automaticLayout: true
            });
            let onChange = () => {
                if (autoSave) {
                    window.localStorage.setItem("input", editor.getValue());
                }
                if ($("#auto-compile").is(":checked")) {
                    onType();
                }
            };
            editor.onKeyUp(onChange);
            window.editor = editor;

        }, function() {
            $("#input").replaceWith($("<textarea id=input rows=3 cols=50>").html(defaultValue));
        });
    }
};