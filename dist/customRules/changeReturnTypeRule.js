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
        return this.applyWithWalker(new ChangeReturnTypeWalker(sourceFile, this.getOptions(), program));
    };
    return Rule;
}(Lint.Rules.TypedRule));
exports.Rule = Rule;
var ChangeReturnTypeWalker = /** @class */ (function (_super) {
    __extends(ChangeReturnTypeWalker, _super);
    function ChangeReturnTypeWalker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.configEntryName = "returnTypeChanges";
        return _this;
    }
    ChangeReturnTypeWalker.prototype.checkForChanges = function (node, oldParentName, oldMemberName, guess) {
        if (node.parent.kind !== ts.SyntaxKind.CallExpression
            && node.kind !== ts.SyntaxKind.MethodDeclaration) {
            return;
        }
        var isCallOrApply;
        if (oldMemberName === "call" || oldMemberName === "apply") {
            isCallOrApply = true;
            var lastDot = oldParentName.lastIndexOf(".");
            oldMemberName = oldParentName.substring(lastDot + 1);
            oldParentName = oldParentName.substring(0, lastDot);
        }
        var newReturnType = changes_1.changes[this.configEntryName][oldParentName] && changes_1.changes[this.configEntryName][oldParentName][oldMemberName];
        if (newReturnType) {
            var checker = this.getTypeChecker();
            var oldSignature = void 0, targetNode = void 0;
            if (node.kind === ts.SyntaxKind.MethodDeclaration) {
                oldSignature = checker.getSignatureFromDeclaration(node);
                targetNode = node;
            }
            else {
                oldSignature = checker.getResolvedSignature(node.parent);
                targetNode = node.parent;
            }
            if (!oldSignature)
                return;
            var oldReturnType = util_1.getFullyQualifiedName(checker.getReturnTypeOfSignature(oldSignature), checker);
            if (isCallOrApply) {
                this.addFailureAtNode(targetNode, "The return type of \"" + oldParentName + "#" + oldMemberName + "\" has changed to \"" + newReturnType + "\"");
            }
            else {
                this.addFailureAtNode(targetNode, "The return type of \"" + oldParentName + "#" + oldMemberName + "\" has changed from \"" + oldReturnType + "\" to \"" + newReturnType + "\"");
            }
        }
    };
    return ChangeReturnTypeWalker;
}(memberRuleWalker_1.MemberRuleWalker));
//# sourceMappingURL=changeReturnTypeRule.js.map