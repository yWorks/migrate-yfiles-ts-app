import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {MemberRuleWalker} from "./memberRuleWalker";
import {getFullyQualifiedName} from "./util";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new ChangeReturnTypeWalker(sourceFile, this.getOptions(), program));
  }
}

class ChangeReturnTypeWalker extends MemberRuleWalker {
  configEntryName: string = "returnTypeChanges";

  protected checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string, guess: boolean) {
    if (node.parent.kind !== ts.SyntaxKind.CallExpression
        && node.kind !== ts.SyntaxKind.MethodDeclaration) {
      return;
    }

    let isCallOrApply: boolean;
    if (oldMemberName === "call" || oldMemberName === "apply") {
      isCallOrApply = true;
      const lastDot = oldParentName.lastIndexOf(".");
      oldMemberName = oldParentName.substring(lastDot + 1);
      oldParentName = oldParentName.substring(0, lastDot)
    }

    const newReturnType = changes[this.configEntryName][oldParentName] && changes[this.configEntryName][oldParentName][oldMemberName];
    if (newReturnType) {
      const checker = this.getTypeChecker();

      let oldSignature, targetNode;
      if (node.kind === ts.SyntaxKind.MethodDeclaration) {
        oldSignature = checker.getSignatureFromDeclaration(<ts.SignatureDeclaration>node);
        targetNode = node;
      } else {
        oldSignature = checker.getResolvedSignature(<ts.CallLikeExpression>node.parent);
        targetNode = node.parent
      }

      if (!oldSignature) return;

      const oldReturnType = getFullyQualifiedName(checker.getReturnTypeOfSignature(oldSignature), checker);

      if (isCallOrApply) {
        this.addFailureAtNode(targetNode,
            `The return type of "${oldParentName}#${oldMemberName}" has changed to "${newReturnType}"`);
      } else {
        this.addFailureAtNode(targetNode,
            `The return type of "${oldParentName}#${oldMemberName}" has changed from "${oldReturnType}" to "${newReturnType}"`);
      }
    }
  }
}