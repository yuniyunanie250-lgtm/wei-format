# wei-format

Exact wei/gwei/ether conversion with BigInt, so amounts never round-trip through
a floating point number.

`0.1 * 1e18` in JavaScript is `100000000000000000` only by luck of that
particular value; plenty of realistic amounts come out one wei off. When you are
building a transaction that is the difference between success and a revert.

## Usage

```bash
npx github:yuniyunanie250-lgtm/wei-format 1000000000000000000
# 1 ether
# 1000000000000000000 wei

npx github:yuniyunanie250-lgtm/wei-format 30000000000 gwei
# 30 gwei

npx github:yuniyunanie250-lgtm/wei-format parse 1.5 ether
# 1500000000000000000
```

As a library:

```js
import { parseUnits, formatUnits, convert } from "wei-format";
parseUnits("0.1", "ether");        // 100000000000000000n
formatUnits(1500000000000000000n, "ether"); // "1.5"
convert(1n, "ether", "gwei");      // 1000000000n
```

## Behaviour worth knowing

- **Too many decimals is an error**, not a silent round. `parseUnits("0.0000000001",
  "gwei")` throws rather than returning `0n`, because quietly dropping precision is
  how off-by-one-wei bugs ship.
- **Exponential notation is rejected.** `1e18` is not a decimal amount; it is a
  float, and accepting it would reintroduce the problem this library exists to
  avoid.
- **`formatUnits` trims trailing zeros** but always keeps at least one digit
  before the point, so `0n` renders as `"0"` rather than `".0"`.
- **Conversions between units are exact.** Sub-unit conversion truncates toward
  zero by integer division, which is the behaviour you want for display.

## What it does not do

- **No fiat conversion.** That needs a price feed and belongs elsewhere.
- **No currency symbol formatting.** Locale-aware grouping is a display concern.

## Development

```bash
npm test
```

## License

MIT
