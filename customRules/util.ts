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