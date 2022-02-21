/*
 * ls-plugin-highlight.js (https://www.wpvs.de)
 * © 2017 – 2022  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>
 * License of this file: BSD 2-clause
 */
"use strict";

import hljs from "highlight.js";
import { removeSurroundingWhitespace } from "@dschulmeis/ls-utils/string_utils.js";

/**
 * This is a simple HTML plugin for `@dschulmeis/lecture-slides.js` and
 * `@dschulmeis/mini-tutorial.js`. It adds two new HTML tags to create syntax
 * highlighted code examples with highlight.js. Usage:
 *
 *   * `<source-code language="...">` for complete code blocks
 *   * `<src-code language="...">` for inline code snippets
 *
 * The constructor takes an optional configuration object that can be used
 * to define the supported languages and change the highlight.js settings:
 *
 *   ```javascript
 *   import HLJS_Language_XML from 'highlight.js/lib/languages/xml';
 *   import "highlight.js/styles/atom-one-light.css";
 *
 *   let plugin = new LS_Plugin_HighlightJS({
 *       // Supported languages
 *       languages: {
 *           "xml": HLJS_Language_XML,
 *       },
 *
 *       // Highlight.js configuration, see highlight.js method configure()
 *       highlightjs: {
 *       },
 *
 *       // Automatically highlight all <pre><code> elemenets (default: false)
 *       highlightAll: true,
 *   });
 *   ```
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
        this._config.languages = this._config.languages || {};
        this._config.highlightJs = this._config.highlightJs || {ignoreUnescapedHTML: true};
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
                let language = element.getAttribute("language") || "";
                let classname = language ? `language-${language}` : "";

                let code = removeSurroundingWhitespace(element.innerHTML);
                let newElement = null;
                let codeElement = null;

                if (element.nodeName === "SOURCE-CODE") {
                    // Block level element
                    newElement = document.createElement("pre");
                    newElement.classList.add("code");

                    codeElement = document.createElement("code");
                    codeElement.classList.add(classname);
                    codeElement.innerHTML = code;

                    newElement.append(codeElement);
                } else if (element.nodeName === "SRC-CODE") {
                    // Inline element
                    newElement = codeElement = document.createElement("code");
                    codeElement.classList.add(classname);
                    codeElement.innerHTML = code;
                }

                hljs.highlightElement(codeElement);
                element.replaceWith(newElement);
            } catch(error) {
                console.warn("@dschulmeis/ls-plugin-highlight.js:", error);
            }
        }
    }
}
