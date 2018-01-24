parser grammar FmnlParser;

options { tokenVocab=FmnlLexer; }

program
    : (noteDef | functionDef | settingDef)+ EOF
    ;

noteDef: NOTE_DEF_KEYWORD NOTE_NAME ASSIGN func;
settingDef: SETTING_KEYWORD SETTING_VARIABLE_NAME SETTING_ASSIGN SETTING_VARIABLE_VALUE SETTING_END;

functionDef: (FUNCTION_EXPORT_KEYWORD)? FUNCTION_DEF_KEYWORD func patternMatcher ASSIGN elements;
patternMatcher: LIST_START NOTE_NAME (LIST_SEP NOTE_NAME)* LIST_END;
func: FUNCTION_START FUNCTION_NAME FUNCTION_END;

element: note | list | wrapper | FILLER;
elements: element+;

prefixedNote: NOTE_PREFIX* NOTE_NAME;
note: prefixedNote note_suffix_*;

rawList: LIST_START list_infix_* elements (LIST_SEP elements)* LIST_END;
list: func* rawList LIST_SUFFIX*;

wrapper: func* WRAPPER_START elements WRAPPER_CLOSE;

note_suffix_: NOTE_SUFFIX | LIST_INFIX_OR_NOTE_SUFFIX;
list_infix_: LIST_INFIX | LIST_INFIX_OR_NOTE_SUFFIX;
