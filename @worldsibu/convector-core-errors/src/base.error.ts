/** @module @worldsibu/convector-core-errors */

export class BaseError extends Error {
  public original?: Error;
  public code = 'UNKNOWN';
  public explanation = 'No explanation was given';
  public description = `There was an unknown error

    It might be a bug in our code and we still don't know what it is.
    It might be as well a network or IO problem.
    But there's a chance it might be your fault, sending some incorrectly parameter or in the wrong format.

    Please check the information below for useful data to fire a bug or correct your code.

    Thanks!`;

  constructor() {
    super();
  }

  protected getOriginal() {
    const original = this.original;

    if (!original) {
      return 'No original error information. This might be the root cause!';
    }

    this.stack = '';
    const stack = original.stack.split('\n');
    const lines = stack.length;

    delete this.original;

    return `${stack.slice(0, 5).join('\n')}
      ... ${lines} additional lines`;
  }

  protected getMessage(original: string) {
    return `
    ${this.code}
    ${this.description}
    ${this.explanation}

    Original stack:
    ${original}
    `;
  }
}
