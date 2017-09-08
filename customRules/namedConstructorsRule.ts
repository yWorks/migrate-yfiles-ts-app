import * as ts from "typescript";
import * as Lint from "tslint";

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
      const start = namedConstructor.name.getStart() - 1;
      const width = namedConstructor.name.getWidth() + 1;

      const fix = new Lint.Replacement(start, width, "");

      const parts = namedConstructor.getText().split(".");
      this.addFailureAt(start, width,
          `Named constructors have been replaced by overloaded constructors. Simply remove the ".${parts[parts.length - 1]}".`, fix);
    }

    super.visitNewExpression(node);
  }
}
