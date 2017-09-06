import * as ts from "typescript";
import * as Lint from "tslint";

export abstract class MemberRuleWalker extends Lint.ProgramAwareRuleWalker {
  protected visitElementAccessExpression(node: ts.ElementAccessExpression) {
    const argumentExpression = node.argumentExpression;

    if (argumentExpression.kind === ts.SyntaxKind.StringLiteral) {
      const text = argumentExpression.getText();
      const oldName = text.substring(1, text.length - 1);

      // check instance members
      this.checkMemberNode(node, node.expression, oldName);

      // check static members
      this.checkForChanges(node, node.expression.getText(), oldName);
    }

    super.visitElementAccessExpression(node);
  }

  protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression) {
    const oldName = node.name.getText();

    // check instance members
    this.checkMemberNode(node, node.expression, oldName);

    // check static members
    this.checkForChanges(node, node.expression.getText(), oldName);
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
    this.checkForChanges(node, type, oldName);
  }

  protected abstract checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string);
}