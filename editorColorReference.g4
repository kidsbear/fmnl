// Color configuration
// default color = black

// rec: find color in children
// x: impossible to reach(parents return color)

program: (noteDef | functionDef)+ EOF; // rec

noteDef: NOTE_DEF_KEYWORD NOTE_NAME ASSIGN func; // rec

functionDef: FUNCTION_DEF_KEYWORD func patternMatcher ASSIGN elements; // rec
patternMatcher: LIST_START NOTE_NAME (LIST_SEP NOTE_NAME)* LIST_END; // rec
func: FUNCTION_START FUNCTION_NAME FUNCTION_END; // green

element: note | list | wrapper | FILLER; // rec
elements: element+; // rec

prefixedNote: NOTE_PREFIX* NOTE_NAME; // rec
note: prefixedNote note_suffix_*; // rec

rawList: LIST_START list_infix_* elements (LIST_SEP elements)* LIST_END; // rec
list: func* rawList LIST_SUFFIX*; // rec

wrapper: WRAPPER_START elements WRAPPER_CLOSE; // rec

note_suffix_: NOTE_SUFFIX | LIST_INFIX_OR_NOTE_SUFFIX; // blue
list_infix_: LIST_INFIX | LIST_INFIX_OR_NOTE_SUFFIX; // black

NOTE_NAME: [A-Z0-9]; // blue
NOTE_PREFIX: [#b/\\]; // orange
NOTE_SUFFIX: '.'; // x
LIST_INFIX_OR_NOTE_SUFFIX: '-'; // x

LIST_INFIX: '+' | 't'; // x
LIST_START: '('; // black
LIST_END: ')'; // black
LIST_SUFFIX: [*^]; // black
LIST_SEP: ','; // black

WRAPPER_START: '['; // black
WRAPPER_CLOSE: ']'; // black

FILLER: '|'; // black

FUNCTION_START: '<' -> mode(func); // x
FUNCTION_DEF_KEYWORD: 'function'; // blue
NOTE_DEF_KEYWORD: 'note'; // blue
ASSIGN: '='; // black

WHITESPACE : (' ' | '\t' | '\n')+ -> channel(HIDDEN); // x

mode func;
FUNCTION_END: '>' -> mode(DEFAULT_MODE); // x
FUNCTION_NAME: [a-zA-Z0-9+\-#/\\]+; // x
