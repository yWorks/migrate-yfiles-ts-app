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
var util_1 = require("./util");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.applyWithProgram = function (sourceFile, program) {
        return this.applyWithWalker(new MemberRenameWalker(sourceFile, this.getOptions(), program));
    };
    return Rule;
}(Lint.Rules.TypedRule));
exports.Rule = Rule;
var MemberRenameWalker = /** @class */ (function (_super) {
    __extends(MemberRenameWalker, _super);
    function MemberRenameWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MemberRenameWalker.prototype.visitNewExpression = function (node) {
        var namedConstructorExpression = node.expression;
        if (namedConstructorExpression.kind !== ts.SyntaxKind.PropertyAccessExpression) {
            return;
        }
        var namedConstructor = namedConstructorExpression;
        var typeExpression = namedConstructor.expression;
        var checker = this.getTypeChecker();
        var typeSymbol = checker.getSymbolAtLocation(typeExpression);
        if (!typeSymbol)
            return;
        var typeExpressionType = checker.getFullyQualifiedName(typeSymbol);
        var signature = checker.getResolvedSignature(node);
        if (!signature)
            return;
        var namedConstructorSymbol = checker.getReturnTypeOfSignature(signature).getSymbol();
        if (!namedConstructorSymbol)
            return;
        var namedConstructorType = checker.getFullyQualifiedName(namedConstructorSymbol);
        if (typeExpressionType === namedConstructorType) {
            var start = namedConstructor.name.getStart() - 1;
            var width = namedConstructor.name.getWidth() + 1;
            var fix = void 0;
            if (util_1.shouldFix(this.getOptions())) {
                fix = new Lint.Replacement(start, width, "");
            }
            var parts = namedConstructor.getText().split(".");
            this.addFailureAt(start, width, (fix ? "(fixed) " : "") + "Named constructors have been replaced by overloaded constructors."
                + (fix ? "" : " Simply remove the \"." + parts[parts.length - 1] + "\"."), fix);
        }
        _super.prototype.visitNewExpression.call(this, node);
    };
    return MemberRenameWalker;
}(Lint.ProgramAwareRuleWalker));
//# sourceMappingURL=namedConstructorsRule.js.map