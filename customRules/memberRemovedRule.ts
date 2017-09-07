import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {MemberRuleWalker} from "./memberRuleWalker";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new MemberRemovedWalker(sourceFile, this.getOptions(), program));
  }
}

class MemberRemovedWalker extends MemberRuleWalker {
  configEntryName: string = "removedMembers";
  protected checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string) {
    const removed = changes[this.configEntryName][oldParentName]
        && changes[this.configEntryName][oldParentName].indexOf(oldMemberName) >= 0;

    if (removed) {
      this.addFailureAtNode(node, `"${oldParentName}#${oldMemberName}" has been removed`);
    }
  }
}