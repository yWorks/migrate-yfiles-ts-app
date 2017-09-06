import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {MemberRuleWalker} from "./memberRuleWalker";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new ChangeReturnTypeWalker(sourceFile, this.getOptions(), program));
  }
}

class ChangeReturnTypeWalker extends MemberRuleWalker {
  protected checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string) {
    if (node.parent.kind !== ts.SyntaxKind.CallExpression
        && node.kind !== ts.SyntaxKind.MethodDeclaration) {
      // TODO: call and apply
      return;
    }

    const newReturnType = changes["returnTypeChanges"][oldParentName] && changes["returnTypeChanges"][oldParentName][oldMemberName];
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

      const oldReturnType = checker.getFullyQualifiedName(checker.getReturnTypeOfSignature(oldSignature).getSymbol());

      this.addFailureAtNode(targetNode,
          `The return type of "${oldParentName}#${oldMemberName}" has changed from "${oldReturnType}" to "${newReturnType}"`);
    }
  }
}