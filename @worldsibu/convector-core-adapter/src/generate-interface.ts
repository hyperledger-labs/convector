#!/usr/bin/env node

import * as program from 'commander';
import { join, dirname } from 'path';
import Project, {
  IndentationText,
  QuoteKind,
  Scope
} from 'ts-simple-ast';

program
  .option('-c, --controller <name>', 'controller name')
  .option('-o, --output <path>', 'output folder', 'client')
  .option('-p, --project <path>', 'tsconfig project file', 'tsconfig.json')
  .parse(process.argv);

/** @hidden */
const tsconfig = join(process.cwd(), program.project);
/** @hidden */
const root = dirname(tsconfig);
/** @hidden */
const project = new Project({
  tsConfigFilePath: tsconfig,
  manipulationSettings: {
    quoteKind: QuoteKind.Single,
    indentationText: IndentationText.TwoSpaces
  }
});

project.addExistingSourceFiles(join(root, 'src/**/*.ts'));

/** @hidden */
const controllerFile = project.getSourceFiles()
  .find(source => !!source.getClass(program.controller));

/** @hidden */
const client = controllerFile.copy(join(root, program.output, controllerFile.getBaseName()), { overwrite: true });

// client.getImportDeclaration(imp =>
//   imp.getModuleSpecifier().getLiteralText() === '@worldsibu/chaincode-utils').remove();

// Import adapter interface
client.addImportDeclaration({
  moduleSpecifier: '@worldsibu/convector-core-adapter',
  namedImports: [{ name: 'ControllerAdapter' }]
});

/** @hidden */
const controller = client.getClass(program.controller);

// Rename the controller as ControllerClient
controller.rename(`${program.controller}Client`);

// Remove the class properties
controller.getProperties().forEach(prop => prop.remove());

// Read the @Controller decorator and extract the name into a private property
controller.addProperty({
  name: 'name',
  scope: Scope.Public,
  initializer: controller.getDecorator('Controller').getArguments()[0].getText()
}).setOrder(0);

// Add the constructor to get the adapter configuration
controller.addConstructor({
  parameters: [
    {
      name: 'adapter',
      scope: Scope.Public,
      type: 'ControllerAdapter'
    }, {
      name: 'user',
      scope: Scope.Public,
      type: 'string',
      hasQuestionToken: true
    }
  ],
  bodyText: 'super()'
}).setOrder(1);

// Remove the class decorators
controller.getDecorators().forEach(dec => dec.remove());

controller.getMethods().forEach((method, i) => {
  if (!method.getDecorator('Invokable')) {
    method.remove();
    return;
  }

  // Remove the method decorators
  method.getDecorators().forEach(dec => dec.remove());

  // Remove the param decorators
  const params = method.getParameters().map(param => {
    param.getDecorators().forEach(dec => dec.remove());

    return param.getName();
  }).join(', ');

  // Proxy the call to the adapter
  method.setBodyText(writer =>
    writer.writeLine(`await this.adapter.invoke(this.name, '${method.getName()}', this.user, ${params});`));

  method.setOrder(i + 2);
});

client.saveSync();

/** @hidden */
const indexFile = project.getSourceFile('index.ts')
  .copy(join(root, program.output, 'index.ts'), { overwrite: true });

indexFile
  .getExportDeclaration(exp =>
    exp.getModuleSpecifier().getLiteralText().includes(controllerFile.getBaseNameWithoutExtension()))
  .setModuleSpecifier(`./${controllerFile.getBaseNameWithoutExtension()}`);

indexFile.saveSync();
