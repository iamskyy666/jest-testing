import { getBookDisplayTitle } from "./BookService";

describe("getBookDisplayTitle", () => {
  it("should format the book-title correctly", () => {
    // dummy test-double
    const dummyBook = {
      title: "Wake 🧜🏻‍♀️",
      author: "Amanda Hocking",
    } as any;
    const result = getBookDisplayTitle(dummyBook);
    expect(result).toBe(`Wake 🧜🏻‍♀️ by Amanda Hocking`);
  });
});
