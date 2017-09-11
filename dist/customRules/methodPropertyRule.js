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
var ts = require("typescript");
var Lint = require("tslint");
var changes_1 = require("../changes");
var memberRuleWalker_1 = require("./memberRuleWalker");
var util_1 = require("./util");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.applyWithProgram = function (sourceFile, program) {
        return this.applyWithWalker(new MethodPropertyWalker(sourceFile, this.getOptions(), program));
    };
    return Rule;
}(Lint.Rules.TypedRule));
exports.Rule = Rule;
var MethodPropertyWalker = /** @class */ (function (_super) {
    __extends(MethodPropertyWalker, _super);
    function MethodPropertyWalker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.configEntryName = "methodsProperties";
        return _this;
    }
    MethodPropertyWalker.prototype.checkForChanges = function (node, oldParentName, oldMemberName, guess) {
        var newKind = changes_1.changes[this.configEntryName][oldParentName] && changes_1.changes[this.configEntryName][oldParentName][oldMemberName];
        if (newKind) {
            // the only fix we can safely perform is to transform a "getter function" invocation into a property access (remove
            // the parentheses)
            var fix = void 0;
            if (newKind === "property" && node.parent.kind === ts.SyntaxKind.CallExpression) {
                var signature = this.getTypeChecker().getResolvedSignature(node.parent);
                if (signature && signature.getParameters().length === 0) {
                    fix = new Lint.Replacement(node.parent.getEnd() - 2, 2, "");
                }
            }
            this.addFailureAtNode(util_1.nameNodeFromNode(node), "\"" + oldParentName + "#" + oldMemberName + "\" is now a " + newKind, fix);
        }
    };
    return MethodPropertyWalker;
}(memberRuleWalker_1.MemberRuleWalker));
//# sourceMappingURL=methodPropertyRule.js.map