const { expect } = require("chai");
const { ensureLogPattern } = require("../lib/index");

describe("ensureLogPattern", () => {
  it("should append *.log if it is not present", () => {
    const input = "# My gitignore\nnode_modules\n";
    const result = ensureLogPattern(input);
    expect(result).to.contain("*.log");
    expect(result).to.contain("# Logs");
  });

  it("should not append *.log if it is already present", () => {
    const input = "# Logs\n*.log\nnode_modules\n";
    const result = ensureLogPattern(input);
    const matches = result.match(/\*\.log/g);
    expect(matches.length).to.equal(1);
  });
});
