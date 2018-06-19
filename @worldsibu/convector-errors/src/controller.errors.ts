import { BaseError } from './base.error';

const chaincodeSideMessage = 'This is a chaincode error, meaning this happened in the peer container';

export class ControllerImportError extends BaseError {
  public code = 'CTRL_IMP_ERR';
  public description = 'Importing the chaincode controller failed';
  public explanation = `
    The module ${this.pkg} is not reachable
    ${chaincodeSideMessage}`;

  constructor(public original: Error, public pkg: string) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}

export class ControllerMissingError extends BaseError {
  public code = 'CTRL_MISS_ERR';
  public description = 'The chaincode controller was not found';
  public explanation = `
    The module ${this.pkg} does not contain a class named ${this.ctrl}
    ${chaincodeSideMessage}`;

  constructor(public pkg: string, public ctrl: string) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}

export class ControllerNamespaceMissingError extends BaseError {
  public code = 'CTRL_NS_MISS_ERR';
  public description = 'The controller namespace was not found in the chaincode';
  public explanation = `
    This might happen because you misspelled the controller ${this.ctrl} name
    ${chaincodeSideMessage}`;

  constructor(public original: Error, public ctrl: string) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}

export class ControllerInstantiationError extends BaseError {
  public code = 'CTRL_INST_ERR';
  public description = 'The controller failed to instantiate';
  public explanation = `
    There might be an error in the constructor of ${this.ctrl}, since the call to it failed
    ${chaincodeSideMessage}`;

  constructor(public original: Error, public ctrl: string) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}

export class ControllerInvokablesMissingError extends BaseError {
  public code = 'CTRL_IVK_MISS_ERR';
  public description = 'The controller does not contain any invokable methods';
  public explanation = `
    You must have forgot to include at least one @Invokable() method in your ${this.ctrl} controller
    ${chaincodeSideMessage}`;

  constructor(public original: Error, public ctrl: string) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}

export class ControllerInvalidError extends BaseError {
  public code = 'CTRL_INV_ERR';
  public description = 'Invalid controller object';
  public explanation = `
    You're using a @Controller('${this.ctrl}') decorator in an invalid location
    ${chaincodeSideMessage}`;

  constructor(public ctrl: string) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}

export class ControllerInvalidInvokeError extends BaseError {
  public code = 'CTRL_INV_ARGS_ERR';
  public description = 'Invalid function invocation arguments';
  public explanation = `
    Function ${this.fn} invoked with ${this.args} params but ${this.schemas} expected
    ${chaincodeSideMessage}`;

  constructor(public fn: string, public args = 0, public schemas = 0) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}

export class ControllerInvalidArgumentError extends BaseError {
  public code = 'CTRL_INV_ARG_ERR';
  public description = 'Invalid argument passed in controller';
  public explanation = `
    Invalid argument #${this.index} using value ${this.value}
    This argument doesn't seem to be passing the yup validations
    ${chaincodeSideMessage}`;

  constructor(public original: Error, public index: number, public value: string) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}

export class ControllerArgumentParseError extends BaseError {
  public code = 'CTRL_ARG_PRS_ERR';
  public description = 'Argument parse error';
  public explanation = `
    Argument #${this.index} using value ${this.value}
    Something is crashing while we're trying to parse the argument
    ${chaincodeSideMessage}`;

  constructor(public original: Error, public index: number, public value: string) {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}

export class ControllerInvalidFunctionError extends BaseError {
  public code = 'CTRL_INV_FN_ERR';
  public description = 'Invokable controller function is invalid';
  public explanation = `
    The operator @Invokable() was used in an invalid object
    ${chaincodeSideMessage}`;

  constructor() {
    super();
    this.message = super.getMessage(super.getOriginal());
  }
}
