import { handle, catchWrapper } from "../src/util/promise";
import logger from "../src/util/logger";
import * as response from "../src/util/response";
import {
  SESSION_SECRET,
  MONGODB_URI,
  GITHUB_PAT
} from "../src/util/secrets";

describe("Utils > ", () => {
  it("promise > handle", async () => {
    let [resolve, reject] = await handle(Promise.reject(new Error("Just an error.")));
    expect(resolve).toBeUndefined;
    expect(reject).toBeInstanceOf(Error);

    [resolve, reject] = await handle(Promise.resolve("A String"));
    expect(reject).toBeUndefined;
    expect(resolve).toBe("A String");
  });

  it("promise > catchWrapper", async () => {
    try {
      await Promise.reject(new Error("First")).catch(catchWrapper("Second"));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Second: First");
    }

    try {
      await Promise.reject(new Error("First")).catch(catchWrapper());
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("First");
    }

    try {
      await Promise.reject(new Error("First")).catch(catchWrapper("Second", true));
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe("Second");
    }
  });

  it("logger", () => {
    expect(logger.debug).toBeInstanceOf(Function);
    expect(logger.log).toBeInstanceOf(Function);
    expect(logger.error).toBeInstanceOf(Function);
  });

  it("response > toApiResponse", () => {
    let res = { statusCode: 500 };
    const err = new response.ErrorResponse(res, "Something went wrong");
    let result = response.toApiResponse(err, {});

    expect(result).toHaveProperty("error");
    expect(result.error).toBe(true);

    res = { statusCode: 200 };
    const item = { name: "Sample" };
    result = response.toApiResponse(res, { item });

    expect(result).toHaveProperty("data");
    expect(result.data).toMatchObject({ httpStatus: 200, item });
  });

  it("secrets", () => {
    expect(SESSION_SECRET).toBeTruthy();
    expect(MONGODB_URI).toBeTruthy();
    expect(GITHUB_PAT).toBeTruthy();
  });
});
