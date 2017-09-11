"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var Lint = require("tslint");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.applyWithProgram = function (sourceFile, program) {
        return this.applyWithWalker(new DetectYfilesClassConstructsWalker(sourceFile, this.getOptions(), program));
    };
    return Rule;
}(Lint.Rules.TypedRule));
exports.Rule = Rule;
var DetectYfilesClassConstructsWalker = /** @class */ (function (_super) {
    __extends(DetectYfilesClassConstructsWalker, _super);
    function DetectYfilesClassConstructsWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    DetectYfilesClassConstructsWalker.prototype.visitPropertyAccessExpression = function (node) {
        var object = node.expression.getText();
        var property = node.name.getText();
        if ((object.indexOf("yfiles") >= 0 // allow stuff like (yfiles as any).lang.Class
            && (property === "ClassDefinition" || property === "InterfaceDefinition" || property === "StructDefinition"))
            || (object.indexOf("yfiles") >= 0 && object.indexOf("lang") >= 0
                && (property === "Class" || property === "Interface" || property === "Struct"))) {
            this.addFailureAtNode(node, "It is now possible for TypeScript classes to extend directly from yFiles classes. " +
                "Please refer to http://docs.yworks.com/yfileshtml/#/dguide/framework_basic_interfaces#framework_complex_inheritance.");
        }
        _super.prototype.visitPropertyAccessExpression.call(this, node);
    };
    return DetectYfilesClassConstructsWalker;
}(Lint.ProgramAwareRuleWalker));
//# sourceMappingURL=detectYfilesClassConstructsRule.js.map