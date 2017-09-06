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
    const argumentExpression = node.argumentExpression;

    if (argumentExpression.kind === ts.SyntaxKind.StringLiteral) {
      const text = argumentExpression.getText();
      const oldName = text.substring(1, text.length - 1);

      this.checkMemberNode(node, node.expression, oldName);
    }

    super.visitElementAccessExpression(node);
  }

  public visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    this.checkMemberNode(node, node.expression, node.name.text);
    super.visitPropertyAccessExpression(node);
  }

  protected visitMethodDeclaration(node: ts.MethodDeclaration): void {
    this.checkInheritedMember(node);
    super.visitMethodDeclaration(node);
  }

  protected visitPropertyDeclaration(node: ts.PropertyDeclaration): void {
    this.checkInheritedMember(node);
    super.visitPropertyDeclaration(node);
  }

  protected visitGetAccessor(node: ts.AccessorDeclaration): void {
    this.checkInheritedMember(node);
    super.visitGetAccessor(node);
  }

  protected visitSetAccessor(node: ts.AccessorDeclaration): void {
    this.checkInheritedMember(node);
    super.visitSetAccessor(node);
  }

  private checkInheritedMember(node: ts.MethodDeclaration | ts.PropertyDeclaration | ts.AccessorDeclaration) {
    const oldName = node.name.getText();
    if (node.parent.kind === ts.SyntaxKind.ClassDeclaration) {
      const classDeclaration = <ts.ClassDeclaration> node.parent;

      classDeclaration.heritageClauses.forEach(heritageClause => {
        heritageClause.types.forEach(typeNode => {
          this.checkMemberNode(node, typeNode, oldName)
        });
      });
    }
  }

  private checkMemberNode(node: ts.Node, typeNode: ts.Node, oldName: string) {
    const checker = this.getTypeChecker();
    const symbol = checker.getTypeAtLocation(typeNode).getSymbol();
    if (!symbol) {
      return;
    }
    const type = checker.getFullyQualifiedName(symbol);

    const newName = changes["memberRenamings"][type] && changes["memberRenamings"][type][oldName];
    if (newName) {
      this.addFailureAtNode(node, `"${type}#${oldName}" has been renamed to "${newName}"`);
    }

  }
}