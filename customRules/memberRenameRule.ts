import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new MemberRenameWalker(sourceFile, this.getOptions(), program));
  }
}

class MemberRenameWalker extends Lint.ProgramAwareRuleWalker {
  public visitElementAccessExpression(node: ts.ElementAccessExpression) {
    super.visitElementAccessExpression(node);
  }

  public visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    this.checkMemberNode(node);
    super.visitPropertyAccessExpression(node);
  }

  private checkMemberNode(node: ts.PropertyAccessExpression) {
    const checker = this.getTypeChecker();
    const symbol = checker.getTypeAtLocation(node.expression).getSymbol();
    if (!symbol) {
      return;
    }
    const type = checker.getFullyQualifiedName(symbol);
    const oldName = node.name.text;

    const newName = changes["memberRenamings"][type] && changes["memberRenamings"][type][oldName];
    if (newName) {
      this.addFailureAtNode(node, `"${type}#${oldName}" has been renamed to "${newName}"`);
    }

  }
}