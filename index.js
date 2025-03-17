/*
 * ls-plugin-highlight.js (https://www.wpvs.de)
 * © 2017 – 2025  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 * License of this file: BSD 2-clause
 */
import hljs                            from "highlight.js/lib/core";
import { determineLinebreaks }         from "@dschulmeis/ls-utils/string_utils.js";
import { removeSurroundingWhitespace } from "@dschulmeis/ls-utils/string_utils.js";
import { copyAttributes }              from "@dschulmeis/ls-utils/dom_utils.js";
import "./style.css";

/**
 * This is a simple HTML plugin for `@dschulmeis/lecture-slides.js` and
 * `@dschulmeis/mini-tutorial.js`. It adds two new HTML tags to create syntax
 * highlighted code examples with highlight.js. See [README.md](README.md)
 * for usage details.
 *
 * Please note, that by default no languages are available unless they are
 * explicitly imported like shown above. This is intentional to keep the
 * download size small.
 */
export default class LS_Plugin_HighlightJS {
    /**
     * Constructor to configure the plugin.
     * @param {Object} config Configuration values
     */
    constructor(config) {
        // Interpret configuration values
        this._config = config || {};
        this._config.languages    = this._config.languages || {};
        this._config.highlightJs  = this._config.highlightJs || {ignoreUnescapedHTML: true};
        this._config.highlightAll = this._config.highlightAll || false;

        // Configure highlight.js and register languages
        if (this._config.highlightJs) {
            hljs.configure(this._config.highlightJs);
        }

        for (let name in this._config.languages) {
            let language = this._config.languages[name];
            hljs.registerLanguage(name, language);
        }
    }

    /**
     * This function replaces all custom HTML tags with standard ones.
     * @param {Element} html DOM node with the slide definitions
     */
    preprocessHtml(html) {
        // Highlight all <pre><code>
        if (this._config.highlightAll) {
            let codeElements = html.querySelectorAll("pre code");

            for (let element of codeElements) {
                try {
                    element.innerHTML = removeSurroundingWhitespace(element.innerHTML);
                    hljs.highlightElement(element);
                } catch(error) {
                    console.warn("@dschulmeis/ls-plugin-highlight.js:", error);
                }
            }
        }

        // Replace custom elements <source-code> and <src-code>
        let sourceCodeElements = html.querySelectorAll("source-code, src-code");

        for (let element of sourceCodeElements) {
            try {
                let language  = element.getAttribute("language") || "";
                let classname = language ? `language-${language}` : "";

                let code        = removeSurroundingWhitespace(element.innerHTML);
                let newElement  = null;
                let codeElement = null;

                if (element.nodeName === "SOURCE-CODE") {
                    // Block level element
                    newElement = document.createElement("pre");
                    copyAttributes(element, newElement);
                    newElement.classList.add("code");

                    codeElement = document.createElement("code");
                    if (classname) codeElement.classList.add(classname);
                    codeElement.innerHTML = code;

                    newElement.append(codeElement);
                } else if (element.nodeName === "SRC-CODE") {
                    // Inline element
                    newElement = codeElement = document.createElement("code");
                    copyAttributes(element, newElement);
                    if (classname) codeElement.classList.add(classname);
                    codeElement.innerHTML = code;
                }

                hljs.highlightElement(codeElement);
                element.replaceWith(newElement);

                if (element.nodeName === "SOURCE-CODE") {
                    this._mixinHighlightedLines(newElement);
                }
            } catch(error) {
                console.warn("@dschulmeis/ls-plugin-highlight.js:", error);
            }
        }
    }

    /**
     * Add functionality to highlight single lines or line ranges, to be able to better
     * explain individual code blocks. This method interprets the HTML attribute `highlight`,
     * which may contain a comma-separated list of line numbers and line ranges, e.g.:
     * 
     * `1, 3, [7, 9]`
     * 
     * This would highlight the lines 1, 3, and 7 to 9. Additionaly, a method called 
     * `highlightLines` is added to the HTML element, which takes a single array of the
     * same format to change the highlighting at runtime.
     * 
     * @param{Element} newElement New HTML element
     */
    _mixinHighlightedLines(newElement) {
        // Wrap all source-lines with <span class="hljs-line"></span> to be able
        // to highlight them, if needed
        let codeElement = newElement.querySelector("code");
        let innerHTML   = codeElement.innerHTML;
        let linebreak   = determineLinebreaks(innerHTML);
        let lines       = linebreak ? innerHTML.split(linebreak) : [innerHTML];

        if (!lines[lines.length - 1].trim()) lines = lines.slice(0, -1);

        for (let i in lines) {
            lines[i] = `<span class="hljs-line">${lines[i] || " "}</span>`;
        }

        codeElement.innerHTML = lines.join(linebreak || "\n");

        // Add method to highlight lines via JavaScript
        newElement.highlightLines = highlightLines.bind(newElement);

        // Add `lines` property with the number of lines
        newElement.lines = lines.length;

        // Apply highlighed lines, if the highligt attribute is set
        let highlight = newElement.getAttribute("highlight");
        if (highlight) newElement.highlightLines(JSON.parse(`[${highlight}]`));
    }
}

/**
 * This function will be added as a bound method to the new HTML element, to
 * allow highlighting lines at runtime. In JavaScript the source code element
 * can be found e.g. via its ID and then this method can be called, to change
 * the currently highlighted lines.
 * 
 * The array may contain single line numbers (as numbers) and line ranges (
 * as nested arrays). To clear the highlighting simply call this method with
 * a missing or empty array.
 * 
 * @param {Array} highlight Line numbers and ranges to highlight
 */
function highlightLines(highlights) {
    let lineElements = this.querySelectorAll(".hljs-line");

    for (let lineElement of lineElements) {
        lineElement.classList.remove("hljs-highlighted");
    }

    if (!Array.isArray(highlights)) highlights = [highlights];

    for (let highlight of highlights || []) {
        let range = Array.isArray(highlight) ? highlight : [highlight, highlight];
        if (range.length < 2) range = [range[0], range[0]];

        for (let i = range[0]; i <= range[1]; i++) {
            let lineElement = lineElements[i - 1];
            if (!lineElement) break;
            lineElement.classList.add("hljs-highlighted");
        }
    }
}
