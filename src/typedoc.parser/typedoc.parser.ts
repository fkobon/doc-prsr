import {CommonOptions} from './typedoc.parser.options';
import {
  Model,
  Class,
  ClassKind
} from '../model';

import {
  GetProperties,
  GetMethods,
  GetStyles,
  GetExamples
} from './getters';
import {Metadata} from "../model/metadata/metadata";

export class TypedocParser {
  protected examples: GetExamples = new GetExamples();
  protected styles: GetStyles = new GetStyles();
  protected methods: GetMethods = new GetMethods();
  protected props: GetProperties = new GetProperties();
  protected json: any;
  protected classes: any[] = [];

  saveJSON(json: any) {
    this.json = json;
  }

  parse(json: any, metadata: Metadata): Model {
    this.saveJSON(json);
    return new Model(this.getClasses(this.json), metadata);
  }

  getClasses(obj: any): Class[] {
    this.findAllClasses(obj);
    let tempClasses: any[] = [];

    tempClasses = this.classes                                            //TODO issue about return
      .filter((item: any) => this.isClass(item) || this.isInterface(item))
      .filter((item: any) => item[CommonOptions.comment])
      .map((item: any) => {
        if (item[CommonOptions.decorators]) {
          if (this.isComponent(item)) {
            return this.parseClass(item, 'component');
          } else if (this.isService(item)) {
            return this.parseClass(item, 'service');
          } else if (this.isDirective(item)) {
            return this.parseClass(item, 'directive');
          } else if (this.isNgModule(item)) {
            return this.parseClass(item, 'class');
          }
        } else {
          if (this.isClass(item)) {
            return this.parseClass(item, 'class');
          } else if (this.isInterface(item)) {
            return this.parseClass(item, 'interface');
          }
        }
      });
    return tempClasses;
  }

  findAllClasses(obj: any) {
    if (obj && obj[CommonOptions.children]) {
      obj[CommonOptions.children].forEach((item: any) => {
        if (this.isClass(item) || this.isInterface(item)) {
          this.classes.push(item);
        } else {
          this.findAllClasses(item);
        }
      })
    }
  }

  parseClass(obj: any, kind: ClassKind) {
    return new Class({
      kind: kind,
      platform: null,
      examples: this.examples.getExamples(obj),
      props: this.props.getProps(obj),
      methods: this.methods.getMethods(obj),
      name: obj[CommonOptions.name],
      description: this.getDescription(obj),
      shortDescription: this.getShortDescription(obj),
      styles: this.styles.getStyles(obj)
    });
  }

  getDescription(obj: any): string {
    if (obj && obj[CommonOptions.comment]) {
      return obj[CommonOptions.comment]['text'];
    } else {
      return '';
    }
  }

  getShortDescription(obj: any): string {
    if (obj && obj[CommonOptions.comment]) {
      return obj[CommonOptions.comment]['shortText'];
    } else {
      return '';
    }
  }

  isClass(obj: any) {
    return obj[CommonOptions.primKind] === 'Class';
  }

  isInterface(obj: any) {
    return obj[CommonOptions.primKind] === 'Interface';
  }

  isComponent(obj: any) {
    return obj[CommonOptions.decorators][0][CommonOptions.name] === 'Component';
  }

  isService(obj: any) {
    return obj[CommonOptions.decorators][0][CommonOptions.name] === 'Injectable';
  }

  isDirective(obj: any) {
    return obj[CommonOptions.decorators][0][CommonOptions.name] === 'Directive';
  }

  isNgModule(obj: any) {
    return obj[CommonOptions.decorators][0][CommonOptions.name] === 'NgModule';
  }

}