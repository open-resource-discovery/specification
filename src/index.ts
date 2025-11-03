import * as staticDocumentSchema from "./generated/spec/v1/schemas/Document.schema.json";
import * as staticConfigurationSchema from "./generated/spec/v1/schemas/Configuration.schema.json";
import { SpecJsonSchemaRoot } from "@open-resource-discovery/spec-toolkit";

export * from "./generated/spec/v1/types";

/**
 * The JSON Schema (draft-07) describing the ORD Document interface
 */
export const ordDocumentSchema = staticDocumentSchema as unknown as SpecJsonSchemaRoot;

/**
 * The JSON Schema (draft-07) describing the ORD Configuration interface
 */
export const ordConfigurationSchema = staticConfigurationSchema as unknown as SpecJsonSchemaRoot;
