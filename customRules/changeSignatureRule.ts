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
  protected checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string) {
    if (node.parent.kind !== ts.SyntaxKind.CallExpression
        && node.parent.kind !== ts.SyntaxKind.NewExpression
        && node.kind !== ts.SyntaxKind.MethodDeclaration) {
      // TODO: call and apply
      return;
    }

    const signatureChanges = changes["signatureChanges"][oldParentName] && changes["signatureChanges"][oldParentName][oldMemberName];
    if (signatureChanges) {
      const checker = this.getTypeChecker();

      let oldSignature, targetNode;
      if (node.kind === ts.SyntaxKind.MethodDeclaration) {
        oldSignature = checker.getSignatureFromDeclaration(<ts.SignatureDeclaration>node).declaration.parameters
            .map(parameter => parameter.name.getText());
        targetNode = node;
      } else {
        oldSignature = checker.getResolvedSignature(<ts.CallLikeExpression>node.parent).parameters
            .map(parameter => parameter.getName());
        targetNode = node.parent
      }

      const newSignature = signatureChanges
          .map(oldIndexOrNewName => typeof oldIndexOrNewName === "number" ? oldSignature[oldIndexOrNewName] : oldIndexOrNewName);

      this.addFailureAtNode(targetNode,
          `The signature of "${oldParentName}#${oldMemberName}" has been changed from (${oldSignature.join(", ")}) to (${newSignature.join(", ")})`);
    }
  }
}