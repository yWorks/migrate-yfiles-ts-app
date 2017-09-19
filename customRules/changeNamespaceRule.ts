import * as ts from "typescript";
import * as Lint from "tslint";
import {changes} from "../changes"
import {NamespaceRuleWalker} from "./namespaceRuleWalker";
import {shouldFix} from "./util";
import {Replacement} from "tslint";

export class Rule extends Lint.Rules.TypedRule {
  public applyWithProgram(sourceFile: ts.SourceFile, program: ts.Program): Lint.RuleFailure[] {
    return this.applyWithWalker(new ChangeNamespaceWalker(sourceFile, this.getOptions(), program));
  }
}

class ChangeNamespaceWalker extends NamespaceRuleWalker {
  protected checkNamespace(node: ts.Node, oldNamespace: string) {
    const newNamespace = changes["namespaceChanges"] && changes["namespaceChanges"][oldNamespace];

    if (newNamespace) {

      let fix: Replacement;
      if (shouldFix(this.getOptions())) {
        fix = new Lint.Replacement(node.getStart(), node.getWidth(), newNamespace);
      }

      this.addFailureAtNode(node, `${fix ? "(fixed) " : ""}The namespace of "${oldNamespace}" has changed to "${newNamespace}"`, fix);
    }
  }
}