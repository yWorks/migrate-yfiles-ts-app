import * as ts from "typescript";
import * as Lint from "tslint";
import {shouldFix} from "./util";
import {Replacement} from "tslint";

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

    const typeSymbol = checker.getSymbolAtLocation(typeExpression);
    if (!typeSymbol) return;
    const typeExpressionType = checker.getFullyQualifiedName(typeSymbol);

    const signature = checker.getResolvedSignature(node);
    if (!signature) return;
    const namedConstructorSymbol = checker.getReturnTypeOfSignature(signature).getSymbol();
    if (!namedConstructorSymbol) return;
    const namedConstructorType = checker.getFullyQualifiedName(namedConstructorSymbol);

    if (typeExpressionType === namedConstructorType) {
      const start = namedConstructor.name.getStart() - 1;
      const width = namedConstructor.name.getWidth() + 1;

      let fix: Replacement;
      if (shouldFix(this.getOptions())) {
        fix = new Lint.Replacement(start, width, "");
      }

      const parts = namedConstructor.getText().split(".");
      this.addFailureAt(start, width,
          `${fix ? "(fixed) " : ""}Named constructors have been replaced by overloaded constructors.`
          + (fix ? "" : ` Simply remove the ".${parts[parts.length - 1]}".`), fix);
    }

    super.visitNewExpression(node);
  }
}
