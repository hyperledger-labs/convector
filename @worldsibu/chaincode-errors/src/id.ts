export class InvalidIdError extends Error {
  public static test(id: string) {
    if (!id) {
      throw new InvalidIdError();
    }
  }

  public message = 'Invalid or missing id';
}

export class IdNotFoundError extends Error {
  public static test(content: any) {
    if (content === undefined || content === null) {
      throw new IdNotFoundError();
    }
  }

  public message = 'Id not found';
}
