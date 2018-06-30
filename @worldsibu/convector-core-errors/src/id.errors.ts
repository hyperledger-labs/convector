/** @module @worldsibu/convector-core-errors */

export class InvalidIdError extends Error {
  public static test(id: string) {
    if (!id) {
      throw new InvalidIdError();
    }
  }

  public name = 'InvalidIdError';
  public message = 'Invalid or missing id. You either provided an invalid ID or did not sent one';
}

export class IdNotFoundError extends Error {
  public static test(content: any) {
    if (content === undefined || content === null) {
      throw new IdNotFoundError();
    }
  }

  public name = 'IdNotFoundError';
  public message = 'ID not found. The ID you were using was not found in the storage';
}
