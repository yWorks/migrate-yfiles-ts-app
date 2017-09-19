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
var memberRuleWalker_1 = require("./memberRuleWalker");
var util_1 = require("./util");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Rule.prototype.applyWithProgram = function (sourceFile, program) {
        return this.applyWithWalker(new MemberRemovedWalker(sourceFile, this.getOptions(), program));
    };
    return Rule;
}(Lint.Rules.TypedRule));
exports.Rule = Rule;
var MemberRemovedWalker = /** @class */ (function (_super) {
    __extends(MemberRemovedWalker, _super);
    function MemberRemovedWalker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.configEntryName = "removedMembers";
        return _this;
    }
    MemberRemovedWalker.prototype.checkForChanges = function (node, oldParentName, oldMemberName, guess) {
        var removed = changes_1.changes[this.configEntryName][oldParentName]
            && changes_1.changes[this.configEntryName][oldParentName].indexOf(oldMemberName) >= 0;
        if (removed) {
            if (guess) {
                this.addFailureAtNode(util_1.nameNodeFromNode(node), "This member might have been removed (assuming it is a member of type \"" + oldParentName + "\", inferred type is \"any\")");
            }
            else {
                this.addFailureAtNode(util_1.nameNodeFromNode(node), "\"" + oldParentName + "#" + oldMemberName + "\" has been removed");
            }
        }
    };
    return MemberRemovedWalker;
}(memberRuleWalker_1.MemberRuleWalker));
//# sourceMappingURL=memberRemovedRule.js.map