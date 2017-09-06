import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {MemberRuleWalker} from "./memberRuleWalker";
import {getFullyQualifiedName} from "./util";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new MemberRenameWalker(sourceFile, this.getOptions(), program));
  }
}

class MemberRenameWalker extends Lint.ProgramAwareRuleWalker {
  protected visitNewExpression(node: ts.NewExpression): void {
    const namedConstructorExpression = node.expression;

    if (namedConstructorExpression.kind !== ts.SyntaxKind.PropertyAccessExpression) {
      return;
    }

    const namedConstructor = <ts.PropertyAccessExpression> namedConstructorExpression;
    const typeExpression = namedConstructor.expression;

    const checker = this.getTypeChecker();

    const typeExpressionType = checker.getFullyQualifiedName(checker.getSymbolAtLocation(typeExpression));
    const namedConstructorType = checker.getFullyQualifiedName(checker.getReturnTypeOfSignature(checker.getResolvedSignature(node)).getSymbol());

    if (typeExpressionType === namedConstructorType) {
      const parts = namedConstructor.getText().split(".");
      this.addFailureAtNode(node,
          `Named constructors have been replaced by overloaded constructors. Simply remove the ".${parts[parts.length - 1]}".`);
    }

    super.visitNewExpression(node);
  }
}
