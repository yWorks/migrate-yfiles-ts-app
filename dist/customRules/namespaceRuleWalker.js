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
var NamespaceRuleWalker = /** @class */ (function (_super) {
    __extends(NamespaceRuleWalker, _super);
    function NamespaceRuleWalker() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    NamespaceRuleWalker.prototype.visitPropertyAccessExpression = function (node) {
        this.checkNamespace(node, node.getText());
        _super.prototype.visitPropertyAccessExpression.call(this, node);
    };
    NamespaceRuleWalker.prototype.visitTypeReference = function (node) {
        this.checkNamespace(node, node.getText());
        _super.prototype.visitTypeReference.call(this, node);
    };
    return NamespaceRuleWalker;
}(Lint.ProgramAwareRuleWalker));
exports.NamespaceRuleWalker = NamespaceRuleWalker;
//# sourceMappingURL=namespaceRuleWalker.js.map