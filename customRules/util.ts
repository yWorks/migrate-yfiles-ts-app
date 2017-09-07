import * as ts from "typescript"

export function getFullyQualifiedName(type: ts.Type, checker: ts.TypeChecker): string {
  const symbol = type.getSymbol();

  if (symbol) {
    return checker.getFullyQualifiedName(symbol);
  } else {
    // workaround for primitive types
    return type["intrinsicName"];
  }
}

export function nameNodeFromNode(node: ts.Node): ts.Node {
  if (node.kind === ts.SyntaxKind.ElementAccessExpression) {
    return (<ts.ElementAccessExpression>node).argumentExpression;
  } else {
    return (<ts.NamedDeclaration>node).name
  }
}

export function guessTypeForMember(memberName: string, changesDomain: any): string {
  return Object.getOwnPropertyNames(changesDomain).find(name => {
    const membersOfType = changesDomain[name];
    if (Array.isArray(membersOfType)) {
      return membersOfType.indexOf(memberName) >= 0;
    } else {
      return membersOfType.hasOwnProperty(memberName);
    }
  }) || "any";
}