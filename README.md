lecture-slides.js: syntax highlighting plugin
=============================================

Description
-----------

This plugin adds the ability to have source code examples with syntax
highlighting to `lecture-slides.js`. Thanks to `highlight.js` examples
can use almost any programming language without much effort.

![Screenshot](screenshot.png)

Installation
------------

 1. Add this plugin to your presentation:
    `$ yarn add --dev ls-plugin-highlight.js`
 2. Import it in the `index.js` file
 3. Import one of the [stylesheets that come with highlight.js](https://highlightjs.org/static/demo/)
 4. Use the HTML tags below in your presentation

Example for `index.js`:

```javascript
"use strict";

import SlideshowPlayer from "lecture-slides.js";
import LsPluginHighlightJs from "ls-plugin-highlight.js";
import "./node_modules/highlight.js/styles/atom-one-light.css";

window.addEventListener("load", () => {
    let player = new SlideshowPlayer({
        plugins: {
            HighlightJs: new LsPluginHighlightJs(),
        }
    });

    player.start();
});
```

Usage
-----

  * `<source-code language="...">` for complete code blocks
  * `<src-code language="...">` for inline code snippets

For example like in the screenshot above:

```html
<article>
    <source-code language="python">
    def main():
        """
        Main procedure of this example program.
        """
        pass

    if __name__ == "__main__":
        main()
    </source-code>

    <p>
        Here you can see, how a python module can check whether it is merely
        imported or run as a program. When run as a program,
        <src-code language="python">__name__ == "__main__"</src-code>
        will be <src-code language="python">true</src-code> and the
        <src-code language="python">main()</src-code>-function will be called.
    </p>
</article>
```

Copyright
---------

lecture-slides.js: https://www.github.com/DennisSchulmeister/lecture-slides.js <br/>
This plugin: https://github.com/DennisSchulmeister/ls-plugin-highlight.js <br/>
© 2017  Dennis Schulmeister-Zimolong <dennis@pingu-mail.de>

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.
