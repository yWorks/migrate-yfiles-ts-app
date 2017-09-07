import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {MemberRuleWalker} from "./memberRuleWalker";
import {getFullyQualifiedName} from "./util";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new DetectYfilesClassConstructsWalker(sourceFile, this.getOptions(), program));
  }
}

class DetectYfilesClassConstructsWalker extends Lint.ProgramAwareRuleWalker {
  protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
    const object = node.expression.getText();
    const property = node.name.getText();

    if ((object === "yfiles"
            && (property === "ClassDefinition" || property === "InterfaceDefinition" || property === "StructDefinition"))
        || (object === "yfiles.lang"
            && (property === "Class" || property === "Interface" || property === "Struct"))) {
      this.addFailureAtNode(node, "It is now possible for TypeScript classes to extend directly from yFiles classes. " +
          "Please refer to http://docs.yworks.com/yfileshtml/#/dguide/framework_basic_interfaces#framework_complex_inheritance.")
    }

    super.visitPropertyAccessExpression(node);
  }
}
