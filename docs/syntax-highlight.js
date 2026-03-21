const KEYWORDS = ["def", "participant", "true", "false"]; 
const SETTINGS = [
    "arrowHeadSize", "dropCrossSize", "thickArrowThickness", "labelOffset",
    "corruptStartRatio", "dropStartRatio", "squiggleSize", "squiggleCount",
    "timeTickInterval", "participantSpacing", "participantLabelHeight",
    "annotationWidth", "participantFontSize", "messageFontSize",
    "paddingX", "paddingY", "showGrid", "showTimeTicks", "timeUnit"
];

const KEYWORDS_REGEX = new RegExp(`\\b(${KEYWORDS.join('|')})\\b`);
const SETTINGS_REGEX = new RegExp(`\\b(${SETTINGS.join('|')})\\b`);

CodeMirror.defineMode('protocol-ml', function () {
    return {
        startState: function () { return { inString: false }; },
        token: function (stream, state) {
            // String continuation
            if (state.inString) {
                if (stream.skipTo('"')) {
                    stream.next();
                    state.inString = false;
                } else {
                    stream.skipToEnd();
                }
                return 'pml-label';
            }

            // String start
            if (stream.peek() === '"') {
                stream.next();
                state.inString = true;
                return 'pml-label';
            }

            // Whitespace
            if (stream.eatSpace()) return null;

            // Comments
            if (stream.match('//')) {
                stream.skipToEnd();
                return 'pml-comment';
            }

            // @number position
            if (stream.match(/@(\d+(\.\d+)?)/)) return 'pml-at';

            // Arrow types
            if (stream.match('->')) return 'pml-arrow-normal';
            if (stream.match('=>')) return 'pml-arrow-thick';
            if (stream.match('~>')) return 'pml-arrow-corrupt';
            if (stream.match('-x')) return 'pml-arrow-dropped';

            // Annotation sides
            if (stream.match(/[<>]/)) return 'pml-side';

            // Keywords
            if (stream.match(KEYWORDS_REGEX)) return 'pml-keyword';

            // Settings
            if (stream.match(SETTINGS_REGEX)) return 'pml-setting';

            // Numbers with optional unit
            if (stream.match(/\d+(\.\d+)?(px|em|rem|%)?/)) return 'pml-value';

            // Aliases / Identifiers
            if (stream.match(/[a-zA-Z_]\w*/)) return 'pml-alias';

            stream.next();
            return null;
        },
        lineComment: "//"
    };
});

CodeMirror.hint["protocol-ml"] = function (cm) {
    const cursor = cm.getCursor();
    const line = cm.getLine(cursor.line);
    let start = cursor.ch;
    let end = cursor.ch;

    // Move start backwards to find the beginning of the word containing letters/numbers
    while (start > 0 && /[A-Za-z0-9_]/.test(line.charAt(start - 1))) {
        start--;
    }

    let word = line.slice(start, end);

    // Find all participant aliases in the document
    const docText = cm.getValue();
    const aliasRegex = /^participant\s+(?:(?:"[^"]+")|\S+)\s+(\w+)/gm;
    const aliases = [];
    let match;
    while ((match = aliasRegex.exec(docText)) !== null) {
        if (match[1] && !aliases.includes(match[1])) {
            aliases.push(match[1]);
        }
    }


    const allSuggestions = [...aliases, ...KEYWORDS, ...SETTINGS];
    let list = allSuggestions.filter(s => s.toLowerCase().startsWith(word.toLowerCase()));

    // Sort: aliases first, then keywords, then settings
    list.sort((a, b) => {
        const aIsAlias = aliases.includes(a);
        const bIsAlias = aliases.includes(b);
        if (aIsAlias && !bIsAlias) return -1;
        if (!aIsAlias && bIsAlias) return 1;

        const aIsKeyword = KEYWORDS.includes(a);
        const bIsKeyword = KEYWORDS.includes(b);
        if (aIsKeyword && !bIsKeyword) return -1;
        if (!aIsKeyword && bIsKeyword) return 1;
        
        return a.localeCompare(b);
    });

    return {
        list: list,
        from: CodeMirror.Pos(cursor.line, start),
        to: CodeMirror.Pos(cursor.line, end)
    };
};

CodeMirror.registerHelper("hintWords", "protocol-ml", [
    ...SETTINGS,
    ...KEYWORDS,
]);
