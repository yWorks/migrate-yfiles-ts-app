"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
function getFullyQualifiedName(type, checker) {
    var symbol = type.getSymbol();
    if (symbol) {
        return checker.getFullyQualifiedName(symbol);
    }
    else {
        // workaround for primitive types
        return type["intrinsicName"];
    }
}
exports.getFullyQualifiedName = getFullyQualifiedName;
function nameNodeFromNode(node) {
    if (node.kind === ts.SyntaxKind.ElementAccessExpression) {
        return node.argumentExpression;
    }
    else {
        return node.name;
    }
}
exports.nameNodeFromNode = nameNodeFromNode;
function guessTypeForMember(memberName, changesDomain) {
    return Object.getOwnPropertyNames(changesDomain).find(function (name) {
        var membersOfType = changesDomain[name];
        if (Array.isArray(membersOfType)) {
            return membersOfType.indexOf(memberName) >= 0;
        }
        else {
            return membersOfType.hasOwnProperty(memberName);
        }
    }) || "any";
}
exports.guessTypeForMember = guessTypeForMember;
//# sourceMappingURL=util.js.map