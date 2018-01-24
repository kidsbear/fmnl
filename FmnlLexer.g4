lexer grammar FmnlLexer;

NOTE_NAME: [A-Z0-9];
NOTE_PREFIX: [#b/\\];
NOTE_SUFFIX: '.';
LIST_INFIX_OR_NOTE_SUFFIX: '-';

LIST_INFIX: '+' | 't';
LIST_START: '(';
LIST_END: ')';
LIST_SUFFIX: [*^];
LIST_SEP: ',';

WRAPPER_START: '[';
WRAPPER_CLOSE: ']';

FILLER: '|';

FUNCTION_START: '<' -> mode(func);
FUNCTION_DEF_KEYWORD: 'function';
FUNCTION_EXPORT_KEYWORD: 'export';
NOTE_DEF_KEYWORD: 'note';
ASSIGN: '=';

WHITESPACE : (' ' | '\t' | '\n' | '\r')+ -> channel(HIDDEN);
LINE_COMMENT: '`' ~[\r\n]* -> skip;

SETTING_KEYWORD: 'setting' -> mode(setting);

mode func;
FUNCTION_END: '>' -> mode(DEFAULT_MODE);
FUNCTION_NAME: [a-zA-Z0-9+\-#/\\]+;

mode setting;
SETTING_VARIABLE_NAME: [a-zA-Z0-9]+;
SETTING_ASSIGN: '=' -> mode(setting_assign);
SETTING_WHITESPACE : (' ' | '\t')+ -> channel(HIDDEN);
SETTING_LINE_COMMENT: '`' ~[\r\n]* -> skip;

mode setting_assign;
SETTING_VARIABLE_VALUE: [a-zA-Z0-9]+;
SETTING_END: ('\n' | '\r') -> mode(DEFAULT_MODE);
SETTING_ASSIGN_WHITESPACE : (' ' | '\t')+ -> channel(HIDDEN);
SETTING_ASSIGN_LINE_COMMENT: '`' ~[\r\n]* -> skip;

