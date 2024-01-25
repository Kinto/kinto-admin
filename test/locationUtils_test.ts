import { breadcrumbifyPath, parseSearchString } from "../src/locationUtils";

describe("locationUtils", () => {
  test("breadcrumbify should return expected arrays", () => {
    expect(breadcrumbifyPath("/")).toStrictEqual([["home", "/"]]);
    expect(breadcrumbifyPath("/foo")).toStrictEqual([
      ["home", "/"],
      ["foo", "/foo"],
    ]);
    expect(breadcrumbifyPath("/foo/bar")).toStrictEqual([
      ["home", "/"],
      ["foo", "/foo"],
      ["bar", "/foo/bar"],
    ]);
  });

  test("parseSearchString should return expected parameter objects", () => {
    // invalid/empty search strings should return empty hashes
    expect(parseSearchString("/")).toStrictEqual({});
    expect(parseSearchString("")).toStrictEqual({});
    expect(parseSearchString(null)).toStrictEqual({});
    expect(parseSearchString(undefined)).toStrictEqual({});
    expect(parseSearchString("?")).toStrictEqual({});

    // valid strings should return matching hashes with decodedURI keys/values
    // default to true for valueless parameters
    expect(
      parseSearchString(`?foo&baR&cheese%20pizza=yes%2Fplease`)
    ).toStrictEqual({
      foo: true,
      baR: true,
      "cheese pizza": "yes/please",
    });
  });
});
