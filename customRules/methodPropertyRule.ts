import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {MemberRuleWalker} from "./memberRuleWalker";
import {nameNodeFromNode, shouldFix} from "./util";

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
      if (guess) {
        this.addFailureAtNode(nameNodeFromNode(node), `This member might be a ${newKind} now (assuming it is a member of type "${oldParentName}", inferred type is "any")`);
      } else {
        // the only fix we can safely perform is to transform a "getter function" invocation into a property access (remove
        // the parentheses)
        let fix;
        if (shouldFix(this.getOptions())) {
          if (newKind === "property" && node.parent.kind === ts.SyntaxKind.CallExpression) {
            const signature = this.getTypeChecker().getResolvedSignature(<ts.CallLikeExpression>node.parent);
            if (signature && signature.getParameters().length === 0) {
              fix = new Lint.Replacement(node.parent.getEnd() - 2, 2, "");
            }
          }
        }

        this.addFailureAtNode(nameNodeFromNode(node), `${fix ? "(fixed) " : ""}"${oldParentName}#${oldMemberName}" is now a ${newKind}`, fix);
      }
    }
  }
}