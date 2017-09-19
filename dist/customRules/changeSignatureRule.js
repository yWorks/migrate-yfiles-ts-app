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
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.applyWithProgram = function (sourceFile, program) {
        return this.applyWithWalker(new ChangeSignatureWalker(sourceFile, this.getOptions(), program));
    };
    return Rule;
}(Lint.Rules.TypedRule));
exports.Rule = Rule;
var ChangeSignatureWalker = /** @class */ (function (_super) {
    __extends(ChangeSignatureWalker, _super);
    function ChangeSignatureWalker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.configEntryName = "signatureChanges";
        return _this;
    }
    ChangeSignatureWalker.prototype.checkForChanges = function (node, oldParentName, oldMemberName, guess) {
        if (node.parent.kind !== ts.SyntaxKind.CallExpression
            && node.parent.kind !== ts.SyntaxKind.NewExpression
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
        var signatureChanges = changes_1.changes[this.configEntryName][oldParentName] && changes_1.changes[this.configEntryName][oldParentName][oldMemberName];
        if (signatureChanges) {
            var checker = this.getTypeChecker();
            var oldSignature_1, start = void 0, width = void 0;
            if (node.kind === ts.SyntaxKind.MethodDeclaration) {
                var signatureDeclaration = checker.getSignatureFromDeclaration(node).declaration;
                if (!signatureDeclaration)
                    return;
                oldSignature_1 = signatureDeclaration.parameters
                    .map(function (parameter) { return parameter.name.getText(); });
                start = node.name.getStart();
                width = node.name.getWidth();
            }
            else {
                var signature = checker.getResolvedSignature(node.parent);
                if (!signature)
                    return;
                oldSignature_1 = signature.parameters
                    .map(function (parameter) { return parameter.getName(); });
                start = node.getEnd();
                width = node.parent.getEnd() - start;
            }
            var newSignature = signatureChanges
                .map(function (oldIndexOrNewName) { return typeof oldIndexOrNewName === "number" ? oldSignature_1[oldIndexOrNewName] : oldIndexOrNewName; });
            var failure = void 0;
            if (guess) {
                failure = "The signature of this method might have changed (assuming this is a member of \"" + oldParentName + "\", inferred type is \"any\")";
            }
            else {
                if (isCallOrApply) {
                    failure = "The signature of \"" + oldParentName + "#" + oldMemberName + "\" has changed";
                }
                else {
                    failure = "The signature of \"" + oldParentName + "#" + oldMemberName + "\" has been changed from (" + oldSignature_1.join(", ") + ") to (" + newSignature.join(", ") + ")";
                }
            }
            this.addFailureAt(start, width, failure);
        }
    };
    return ChangeSignatureWalker;
}(memberRuleWalker_1.MemberRuleWalker));
//# sourceMappingURL=changeSignatureRule.js.map