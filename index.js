/*
 * ls-plugin-highlight.js (https://www.buzzlms.de)
 * © 2017  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 * License of this file: AGPL 3.0+
 */
"use strict";

import $ from "jquery";
import hljs from "highlight.js";

/**
 * This is a simple HTML plugin for lecture-slides.js. It adds two new HTML
 * tags to create syntax highlighted code examples with highlight.js. Usage:
 *
 *   * `<source-code language="...">` for complete code blocks
 *   *`<src-code language="...">` for inline code snippets
 */
class LsPluginHighlightJs {
    /**
     * This function replaces all custom HTML tags with standard ones.
     * @param {Element} html DOM node with the slide definitions
     * @param {Object} utils Utility functions from lecture-slides.js
     */
    preprocessHtml(html, utils) {
        let jqHtml = $(html);
        let sourceCodeElements = jqHtml.find("source-code, src-code");

        sourceCodeElements.each(index => {
            let element = $(sourceCodeElements[index]);
            let language = element.attr("language") || "";
            let filename = element.attr("filename") || "";

            let code = element.text();
            code = utils.trimLines(code);
            code = utils.shiftLinesLeft(code);
            code = utils.removeLeadingLinebreaks(code);
            code = utils.removeTrailingLinebreaks(code);

            let result = { value: code };

            try {
                if (language != "") result = hljs.highlight(language, code, true);
                else result = hljs.highlightAuto(code);
            } catch(error) {
                console.warn("ls-plugin-highlight.js:", error);
            }

            switch (element[0].nodeName) {
                case "SOURCE-CODE":
                    // Block level element
                    element.replaceWith($.parseHTML(`<pre class="code" data-lang="${filename}"><code>${result.value}</code></pre>`));
                    break;
                case "SRC-CODE":
                    // Inline element
                    element.replaceWith($.parseHTML(`<code data-bind="html: highlighted">${result.value}</code>`));
                    break;
            }
        });
    }
}

export default LsPluginHighlightJs;
