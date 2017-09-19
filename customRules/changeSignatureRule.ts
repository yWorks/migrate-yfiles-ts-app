import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {MemberRuleWalker} from "./memberRuleWalker";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new ChangeSignatureWalker(sourceFile, this.getOptions(), program));
  }
}

class ChangeSignatureWalker extends MemberRuleWalker {
  configEntryName: string = "signatureChanges";

  protected checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string, guess: boolean) {
    if (node.parent.kind !== ts.SyntaxKind.CallExpression
        && node.parent.kind !== ts.SyntaxKind.NewExpression
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

    const signatureChanges = changes[this.configEntryName][oldParentName] && changes[this.configEntryName][oldParentName][oldMemberName];
    if (signatureChanges) {
      const checker = this.getTypeChecker();

      let oldSignature, start, width;
      if (node.kind === ts.SyntaxKind.MethodDeclaration) {
        const signatureDeclaration = checker.getSignatureFromDeclaration(<ts.SignatureDeclaration>node).declaration;
        if (!signatureDeclaration) return;
        oldSignature = signatureDeclaration.parameters
            .map(parameter => parameter.name.getText());

        start = (<ts.MethodDeclaration>node).name.getStart();
        width = (<ts.MethodDeclaration>node).name.getWidth();
      } else {
        const signature = checker.getResolvedSignature(<ts.CallLikeExpression>node.parent);
        if (!signature) return;
        oldSignature = signature.parameters
            .map(parameter => parameter.getName());

        start = node.getEnd();
        width = node.parent.getEnd() - start;
      }

      const newSignature = signatureChanges
          .map(oldIndexOrNewName => typeof oldIndexOrNewName === "number" ? oldSignature[oldIndexOrNewName] : oldIndexOrNewName);

      let failure: string;
      if (guess) {
        failure = `The signature of this method might have changed (assuming this is a member of "${oldParentName}", inferred type is "any")`;
      } else {
        if (isCallOrApply) {
          failure = `The signature of "${oldParentName}#${oldMemberName}" has changed`;
        } else {
          failure = `The signature of "${oldParentName}#${oldMemberName}" has been changed from (${oldSignature.join(", ")}) to (${newSignature.join(", ")})`;
        }
      }

      this.addFailureAt(start, width, failure);
    }
  }
}