import * as ts from "typescript";
import * as Lint from "tslint";
import {getFullyQualifiedName, guessTypeForMember} from "./util";
import {changes} from "../changes";

export abstract class MemberRuleWalker extends Lint.ProgramAwareRuleWalker {
  abstract configEntryName: string;

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

      if (!classDeclaration.heritageClauses) {
        return;
      }

      classDeclaration.heritageClauses.forEach(heritageClause => {
        if (!heritageClause.types) {
          return;
        }

        heritageClause.types.forEach(typeNode => {
          this.checkMemberNode(node, typeNode, oldName)
        });
      });
    }
  }

  private checkMemberNode(node: ts.Node, typeNode: ts.Node, oldName: string) {
    const checker = this.getTypeChecker();
    let type = getFullyQualifiedName(checker.getTypeAtLocation(typeNode), checker);

    if (type === "any") {
      type = guessTypeForMember(oldName, changes[this.configEntryName]);
    }

    this.checkForChanges(node, type, oldName);
  }

  protected abstract checkForChanges(node: ts.Node, oldParentName: string, oldMemberName: string);
}