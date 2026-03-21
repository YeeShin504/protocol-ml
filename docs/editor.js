import { parse } from '../src/parser.ts';
import { renderSVG } from '../src/renderer.ts';

const preview = document.getElementById('preview');
const copyCodeBtn = document.getElementById('copyCode');
const copyPNGBtn = document.getElementById('copyPNG');
const copySVGBtn = document.getElementById('copySVG');

// Panel & Resizer elements
const panelRef = document.getElementById('panel-reference');
const panelEditor = document.getElementById('panel-editor');
const panelPreview = document.getElementById('panel-preview');
const resizerRef = document.getElementById('resizer-ref');
const resizerPreview = document.getElementById('resizer-preview');
const toggleRefBtn = document.getElementById('toggleReference');

// Resizing logic
function initResizer(resizer, leftPanel, rightPanel, isFirst) {
    let startX, startWidthLeft, startWidthRight;

    resizer.addEventListener('mousedown', (e) => {
        if (e.target.id === 'toggleReference') return;
        
        startX = e.clientX;
        startWidthLeft = leftPanel.offsetWidth;
        startWidthRight = rightPanel.offsetWidth;
        
        // Disable transitions during resizing to prevent lag
        leftPanel.style.transition = 'none';
        
        const onMouseMove = (e) => {
            const deltaX = e.clientX - startX;
            if (isFirst) {
                const newWidth = Math.max(0, startWidthLeft + deltaX);
                leftPanel.style.flex = `0 0 ${newWidth}px`;
                if (editor) editor.refresh();
            } else {
                const newWidth = Math.max(100, startWidthLeft + deltaX);
                leftPanel.style.flex = `0 0 ${newWidth}px`;
                if (editor) editor.refresh();
            }
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            resizer.classList.remove('dragging');
            document.body.style.cursor = 'default';
            
            // Re-enable transition after resizing
            leftPanel.style.transition = '';
            
            if (editor) editor.refresh();
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        resizer.classList.add('dragging');
        document.body.style.cursor = 'col-resize';
    });
}

// Toggle Reference logic
toggleRefBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    panelRef.classList.toggle('collapsed');
    const isCollapsed = panelRef.classList.contains('collapsed');
    toggleRefBtn.textContent = isCollapsed ? '▶' : '◀';
});

const REFERENCE_DATA = [
    {
        group: "Participants",
        items: [
            { title: "Define Participant", syntax: 'participant Name alias', example: 'participant Client c\nparticipant Server s' },
            { title: "Participant Spacing", syntax: 'def participantSpacing 240px', example: 'def participantSpacing 300px' },
            { title: "Label Height", syntax: 'def participantLabelHeight 30px', example: 'def participantLabelHeight 50px' },
            { title: "Font Size", syntax: 'def participantFontSize 20px', example: 'def participantFontSize 24px' }
        ]
    },
    {
        group: "Message Arrows",
        items: [
            { title: "Normal Arrow", syntax: 'a -> b : "label"', example: 'a -> b : "Request"' },
            { title: "Thick Arrow", syntax: 'a => b : "label"', example: 'a => b : "Big Data"' },
            { title: "Corrupt Arrow", syntax: 'a ~> b : "label"', example: 'a ~> b : "Fragmented"' },
            { title: "Dropped Message", syntax: 'a -x b : "label"', example: 'a -x b : "Timeout"' },
            { title: "Time Offsets", syntax: 'a @1.5 -> b @1', example: 'a @1.5 -> b @1 : "Relative Time"' }
        ]
    },
    {
        group: "Arrow Styles",
        items: [
            { title: "Arrow Head Size", syntax: 'def arrowHeadSize 10px', example: 'def arrowHeadSize 15px' },
            { title: "Thick Thickness", syntax: 'def thickArrowThickness 40px', example: 'def thickArrowThickness 20px' },
            { title: "Label Offset", syntax: 'def labelOffset 10px', example: 'def labelOffset 20px' },
            { title: "Message Font Size", syntax: 'def messageFontSize 15px', example: 'def messageFontSize 18px' }
        ]
    },
    {
        group: "Corrupt & Dropped",
        items: [
            { title: "Corrupt Start %", syntax: 'def corruptStartRatio 85%', example: 'def corruptStartRatio 50%' },
            { title: "Drop Start %", syntax: 'def dropStartRatio 85%', example: 'def dropStartRatio 50%' },
            { title: "Drop Cross Size", syntax: 'def dropCrossSize 12px', example: 'def dropCrossSize 20px' },
            { title: "Corrupt Squiggle Size", syntax: 'def squiggleSize 20px', example: 'def squiggleSize 10px' },
            { title: "Corrupt Squiggle Count", syntax: 'def squiggleCount 2', example: 'def squiggleCount 5' }
        ]
    },
    {
        group: "Annotations",
        items: [
            { title: "Left Note", syntax: 'a < "text"', example: 'a < "Local check"' },
            { title: "Right Note", syntax: 'a > "text"', example: 'a > "Processing"' },
            { title: "Annotation Width", syntax: 'def annotationWidth 80px', example: 'def annotationWidth 120px' }
        ]
    },
    {
        group: "Grid & Time",
        items: [
            { title: "Show Grid", syntax: 'def showGrid true', example: 'def showGrid true' },
            { title: "Show Time Ticks", syntax: 'def showTimeTicks true', example: 'def showTimeTicks true' },
            { title: "Time Interval", syntax: 'def timeTickInterval 40px', example: 'def timeTickInterval 60px' },
            { title: "Time Unit", syntax: 'def timeUnit /ms', example: 'def timeUnit /ms' }
        ]
    },
    {
        group: "Layout",
        items: [
            { title: "Horizontal Padding", syntax: 'def paddingX 30px', example: 'def paddingX 50px' },
            { title: "Vertical Padding", syntax: 'def paddingY 20px', example: 'def paddingY 50px' }
        ]
    }
];

