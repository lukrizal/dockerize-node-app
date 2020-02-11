export class ErrorWrapper extends Error {
  original: Error;
}
export function handle(promise: Promise<any>) {
  return promise
    .then(data => [data, undefined])
    .catch(err => [undefined, err]);
}

/**
 * catchWrapper - elegantly handle error on Promise.catch
 *
 * @export
 * @param {string} errMessage
 * @param {boolean} replaceMessage
 * @returns {Function}
 */
export function catchWrapper(errMessage?: string, replaceMessage: boolean = false) {
  return (original: Error) => {
    const error = new ErrorWrapper(replaceMessage ? errMessage : `${errMessage ? `${errMessage}: ` : ""}${original.message}`);
    error.original = original;
    throw error;
  };
}