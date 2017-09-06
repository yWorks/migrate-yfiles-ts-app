import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {MemberRuleWalker} from "./memberRuleWalker";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new MemberRenameWalker(sourceFile, this.getOptions(), program));
  }
}

class MemberRenameWalker extends MemberRuleWalker {
  protected checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string) {
    const newName = changes["memberRenamings"][oldParentName] && changes["memberRenamings"][oldParentName][oldMemberName];

    if (newName) {
      this.addFailureAtNode(node, `"${oldParentName}#${oldMemberName}" has been renamed to "${newName}"`);
    }
  }
}