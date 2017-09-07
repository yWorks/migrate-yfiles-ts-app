import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {MemberRuleWalker} from "./memberRuleWalker";
import {nameNodeFromNode} from "./util";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new MemberRenameWalker(sourceFile, this.getOptions(), program));
  }
}

class MemberRenameWalker extends MemberRuleWalker {
  configEntryName: string = "memberRenamings";
  protected checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string) {
    const newName = changes[this.configEntryName][oldParentName] && changes[this.configEntryName][oldParentName][oldMemberName];

    if (newName) {
      this.addFailureAtNode(nameNodeFromNode(node), `"${oldParentName}#${oldMemberName}" has been renamed to "${newName}"`);
    }
  }
}