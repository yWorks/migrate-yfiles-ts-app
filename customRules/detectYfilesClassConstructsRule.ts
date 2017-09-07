import * as ts from "typescript";
import * as Lint from "tslint";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new DetectYfilesClassConstructsWalker(sourceFile, this.getOptions(), program));
  }
}

class DetectYfilesClassConstructsWalker extends Lint.ProgramAwareRuleWalker {
  protected visitPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
    const object = node.expression.getText();
    const property = node.name.getText();

    if ((object.indexOf("yfiles") >= 0 // allow stuff like (yfiles as any).lang.Class
            && (property === "ClassDefinition" || property === "InterfaceDefinition" || property === "StructDefinition"))
        || (object.indexOf("yfiles") >= 0 && object.indexOf("lang") >= 0
            && (property === "Class" || property === "Interface" || property === "Struct"))) {
      this.addFailureAtNode(node, "It is now possible for TypeScript classes to extend directly from yFiles classes. " +
          "Please refer to http://docs.yworks.com/yfileshtml/#/dguide/framework_basic_interfaces#framework_complex_inheritance.")
    }

    super.visitPropertyAccessExpression(node);
  }
}
