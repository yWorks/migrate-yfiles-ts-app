import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {NamespaceRuleWalker} from "./namespaceRuleWalker";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new ChangeNamespaceWalker(sourceFile, this.getOptions(), program));
  }
}

class ChangeNamespaceWalker extends NamespaceRuleWalker {
  protected checkNamespace(node: ts.Node, oldNamespace: string) {
    const newNamespace = changes["namespaceChanges"][oldNamespace];

    if (newNamespace) {
      this.addFailureAtNode(node, `The namespace of "${oldNamespace}" has changed to "${newNamespace}"`);
    }
  }
}