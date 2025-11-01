export class FunctionBuilder {
  body = '"use strict";\n';
  args: string[];

  constructor(...args: string[]) {
    this.args = args;
  }

  append(code: string) {
    this.body += code;
    return this;
  }

  line(code: string) {
    this.body += `${code}\n`;
    return this;
  }

  generate(self: any): any {
    return new Function(...this.args, this.body).bind(self);
  }
}

export function fn(...args: string[]) {
  return new FunctionBuilder(...args);
}