function renderReference(filter = '') {
    const container = document.getElementById('reference-list');
    if (!container) return;

    container.innerHTML = ''; // Clear loading message
    const query = filter.toLowerCase().trim();

    REFERENCE_DATA.forEach(group => {
        const filteredItems = group.items.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.syntax.toLowerCase().includes(query) ||
            group.group.toLowerCase().includes(query)
        );

        if (filteredItems.length === 0) return;

        const groupEl = document.createElement('div');
        groupEl.className = 'ref-group';
        groupEl.innerHTML = `<h4>${group.group}</h4>`;
        
        const itemsContainer = document.createElement('div');
        itemsContainer.className = 'group-items';

        filteredItems.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'ref-item';
            
            const titleEl = document.createElement('div');
            titleEl.className = 'ref-title';
            titleEl.textContent = item.title;
            
            const codeEl = document.createElement('code');
            codeEl.className = 'ref-syntax';
            // Use the editor engine to highlight this static snippet!
            CodeMirror.runMode(item.syntax, 'protocol-ml', codeEl);
            
            const btn = document.createElement('button');
            btn.className = 'try-btn-small';
            btn.textContent = 'Try it';
            btn.addEventListener('click', () => {
                const currentValue = editor.getValue();
                const newValue = currentValue ? (currentValue + '\n\n' + item.example) : item.example;
                editor.setValue(newValue);
                editor.setCursor(editor.lineCount(), 0);
                editor.focus();
            });

            itemEl.appendChild(titleEl);
            itemEl.appendChild(codeEl);
            itemEl.appendChild(btn);
            itemsContainer.appendChild(itemEl);
        });

        groupEl.appendChild(itemsContainer);
        container.appendChild(groupEl);
    });

    if (container.innerHTML === '' && query !== '') {
        container.innerHTML = '<div class="loading">No results found for "' + filter + '"</div>';
    }
}

const refSearch = document.getElementById('refSearch');
if (refSearch) {
    refSearch.addEventListener('input', (e) => {
        renderReference(e.target.value);
    });
}


const INITIAL_CODE = `def timeTickInterval 40px
def participantSpacing 240px
def timeUnit /ms
def showTimeTicks true
def showGrid true

participant Alice a
participant Bob b

a -> b : "normal"
b -> a : "normal reply"

a ~> b : "corrupted"
b ~> a : "corrupted reply"

a -x b : "dropped"
b -x a : "dropped reply"

a => b : "thick"
b => a : "thick reply"

a @2 < "left label @2"
b @5 > "right label @5"`;

