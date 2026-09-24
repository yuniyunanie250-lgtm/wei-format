import { test } from "node:test";
import assert from "node:assert/strict";
import { convert, formatUnits, human, parseUnits } from "../src/wei.mjs";

test("one ether is exactly 1e18 wei", () => {
  assert.equal(parseUnits("1", "ether"), 1000000000000000000n);
  assert.equal(formatUnits(1000000000000000000n, "ether"), "1");
});

test("0.1 ether is exact and the float route is not good enough in general", () => {
  assert.equal(parseUnits("0.1", "ether"), 100000000000000000n);

  // 0.1 happens to survive a float round-trip; 1.1 and 2.3 do not. Assert on
  // values we verified are lossy rather than assuming any value is.
  const lossy = ["1.1", "2.3"].filter(
    (s) => BigInt(Number(s) * 1e18) !== parseUnits(s, "ether"),
  );
  assert.ok(lossy.length > 0, "expected at least one float-losing case");
  assert.equal(BigInt(Number("1.1") * 1e18), 1100000000000000128n);
  assert.equal(parseUnits("1.1", "ether"), 1100000000000000000n);
});

test("gwei is the unit used for gas prices", () => {
  assert.equal(parseUnits("30", "gwei"), 30000000000n);
  assert.equal(formatUnits(30000000000n, "gwei"), "30");
});

test("trailing zeros are trimmed but a decimal point survives", () => {
  assert.equal(formatUnits(1500000000000000000n, "ether"), "1.5");
  assert.equal(formatUnits(1000000000000000001n, "ether"), "1.000000000000000001");
});

test("too many decimals for the unit is an error, not a rounding", () => {
  assert.throws(() => parseUnits("0.0000000001", "gwei"), /more than 9 decimal places/);
});

test("negative values round trip", () => {
  assert.equal(parseUnits("-1.5", "ether"), -1500000000000000000n);
  assert.equal(formatUnits(-1500000000000000000n, "ether"), "-1.5");
});

test("converting between units is exact", () => {
  assert.equal(convert(1n, "ether", "gwei"), 1000000000n);
  assert.equal(convert(1000000000n, "gwei", "ether"), 1n);
  assert.equal(convert(100n, "gwei", "wei"), 100000000000n);
});

test("sub-unit formatting pads correctly below the point", () => {
  assert.equal(formatUnits(1n, "ether"), "0.000000000000000001");
  assert.equal(formatUnits(1n, "gwei"), "0.000000001");
  assert.equal(formatUnits(0n, "ether"), "0");
});

test("unknown units are rejected", () => {
  assert.throws(() => parseUnits("1", "finney_"), /unknown unit/);
  assert.throws(() => formatUnits(1n, "monero"), /unknown unit/);
});

test("garbage input is rejected", () => {
  assert.throws(() => parseUnits("1,5", "ether"), /not a decimal/);
  assert.throws(() => parseUnits("", "ether"), /not a decimal/);
  assert.throws(() => parseUnits("1e18", "ether"), /not a decimal/);
});

test("human keeps the unit label", () => {
  assert.equal(human(1500000000000000000n), "1.5 ether");
  assert.equal(human(30000000000n, "gwei"), "30 gwei");
});
