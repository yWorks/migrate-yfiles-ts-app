import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {MemberRuleWalker} from "./memberRuleWalker";
import {nameNodeFromNode} from "./util";
import {Replacement} from "tslint";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new MemberRenameWalker(sourceFile, this.getOptions(), program));
  }
}

class MemberRenameWalker extends MemberRuleWalker {
  configEntryName: string = "memberRenamings";
  protected checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string, isGuess: boolean) {
    const newName = changes[this.configEntryName][oldParentName] && changes[this.configEntryName][oldParentName][oldMemberName];

    if (newName) {
      const targetNode = nameNodeFromNode(node);
      let fix: Replacement;

      if (!isGuess) {
        fix = new Lint.Replacement(targetNode.getStart(), targetNode.getWidth(), newName);
      }

      this.addFailureAtNode(targetNode, `"${oldParentName}#${oldMemberName}" has been renamed to "${newName}"`, fix);
    }
  }
}