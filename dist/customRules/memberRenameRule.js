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
        return this.applyWithWalker(new MemberRenameWalker(sourceFile, this.getOptions(), program));
    };
    return Rule;
}(Lint.Rules.TypedRule));
exports.Rule = Rule;
var MemberRenameWalker = /** @class */ (function (_super) {
    __extends(MemberRenameWalker, _super);
    function MemberRenameWalker() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.configEntryName = "memberRenamings";
        return _this;
    }
    MemberRenameWalker.prototype.checkForChanges = function (node, oldParentName, oldMemberName, guess) {
        var newName = changes_1.changes[this.configEntryName][oldParentName] && changes_1.changes[this.configEntryName][oldParentName][oldMemberName];
        if (newName) {
            var targetNode = util_1.nameNodeFromNode(node);
            if (guess) {
                this.addFailureAtNode(targetNode, "This member might have been renamed to \"" + newName + "\" (assuming it is a member of type \"" + oldParentName + "\", inferred type is \"any\")");
            }
            else {
                var fix = void 0;
                if (util_1.shouldFix(this.getOptions())) {
                    fix = new Lint.Replacement(targetNode.getStart(), targetNode.getWidth(), newName);
                }
                this.addFailureAtNode(targetNode, (fix ? "(fixed) " : "") + "\"" + oldParentName + "#" + oldMemberName + "\" has been renamed to \"" + newName + "\"", fix);
            }
        }
    };
    return MemberRenameWalker;
}(memberRuleWalker_1.MemberRuleWalker));
//# sourceMappingURL=memberRenameRule.js.map