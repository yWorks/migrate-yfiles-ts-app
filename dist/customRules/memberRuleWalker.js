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
var changes_1 = require("../changes");
var MemberRuleWalker = /** @class */ (function (_super) {
    __extends(MemberRuleWalker, _super);
    function MemberRuleWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MemberRuleWalker.prototype.visitElementAccessExpression = function (node) {
        var argumentExpression = node.argumentExpression;
        if (argumentExpression.kind === ts.SyntaxKind.StringLiteral) {
            var text = argumentExpression.getText();
            var oldName = text.substring(1, text.length - 1);
            // check instance members
            this.checkMemberNode(node, node.expression, oldName);
            // check static members
            this.checkForChanges(node, node.expression.getText(), oldName, false);
        }
        _super.prototype.visitElementAccessExpression.call(this, node);
    };
    MemberRuleWalker.prototype.visitPropertyAccessExpression = function (node) {
        var oldName = node.name.getText();
        // check instance members
        this.checkMemberNode(node, node.expression, oldName);
        // check static members
        this.checkForChanges(node, node.expression.getText(), oldName, false);
        _super.prototype.visitPropertyAccessExpression.call(this, node);
    };
    MemberRuleWalker.prototype.visitMethodDeclaration = function (node) {
        this.checkInheritedMember(node);
        _super.prototype.visitMethodDeclaration.call(this, node);
    };
    MemberRuleWalker.prototype.visitPropertyDeclaration = function (node) {
        this.checkInheritedMember(node);
        _super.prototype.visitPropertyDeclaration.call(this, node);
    };
    MemberRuleWalker.prototype.visitGetAccessor = function (node) {
        this.checkInheritedMember(node);
        _super.prototype.visitGetAccessor.call(this, node);
    };
    MemberRuleWalker.prototype.visitSetAccessor = function (node) {
        this.checkInheritedMember(node);
        _super.prototype.visitSetAccessor.call(this, node);
    };
    MemberRuleWalker.prototype.checkInheritedMember = function (node) {
        var _this = this;
        var oldName = node.name.getText();
        if (node.parent.kind === ts.SyntaxKind.ClassDeclaration) {
            var classDeclaration = node.parent;
            if (!classDeclaration.heritageClauses) {
                return;
            }
            classDeclaration.heritageClauses.forEach(function (heritageClause) {
                if (!heritageClause.types) {
                    return;
                }
                heritageClause.types.forEach(function (typeNode) {
                    _this.checkMemberNode(node, typeNode, oldName);
                });
            });
        }
    };
    MemberRuleWalker.prototype.checkMemberNode = function (node, typeNode, oldName) {
        var checker = this.getTypeChecker();
        var type = util_1.getFullyQualifiedName(checker.getTypeAtLocation(typeNode), checker);
        var guess;
        if (type === "any") {
            guess = true;
            type = util_1.guessTypeForMember(oldName, changes_1.changes[this.configEntryName]);
        }
        this.checkForChanges(node, type, oldName, guess);
    };
    return MemberRuleWalker;
}(Lint.ProgramAwareRuleWalker));
exports.MemberRuleWalker = MemberRuleWalker;
//# sourceMappingURL=memberRuleWalker.js.map