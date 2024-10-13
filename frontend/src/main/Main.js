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
            React.createElement("p", null, "Our product is free. Invest in yourself.")),
        React.createElement("div", { className: "logo" },
            React.createElement(react_router_dom_1.Link, { to: "login" },
                React.createElement("h1", { id: "logo" }, "B-L-U-E"))),
        React.createElement("div", { className: "start" },
            React.createElement("div", { className: "start-child" },
                React.createElement("h1", null, "Fitness is Hard."),
                React.createElement("ul", null,
                    React.createElement("li", null,
                        React.createElement("a", { href: "https://www.thelancet.com/action/showPdf?pii=S0140-6736%2819%2930041-8" }, "11 million deaths related to diet.")),
                    React.createElement("li", null,
                        React.createElement("a", { href: "https://stacks.cdc.gov/view/cdc/106273" }, "40% of Americans are obese.")),
                    React.createElement("li", null,
                        React.createElement("a", { href: "https://pubmed.ncbi.nlm.nih.gov/35584732/#:~:text=The%20age%2Dstandardized%20prevalence%20of,with%20the%20most%20obese%20residents." }, "Obesity is increasing.")))),
            React.createElement("div", { className: "start-img" },
                React.createElement("img", { src: devil }))),
        React.createElement("div", { className: "conflict" },
            React.createElement("div", { className: "conflict-img" },
                React.createElement("img", { src: pigs })),
            React.createElement("div", { className: "conflict-child" },
                React.createElement("h1", null, "But not impossible."),
                React.createElement("ul", null,
                    React.createElement("li", null, "Don't waste your potential."),
                    React.createElement("li", null, "Don't be a statistic."),
                    React.createElement("li", null, "Don't be a victim.")))),
        React.createElement("div", { className: "solution" },
            React.createElement("div", { className: "solution-child" },
                React.createElement("h1", null, "We can help you."),
                React.createElement("ul", null,
                    React.createElement("li", null, "We track your diet."),
                    React.createElement("li", null, "We tell you what to eat."),
                    React.createElement("li", null, "Possible with software.")),
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
