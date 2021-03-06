import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {MemberRuleWalker} from "./memberRuleWalker";
import {nameNodeFromNode} from "./util";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new MemberRemovedWalker(sourceFile, this.getOptions(), program));
  }
}

class MemberRemovedWalker extends MemberRuleWalker {
  configEntryName: string = "removedMembers";
  protected checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string, guess: boolean) {
    const removed = changes[this.configEntryName][oldParentName]
        && changes[this.configEntryName][oldParentName].indexOf(oldMemberName) >= 0;

    if (removed) {
      if (guess) {
        this.addFailureAtNode(nameNodeFromNode(node), `This member might have been removed (assuming it is a member of type "${oldParentName}", inferred type is "any")`);
      } else {
        this.addFailureAtNode(nameNodeFromNode(node), `"${oldParentName}#${oldMemberName}" has been removed`);
      }
    }
  }
}