CodeMirror.commands.autocomplete = function(cm) {
    cm.showHint({ hint: CodeMirror.hint["protocol-ml"] });
};

const editor = window.CodeMirror(document.getElementById('editor'), {
    value: INITIAL_CODE,
    mode: 'protocol-ml',
    lineNumbers: true,
    autofocus: true,
    tabSize: 2,
    indentUnit: 2,
    indentWithTabs: false,
    viewportMargin: Infinity,
    extraKeys: {
        "Ctrl-Space": "autocomplete",
        "Ctrl-/": "toggleComment",
        "Cmd-/": "toggleComment",
        "Tab": (cm) => {
            if (cm.state.completionActive) {
                cm.state.completionActive.pick();
            } else {
                const cursor = cm.getCursor();
                const line = cm.getLine(cursor.line);
                const before = line.slice(0, cursor.ch);
                // If it's just whitespace before the cursor, indent. 
                // Otherwise try to complete.
                if (/^\s*$/.test(before)) {
                    return CodeMirror.Pass;
                }
                cm.execCommand("autocomplete");
            }
        }
    },
    hintOptions: {
        direction: "above",
        completeSingle: false,
        alignWithWord: true
    }
});

// Auto-trigger hints while typing (VS Code style)
editor.on("inputRead", (cm, change) => {
    if (change.text[0] === " " || change.text[0] === "\n") return;
    cm.showHint({ hint: CodeMirror.hint["protocol-ml"] });
});

let currentSVG = '';

function render() {
    const code = editor.getValue();
    try {
        const diagram = parse(code);
        currentSVG = renderSVG(diagram);
        preview.innerHTML = `<div class="protocol-ml-wrapper">${currentSVG}</div>`;
    } catch (err) {
        preview.innerHTML = `<div class="error">Error: ${err.message}</div>`;
        currentSVG = '';
    }
}

// Debounce rendering for performance
let renderTimeout;
editor.on('change', () => {
    clearTimeout(renderTimeout);
    renderTimeout = setTimeout(render, 300);
});

copyCodeBtn.addEventListener('click', async () => {
    try {
        await navigator.clipboard.writeText(editor.getValue());
        copyCodeBtn.textContent = 'Copied!';
        copyCodeBtn.classList.add('copied');
        setTimeout(() => {
            copyCodeBtn.textContent = 'Copy Code';
            copyCodeBtn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
});

copyPNGBtn.addEventListener('click', async () => {
    if (!currentSVG) return;
    try {
        const svgElement = preview.querySelector('svg');
        if (!svgElement) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svgData = new XMLSerializer().serializeToString(svgElement);

        canvas.width = svgElement.width.baseVal.value;
        canvas.height = svgElement.height.baseVal.value;

        const img = new Image();
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = async () => {
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            canvas.toBlob(async (blob) => {
                try {
                    await navigator.clipboard.write([
                        new ClipboardItem({ 'image/png': blob })
                    ]);
                    copyPNGBtn.textContent = 'Copied!';
                    copyPNGBtn.classList.add('copied');
                    setTimeout(() => {
                        copyPNGBtn.textContent = 'Copy PNG';
                        copyPNGBtn.classList.remove('copied');
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy PNG:', err);
                    copyPNGBtn.textContent = 'Failed';
                    setTimeout(() => {
                        copyPNGBtn.textContent = 'Copy PNG';
                    }, 2000);
                }
            }, 'image/png');
        };

        img.onerror = () => {
            console.error('Failed to load SVG');
            URL.revokeObjectURL(url);
        };

        img.src = url;
    } catch (err) {
        console.error('Failed to copy PNG:', err);
    }
});

copySVGBtn.addEventListener('click', async () => {
    if (!currentSVG) return;
    try {
        await navigator.clipboard.writeText(currentSVG);
        copySVGBtn.textContent = 'Copied!';
        copySVGBtn.classList.add('copied');
        setTimeout(() => {
            copySVGBtn.textContent = 'Copy SVG';
            copySVGBtn.classList.remove('copied');
        }, 2000);
    } catch (err) {
        console.error('Failed to copy:', err);
    }
});

// Initial render
render();
renderReference();

initResizer(resizerRef, panelRef, panelEditor, true);
initResizer(resizerPreview, panelEditor, panelPreview, false);
