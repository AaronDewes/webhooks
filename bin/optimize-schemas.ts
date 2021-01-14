#!/usr/bin/env ts-node-transpile-only

import { strict as assert } from "assert";
import fs from "fs";
import { JSONSchema7 } from "json-schema";
import { format } from "prettier";

const payloads = "payload-schemas/schemas";

const isJsonSchemaObject = (object: unknown): object is JSONSchema7 =>
  typeof object === "object" && object !== null && !Array.isArray(object);

fs.readdirSync(payloads).forEach((event) => {
  fs.readdirSync(`${payloads}/${event}`).forEach((schema) => {
    const pathToSchema = `${payloads}/${event}/${schema}`;
    const contents = JSON.parse(fs.readFileSync(pathToSchema, "utf-8"));

    fs.writeFileSync(
      pathToSchema,
      format(
        JSON.stringify(contents, (key, value: unknown | JSONSchema7) => {
          if (!isJsonSchemaObject(value)) {
            return value;
          }

          if (value.anyOf) {
            assert.ok(!value.oneOf, "object has both oneOf & anyOf");

            // we don't have any use for anyOf, while oneOf is stricter
            value.oneOf = value.anyOf;
            delete value.anyOf;
          }

          return value;
        }),
        { parser: "json" }
      )
    );
  });
});
