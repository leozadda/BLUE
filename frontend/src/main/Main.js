"use strict";
exports.__esModule = true;
require("./Main.css");
var pigs = require('./pigs.png');
var head = require('./head.png');
var devil = require('./devil.png');
var react_router_dom_1 = require("react-router-dom");
var React = require("react");
function Land() {
    return (React.createElement("div", { id: "mainer", className: "mainer" },
        React.createElement("div", { className: "topbar" },
            React.createElement("p", null, "Free for a week. Invest in yourself.")),
        React.createElement("div", { className: "logo" },
            React.createElement(react_router_dom_1.Link, { to: "login" },
                React.createElement("h1", { id: "logo" }, "B-L-U-E"))),
        React.createElement("div", { className: "start" },
            React.createElement("div", { className: "start-child" },
                React.createElement("h1", null, "look the same as last year?"),
                React.createElement("ul", null,
                    React.createElement("li", null, "- Lifts aren't going up anymore."),
                    React.createElement("li", null, "- Bulked, but still look skinny."),
                    React.createElement("li", null, "- Look average with a shirt on."),
                   )),
            React.createElement("div", { className: "start-img" },
                React.createElement("img", { src: devil }))),
        React.createElement("div", { className: "conflict" },
            React.createElement("div", { className: "conflict-img" },
                React.createElement("img", { src: pigs })),
            React.createElement("div", { className: "conflict-child" },
                React.createElement("h1", null, "WE BUILT THE SOLUTION."),
                React.createElement("ul", null,
                    React.createElement("li", null, "- Macros, exercises, and muscle volume tracked for you."),
                    
                    React.createElement("li", null, "- Made for advanced lifters, not beginners."),
                    React.createElement("li", null, "- Simple metrics show what to fix."),
                )
                )),

        React.createElement("div", { className: "solution" },
            React.createElement("div", { className: "solution-child" },
                React.createElement("h1", null, "JOIN OUR APP."),
                React.createElement("ul", null,
                    React.createElement("li", null, "- It's free for a week."),
                    React.createElement("li", null, "- $9.99 a month."),
                ),

                React.createElement(react_router_dom_1.Link, { to: "signup" },
                    React.createElement("button", { id: "free" }, "try for free"))),
            React.createElement("div", { className: "solution-img" },
                React.createElement("img", { src: head }))),
        React.createElement("div", { className: "footer" },
            React.createElement("div", { className: 'footer-child' },
                React.createElement("h1", null, "Contact us"),
                React.createElement("h1", null, "Privacy policy"),
                React.createElement("h1", null, "Terms of Use")),
            React.createElement("h2", null, "\u00A9 2023 B-l-u-e. All rights reserved."))));
}
exports["default"] = Land;
