"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var app = (0, express_1.default)();
var port = process.env.PORT || 3000;
app.listen(port, function () {
    console.log("Server running at http://localhost:".concat(port));
});
exports.default = app;
