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
var changes_1 = require("../changes");
var namespaceRuleWalker_1 = require("./namespaceRuleWalker");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.applyWithProgram = function (sourceFile, program) {
        return this.applyWithWalker(new ChangeNamespaceWalker(sourceFile, this.getOptions(), program));
    };
    return Rule;
}(Lint.Rules.TypedRule));
exports.Rule = Rule;
var ChangeNamespaceWalker = /** @class */ (function (_super) {
    __extends(ChangeNamespaceWalker, _super);
    function ChangeNamespaceWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ChangeNamespaceWalker.prototype.checkNamespace = function (node, oldNamespace) {
        var newNamespace = changes_1.changes["namespaceChanges"] && changes_1.changes["namespaceChanges"][oldNamespace];
        if (newNamespace) {
            var fix = new Lint.Replacement(node.getStart(), node.getWidth(), newNamespace);
            this.addFailureAtNode(node, "The namespace of \"" + oldNamespace + "\" has changed to \"" + newNamespace + "\"", fix);
        }
    };
    return ChangeNamespaceWalker;
}(namespaceRuleWalker_1.NamespaceRuleWalker));
//# sourceMappingURL=changeNamespaceRule.js.map