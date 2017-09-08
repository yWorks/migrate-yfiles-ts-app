import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {MemberRuleWalker} from "./memberRuleWalker";
import {nameNodeFromNode} from "./util";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new MethodPropertyWalker(sourceFile, this.getOptions(), program));
  }
}

class MethodPropertyWalker extends MemberRuleWalker {
  configEntryName: string = "methodsProperties";

  protected checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string, guess: boolean) {
    const newKind = changes[this.configEntryName][oldParentName] && changes[this.configEntryName][oldParentName][oldMemberName];

    if (newKind) {
      this.addFailureAtNode(nameNodeFromNode(node), `"${oldParentName}#${oldMemberName}" is now a ${newKind}`);
    }
  }
}