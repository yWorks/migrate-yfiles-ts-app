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
  configEntryName: string = "propertyTypeChanges";

  protected checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string, guess: boolean) {
    if (node.kind !== ts.SyntaxKind.SetAccessor
        && node.kind !== ts.SyntaxKind.GetAccessor
        && node.kind !== ts.SyntaxKind.PropertyAccessExpression
        && node.kind !== ts.SyntaxKind.ElementAccessExpression) {
      return;
    }

    const newType = changes[this.configEntryName][oldParentName] && changes[this.configEntryName][oldParentName][oldMemberName];
    if (newType) {
      const checker = this.getTypeChecker();

      let oldType: string;
      if (node.kind === ts.SyntaxKind.GetAccessor) {
        const signature = checker.getSignatureFromDeclaration(<ts.SignatureDeclaration>node);
        if (!signature) return;
        oldType = getFullyQualifiedName(signature.getReturnType(), checker)
      } else {
        oldType = getFullyQualifiedName(checker.getTypeAtLocation(node), checker);
      }

      this.addFailureAtNode(node,
          `The type of property "${oldParentName}#${oldMemberName}" has changed from "${oldType}" to "${newType}"`);
    }
  }
}