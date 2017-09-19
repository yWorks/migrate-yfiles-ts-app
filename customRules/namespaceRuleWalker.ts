import * as ts from "typescript";
import * as Lint from "tslint";

export abstract class NamespaceRuleWalker extends Lint.ProgramAwareRuleWalker {
  protected visitImportEqualsDeclaration(node: ts.ImportEqualsDeclaration): void {
    this.checkNamespace(node, node.moduleReference.getText());
    super.visitImportEqualsDeclaration(node);
  }

  protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
    this.checkNamespace(node, node.getText());
    super.visitPropertyAccessExpression(node);
  }

  protected visitTypeReference(node: ts.TypeReferenceNode): void {
    this.checkNamespace(node, node.getText());
    super.visitTypeReference(node);
  }

  protected abstract checkNamespace(node: ts.Node, oldNamespace: string);
}