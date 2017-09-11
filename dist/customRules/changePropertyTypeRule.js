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
        _this.configEntryName = "propertyTypeChanges";
        return _this;
    }
    ChangeReturnTypeWalker.prototype.checkForChanges = function (node, oldParentName, oldMemberName, guess) {
        if (node.kind !== ts.SyntaxKind.SetAccessor
            && node.kind !== ts.SyntaxKind.GetAccessor
            && node.kind !== ts.SyntaxKind.PropertyAccessExpression
            && node.kind !== ts.SyntaxKind.ElementAccessExpression) {
            return;
        }
        var newType = changes_1.changes[this.configEntryName][oldParentName] && changes_1.changes[this.configEntryName][oldParentName][oldMemberName];
        if (newType) {
            var checker = this.getTypeChecker();
            var oldType = void 0;
            if (node.kind === ts.SyntaxKind.GetAccessor) {
                var signature = checker.getSignatureFromDeclaration(node);
                if (!signature)
                    return;
                oldType = util_1.getFullyQualifiedName(signature.getReturnType(), checker);
            }
            else {
                oldType = util_1.getFullyQualifiedName(checker.getTypeAtLocation(node), checker);
            }
            this.addFailureAtNode(node, "The type of property \"" + oldParentName + "#" + oldMemberName + "\" has changed from \"" + oldType + "\" to \"" + newType + "\"");
        }
    };
    return ChangeReturnTypeWalker;
}(memberRuleWalker_1.MemberRuleWalker));
//# sourceMappingURL=changePropertyTypeRule.js.map