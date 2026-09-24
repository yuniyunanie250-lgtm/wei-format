#!/usr/bin/env node
import { formatUnits, human, parseUnits, convert, UNITS } from "./wei.mjs";

const HELP = `wei-format -- exact wei/gwei/ether conversion

usage:
  wei-format <value> [unit]          format base units as a decimal string
  wei-format parse <decimal> <unit>  parse a decimal string into base units
  wei-format convert <value> <from> <to>
  wei-format units                   list known units

units: ${Object.keys(UNITS).join(", ")}

examples:
  wei-format 1000000000000000000
  wei-format 1000000000000000000 gwei
  wei-format parse 1.5 ether
  wei-format convert 100 gwei wei
`;

function main(argv) {
  const [cmd, ...rest] = argv;
  if (!cmd || cmd === "-h" || cmd === "--help") return void process.stdout.write(HELP);
  if (cmd === "units") return void console.log(Object.keys(UNITS).join("\n"));
  if (cmd === "parse") {
    const [value, unit = "ether"] = rest;
    return void console.log(parseUnits(value, unit).toString());
  }
  if (cmd === "convert") {
    const [value, from, to] = rest;
    return void console.log(convert(BigInt(value), from, to).toString());
  }
  const [unit = "ether"] = rest;
  const n = BigInt(cmd);
  console.log(human(n, unit));
  if (unit !== "wei") console.log(`${n} wei`);
}

try {
  main(process.argv.slice(2));
} catch (err) {
  console.error(`wei-format: ${err.message}`);
  process.exit(1);
}
