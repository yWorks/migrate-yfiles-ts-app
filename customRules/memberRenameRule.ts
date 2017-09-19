import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {MemberRuleWalker} from "./memberRuleWalker";
import {nameNodeFromNode, shouldFix} from "./util";
import {Replacement} from "tslint";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new MemberRenameWalker(sourceFile, this.getOptions(), program));
  }
}

class MemberRenameWalker extends MemberRuleWalker {
  configEntryName: string = "memberRenamings";
  protected checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string, guess: boolean) {
    const newName = changes[this.configEntryName][oldParentName] && changes[this.configEntryName][oldParentName][oldMemberName];

    if (newName) {
      const targetNode = nameNodeFromNode(node);

      if (guess) {
        this.addFailureAtNode(targetNode, `This member might have been renamed to "${newName}" (assuming it is a member of type "${oldParentName}", inferred type is "any")`);
      } else {
        let fix: Replacement;
        if (shouldFix(this.getOptions())) {
          fix = new Lint.Replacement(targetNode.getStart(), targetNode.getWidth(), newName);
        }
        this.addFailureAtNode(targetNode, `${fix ? "(fixed) " : ""}"${oldParentName}#${oldMemberName}" has been renamed to "${newName}"`, fix);
      }
    }
  }
}