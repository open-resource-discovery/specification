import assert from "node:assert/strict";
import test from "node:test";
import type { ORDOverlay } from "../../generated/spec/v1/types";
import { applyOverlayToEdmxDocument } from "../edmx";
import { applyOverlayToDocument } from "../merge";
import type { JSONValue } from "../types";
import { loadJsonFixture, loadTextFixture } from "./test-helpers";

test("applies JSONPath overlay example to OpenAPI metadata example", async () => {
	const overlay = await loadJsonFixture<ORDOverlay>(
		"examples/overlay/openapi-astronomy-api-jsonpath.overlay.json",
	);
	const target = await loadJsonFixture<JSONValue>(
		"examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json",
	);

	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: true,
		context: {
			url: "/ord/metadata/astronomy-v1.oas3.json",
			definitionType: "openapi-v3",
		},
	}) as Record<string, unknown>;

	const info = merged.info as Record<string, unknown>;
	assert.equal(info["x-overlay-note"], "Overlay applied from example file");
	assert.equal("description" in info, false);

	assert.deepEqual(merged.servers, [
		{ url: "https://overlay.example.invalid/astronomy/v1" },
	]);
});

test("applies ORD document overlay example to ORD document metadata example", async () => {
	const overlay = await loadJsonFixture<ORDOverlay>(
		"examples/overlay/ord-document-1.overlay.json",
	);
	const target = await loadJsonFixture<JSONValue>(
		"examples/documents/document-1.json",
	);

	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: true,
		context: {
			url: "/examples/documents/document-1.json",
		},
	}) as Record<string, unknown>;

	const apiResources = merged.apiResources as Array<Record<string, unknown>>;
	const astronomyApi = apiResources.find(
		(entry) => entry.ordId === "sap.foo:apiResource:astronomy:v1",
	);

	assert.ok(astronomyApi);
	assert.equal(
		astronomyApi.shortDescription,
		"Astronomy API (overlay-enriched)",
	);
	assert.equal("description" in astronomyApi, false);
	assert.deepEqual(astronomyApi.labels, { overlay: ["ord-document-example"] });

	const eventResources = merged.eventResources as Array<
		Record<string, unknown>
	>;
	const billingEvents = eventResources.find(
		(entry) => entry.ordId === "sap.foo:eventResource:BillingDocumentEvents:v1",
	);

	assert.ok(billingEvents);
	assert.deepEqual(billingEvents.labels, { overlay: ["billing-events"] });
});

test("applies operation selector (OpenAPI) overlay example to OpenAPI metadata example", async () => {
	const overlay = await loadJsonFixture<ORDOverlay>(
		"examples/overlay/openapi-astronomy-api.overlay.json",
	);
	const target = await loadJsonFixture<JSONValue>(
		"examples/implementation/nginx-no-auth/metadata/astronomy-v1.oas3.json",
	);

	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: true,
		context: {
			ordId: "sap.foo:apiResource:astronomy:v1",
			definitionType: "openapi-v3",
		},
	}) as Record<string, unknown>;

	// Verify root selector patch: contact info and security scheme
	const info = merged.info as Record<string, unknown>;
	const contact = info.contact as Record<string, unknown>;
	assert.ok(contact, "info.contact should exist after root selector patch");
	assert.equal(contact.name, "Astronomy API Support");
	assert.equal(contact.email, "astronomy-api@sap.com");

	const components = merged.components as Record<string, unknown>;
	const securitySchemes = components.securitySchemes as Record<
		string,
		Record<string, unknown>
	>;
	assert.ok(
		securitySchemes,
		"components.securitySchemes should exist after root selector patch",
	);
	assert.ok(securitySchemes.OAuth2, "OAuth2 security scheme should exist");
	assert.equal(securitySchemes.OAuth2.type, "oauth2");

	// Verify operation selector patch
	const paths = merged.paths as Record<
		string,
		Record<string, Record<string, unknown>>
	>;
	const deprecatedOp =
		paths["/constellations/by-abbreviation/{abbreviation}"]?.get;
	assert.ok(
		deprecatedOp,
		"operation getConstellationByAbbreviation should exist",
	);
	assert.equal(deprecatedOp.deprecated, true);
	assert.equal(typeof deprecatedOp["x-deprecation-notice"], "string");

	// Verify jsonPath selector patches
	const schemas = components.schemas as Record<string, Record<string, unknown>>;
	const magnitude = (
		schemas.Star.properties as Record<string, Record<string, unknown>>
	).magnitude;
	assert.equal(typeof magnitude.description, "string");
	assert.equal(magnitude["x-sap-visibility"], "public");

	assert.ok(
		(schemas.Constellation as Record<string, unknown>).externalDocs,
		"Constellation should have externalDocs",
	);
});

test("applies operation selector (A2A) overlay example to A2A Agent Card example", async () => {
	const overlay = await loadJsonFixture<ORDOverlay>(
		"examples/overlay/a2a-dispute-agent.overlay.json",
	);
	const target = await loadJsonFixture<JSONValue>(
		"examples/definitions/DisputeResolutionAgentcard.json",
	);

	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: true,
		context: {
			ordId: "sap.foo:apiResource:FICADisputeResolutionAgent:v1",
			definitionType: "a2a-agent-card",
		},
	}) as Record<string, unknown>;

	const skills = merged.skills as Array<Record<string, unknown>>;

	const resolutionSkill = skills.find(
		(s) => s.id === "dispute-case-resolution",
	);
	assert.ok(resolutionSkill, "dispute-case-resolution skill should exist");
	assert.ok(
		typeof resolutionSkill.description === "string" &&
			resolutionSkill.description.includes("Prerequisites"),
	);
	assert.ok(
		Array.isArray(resolutionSkill.examples),
		"examples should be a merged array",
	);

	const recalcSkill = skills.find((s) => s.id === "invoice-recalculation");
	assert.ok(recalcSkill, "invoice-recalculation skill should exist");
	assert.ok(
		typeof recalcSkill.description === "string" &&
			recalcSkill.description.includes("deterministic"),
	);

	const legacySkill = skills.find((s) => s.id === "legacy-dispute-lookup");
	assert.equal(
		legacySkill,
		undefined,
		"legacy-dispute-lookup skill should have been removed",
	);
});

// ─── CSN Interop selector tests ─────────────────────────────────────────────

test("applies entityType + propertyType selectors (CSN Interop) overlay example to airline CSN document", async () => {
	const overlay = await loadJsonFixture<ORDOverlay>(
		"examples/overlay/csn-interop-airline.overlay.json",
	);
	const target = await loadJsonFixture<JSONValue>(
		"src/overlay-merge/tests/fixtures/airline.csn-interop.json",
	);

	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: true,
		context: {
			ordId: "sap.foo:apiResource:AirlineService:v1",
			definitionType: "sap-csn-interop-effective-v1",
		},
	}) as Record<string, unknown>;

	const definitions = merged.definitions as Record<
		string,
		Record<string, unknown>
	>;

	// entityType patch: AirlineService.Airline doc should be updated
	const airline = definitions["AirlineService.Airline"];
	assert.ok(airline, "AirlineService.Airline should exist");
	assert.ok(
		typeof airline.doc === "string" &&
			airline.doc.includes("IATA airline code"),
		`AirlineService.Airline.doc should describe IATA, got: ${airline.doc}`,
	);
	assert.equal(airline["@EndUserText.label"], "Airline");

	// propertyType patch: AirlineID.doc should be updated
	const elements = airline.elements as Record<string, Record<string, unknown>>;
	assert.ok(
		typeof elements.AirlineID.doc === "string" &&
			elements.AirlineID.doc.includes("IATA airline code"),
		"AirlineID.doc should describe IATA code",
	);

	// propertyType patch: Name.doc should be updated
	assert.ok(
		typeof elements.Name.doc === "string" && elements.Name.doc.includes("IATA"),
		"Name.doc should reference IATA registration",
	);

	// entityType patch: AirlineService.Airport.doc should be updated
	const airport = definitions["AirlineService.Airport"];
	assert.ok(airport, "AirlineService.Airport should exist");
	assert.ok(
		typeof airport.doc === "string" &&
			airport.doc.includes("IATA airport code"),
		"AirlineService.Airport.doc should describe IATA airport code",
	);
});

// ─── CSDL JSON selector tests ────────────────────────────────────────────────

test("applies entityType + propertyType + operation selectors (CSDL JSON) to OData CSDL JSON document", async () => {
	const overlay = await loadJsonFixture<ORDOverlay>(
		"examples/overlay/edmx-example-service.overlay.json",
	);
	const target = await loadJsonFixture<JSONValue>(
		"src/overlay-merge/tests/fixtures/ExampleService.csdl.json",
	);

	// The overlay targets "edmx" but the same patches apply to the CSDL JSON representation.
	// We override definitionType via context and skip the target-match check.
	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: false,
		context: {
			definitionType: "csdl-json",
		},
	}) as Record<string, unknown>;

	const demoNs = merged["OData.Demo"] as Record<
		string,
		Record<string, unknown>
	>;

	// entityType patch: Customer should have @Core.Description
	const customer = demoNs.Customer;
	assert.ok(customer, "Customer entity type should exist");
	assert.ok(
		typeof customer["@Core.Description"] === "string" &&
			customer["@Core.Description"].includes("person"),
		`Customer should have @Core.Description, got: ${customer["@Core.Description"]}`,
	);

	// propertyType patch: Customer.CountryName should have updated @Core.Description
	const countryName = customer.CountryName as Record<string, unknown>;
	assert.ok(
		typeof countryName["@Core.Description"] === "string" &&
			countryName["@Core.Description"].includes("Country"),
		"CountryName should have @Core.Description",
	);

	// propertyType patch: Customer.Fax should have @Core.Revisions
	const fax = customer.Fax as Record<string, unknown>;
	assert.ok(
		Array.isArray(fax["@Core.Revisions"]),
		"Fax should have @Core.Revisions array",
	);
	const firstRevision = (
		fax["@Core.Revisions"] as Record<string, unknown>[]
	)[0];
	assert.equal(firstRevision.Kind, "Deprecated");

	// entityType patch: Product should have @Core.Description
	const product = demoNs.Product;
	assert.ok(
		typeof product["@Core.Description"] === "string" &&
			product["@Core.Description"].includes("sellable"),
		"Product should have @Core.Description",
	);

	// entityType patch: LeaveRequest should have @Core.Description
	const leaveRequest = demoNs.LeaveRequest;
	assert.ok(
		typeof leaveRequest["@Core.Description"] === "string",
		"LeaveRequest should have @Core.Description",
	);

	// operation patch: Approval action overload should have @Core.Description
	const approvalOverloads = demoNs.Approval as unknown as Array<
		Record<string, unknown>
	>;
	assert.ok(Array.isArray(approvalOverloads), "Approval should be an array");
	assert.ok(
		typeof approvalOverloads[0]["@Core.Description"] === "string" &&
			approvalOverloads[0]["@Core.Description"].includes("leave request"),
		"Approval should have @Core.Description",
	);

	// operation patch: Rejection action should have @Core.Description
	const rejectionOverloads = demoNs.Rejection as unknown as Array<
		Record<string, unknown>
	>;
	assert.ok(
		typeof rejectionOverloads[0]["@Core.Description"] === "string" &&
			rejectionOverloads[0]["@Core.Description"].includes("rejection reason"),
		"Rejection should have @Core.Description",
	);
});

// ─── EDMX XML selector tests ─────────────────────────────────────────────────

test("applies entityType + propertyType + operation selectors (EDMX) to OData EDMX XML document", async () => {
	const overlay = await loadJsonFixture<ORDOverlay>(
		"examples/overlay/edmx-example-service.overlay.json",
	);
	const xmlInput = await loadTextFixture(
		"src/overlay-merge/tests/fixtures/ExampleService.edmx.xml",
	);

	const xmlOutput = applyOverlayToEdmxDocument(xmlInput, overlay, {
		noMatchBehavior: "error",
	});

	// Re-parse output to verify annotations were added
	const { XMLParser } = await import("fast-xml-parser");
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		parseAttributeValue: false,
		isArray: (tagName) =>
			[
				"Schema",
				"EntityType",
				"ComplexType",
				"Action",
				"Function",
				"Property",
				"NavigationProperty",
				"Annotation",
				"PropertyValue",
				"Record",
				"Parameter",
			].includes(tagName),
	});

	const tree = parser.parse(xmlOutput) as Record<string, unknown>;
	const edmx = tree["edmx:Edmx"] as Record<string, unknown>;
	const ds = edmx["edmx:DataServices"] as Record<string, unknown>;
	const schema = (ds.Schema as unknown[])[0] as Record<string, unknown>;

	// entityType patch: Customer should have Annotation for Core.Description
	const entityTypes = schema.EntityType as Array<Record<string, unknown>>;
	const customer = entityTypes.find((e) => e["@_Name"] === "Customer");
	assert.ok(customer, "Customer EntityType should exist");
	const customerAnnotations = customer.Annotation as Array<
		Record<string, unknown>
	>;
	assert.ok(
		Array.isArray(customerAnnotations),
		"Customer should have Annotation array",
	);
	const coreDescAnnotation = customerAnnotations.find(
		(a) => a["@_Term"] === "Core.Description",
	);
	assert.ok(
		coreDescAnnotation,
		"Customer should have Core.Description annotation",
	);
	assert.ok(
		typeof coreDescAnnotation["String"] === "string" &&
			(coreDescAnnotation["String"] as string).includes("person"),
		"Customer Core.Description should mention person",
	);

	// propertyType patch: Customer.Fax should have Core.Revisions annotation
	const faxProp = (customer.Property as Array<Record<string, unknown>>).find(
		(p) => p["@_Name"] === "Fax",
	);
	assert.ok(faxProp, "Fax property should exist on Customer");
	const faxAnnotations = faxProp.Annotation as Array<Record<string, unknown>>;
	assert.ok(
		Array.isArray(faxAnnotations),
		"Fax property should have Annotation array",
	);
	const revisionsAnnotation = faxAnnotations.find(
		(a) => a["@_Term"] === "Core.Revisions",
	);
	assert.ok(revisionsAnnotation, "Fax should have Core.Revisions annotation");

	// operation patch: Approval Action should have Core.Description annotation
	const actions = schema.Action as Array<Record<string, unknown>>;
	const approval = actions.find((a) => a["@_Name"] === "Approval");
	assert.ok(approval, "Approval Action should exist");
	const approvalAnnotations = approval.Annotation as Array<
		Record<string, unknown>
	>;
	assert.ok(
		Array.isArray(approvalAnnotations),
		"Approval Action should have Annotation array",
	);
	const approvalDesc = approvalAnnotations.find(
		(a) => a["@_Term"] === "Core.Description",
	);
	assert.ok(approvalDesc, "Approval should have Core.Description annotation");
});

// ─── BusinessPartner EDMX overlay tests ──────────────────────────────────────

test("applies business-partner EDMX overlay: entityType and propertyType patches with various annotation shapes", async () => {
	const overlay = await loadJsonFixture<ORDOverlay>(
		"examples/overlay/edmx-business-partner.overlay.json",
	);
	const xmlInput = await loadTextFixture(
		"src/overlay-merge/tests/fixtures/BusinessPartner.edmx.xml",
	);

	const xmlOutput = applyOverlayToEdmxDocument(xmlInput, overlay, {
		noMatchBehavior: "error",
	});

	const { XMLParser } = await import("fast-xml-parser");
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		parseAttributeValue: false,
		isArray: (tagName) =>
			[
				"Schema",
				"EntityType",
				"ComplexType",
				"Action",
				"Function",
				"Property",
				"NavigationProperty",
				"Annotation",
				"PropertyValue",
				"Record",
				"Collection",
			].includes(tagName),
	});

	const tree = parser.parse(xmlOutput) as Record<string, unknown>;
	assert.ok(tree["edmx:Edmx"], "output should be well-formed EDMX");

	const schema = (
		(tree["edmx:Edmx"] as Record<string, unknown>)[
			"edmx:DataServices"
		] as Record<string, unknown>
	).Schema as Array<Record<string, unknown>>;
	const entityTypes = schema[0].EntityType as Array<Record<string, unknown>>;
	const findET = (name: string) =>
		entityTypes.find((e) => e["@_Name"] === name);
	const findProp = (et: Record<string, unknown>, name: string) =>
		(et.Property as Array<Record<string, unknown>>).find(
			(p) => p["@_Name"] === name,
		);
	const getAnns = (el: Record<string, unknown>) =>
		(el.Annotation as Array<Record<string, unknown>>) ?? [];

	// patch 1: entityType A_BusinessPartnerType gets Core.Description and Core.LongDescription
	const bpET = findET("A_BusinessPartnerType");
	assert.ok(bpET, "A_BusinessPartnerType should exist");
	const bpAnns = getAnns(bpET);
	assert.ok(
		bpAnns.some((a) => a["@_Term"] === "Core.Description"),
		"A_BusinessPartnerType should have Core.Description",
	);
	assert.ok(
		bpAnns.some((a) => a["@_Term"] === "Core.LongDescription"),
		"A_BusinessPartnerType should have Core.LongDescription",
	);
	const coreDescAnn = bpAnns.find((a) => a["@_Term"] === "Core.Description");
	assert.ok(
		typeof (coreDescAnn as Record<string, unknown>)?.String === "string" &&
			((coreDescAnn as Record<string, unknown>).String as string) !== "",
		"Core.Description should have a non-empty <String> child",
	);

	// patch 2: LegacySearchTerm1 gets Core.Revisions as Collection/Record/PropertyValue
	const legacyProp = findProp(bpET, "LegacySearchTerm1");
	assert.ok(legacyProp, "LegacySearchTerm1 should exist");
	const legacyAnns = getAnns(legacyProp);
	const revisionsAnn = legacyAnns.find((a) => a["@_Term"] === "Core.Revisions");
	assert.ok(revisionsAnn, "LegacySearchTerm1 should have Core.Revisions");
	const collection = (revisionsAnn as Record<string, unknown>)
		.Collection as Array<Record<string, unknown>>;
	assert.ok(
		Array.isArray(collection) && collection.length > 0,
		"Core.Revisions should have a Collection",
	);
	const records = collection[0].Record as Array<Record<string, unknown>>;
	assert.ok(
		Array.isArray(records) && records.length > 0,
		"Collection should contain Records",
	);
	const pvs = records[0].PropertyValue as Array<Record<string, unknown>>;
	const versionPV = pvs.find((pv) => pv["@_Property"] === "Version");
	assert.ok(versionPV, "Record should have Version PropertyValue");
	assert.equal(
		(versionPV as Record<string, unknown>).String,
		"2.0.0",
		"Version should be 2.0.0",
	);
	const kindPV = pvs.find((pv) => pv["@_Property"] === "Kind");
	assert.equal(
		(kindPV as Record<string, unknown>).String,
		"Deprecated",
		"Kind should be Deprecated",
	);

	// patch 3: CreditScore gets Core.Description (String), Common.FieldControl (EnumMember), PersonalData.IsPotentiallyPersonalData (Bool)
	const creditProp = findProp(bpET, "CreditScore");
	assert.ok(creditProp, "CreditScore should exist");
	const creditAnns = getAnns(creditProp);
	assert.ok(
		creditAnns.some((a) => a["@_Term"] === "Core.Description"),
		"CreditScore should have Core.Description",
	);

	const fieldControlAnn = creditAnns.find(
		(a) => a["@_Term"] === "Common.FieldControl",
	);
	assert.ok(fieldControlAnn, "CreditScore should have Common.FieldControl");
	assert.equal(
		(fieldControlAnn as Record<string, unknown>).EnumMember,
		"Common.FieldControlType/ReadOnly",
		"Common.FieldControl should use EnumMember",
	);

	const personalDataAnn = creditAnns.find(
		(a) => a["@_Term"] === "PersonalData.IsPotentiallyPersonalData",
	);
	assert.ok(
		personalDataAnn,
		"CreditScore should have PersonalData.IsPotentiallyPersonalData",
	);
	assert.equal(
		(personalDataAnn as Record<string, unknown>)["@_Bool"],
		"true",
		"PersonalData.IsPotentiallyPersonalData Bool should be 'true' (regression: must not collapse to bare attribute)",
	);

	// negative: SearchTerm1 and A_BusinessPartnerAddressType should not be patched
	const searchProp = findProp(bpET, "SearchTerm1");
	assert.ok(searchProp, "SearchTerm1 should exist");
	assert.equal(
		getAnns(searchProp).length,
		0,
		"SearchTerm1 should have no annotations",
	);

	const addrET = findET("A_BusinessPartnerAddressType");
	assert.ok(addrET, "A_BusinessPartnerAddressType should exist");
	assert.equal(
		getAnns(addrET).length,
		0,
		"A_BusinessPartnerAddressType should have no annotations",
	);
});

// ─── DEFECT_0001 EDMX overlay tests ──────────────────────────────────────────

test("applies DEFECT EDMX overlay to real SAP EDMX: entity and property annotations injected, pre-existing annotations preserved", async () => {
	const overlay: ORDOverlay = {
		ordOverlay: "0.1",
		ordId: "sap.foo:overlay:defect-odata:v1",
		target: {
			ordId: "sap.foo:apiResource:DefectODataV4:v1",
			definitionType: "edmx",
		},
		patches: [
			{
				action: "merge",
				selector: { entityType: "Defect_Type" },
				data: {
					"@Core.Description":
						"Represents a production defect recorded during inspection or manufacturing. A defect is linked to an inspection lot and may initiate a quality issue resolution workflow.",
					"@Core.LongDescription":
						"Defects are the central entity for quality management. Each defect records the defect code, category, quantity, and lifecycle status. Defects may be associated with manufacturing orders, work centers, and inspection characteristics.",
				} as never,
			},
			{
				action: "merge",
				selector: { propertyType: "DefectText", entityType: "Defect_Type" },
				data: {
					"@Core.Description":
						"Short human-readable description of the defect. Used for display in defect lists and notifications.",
				} as never,
			},
			{
				action: "merge",
				selector: {
					propertyType: "DefectLifecycleStatus",
					entityType: "Defect_Type",
				},
				data: {
					"@Core.Description":
						"Current lifecycle state of the defect. Allowed transitions are controlled by the bound actions SetDefectLifecycleStatusToCompleted, SetDefectLifecycleStatusToInProcess, and SetDefectLifecycleStatusToNotRelevant.",
				} as never,
			},
			{
				action: "merge",
				selector: {
					propertyType: "QualityIssueReference",
					entityType: "Defect_Type",
				},
				data: {
					"@Core.Description":
						"Optional external reference number linking this defect to a quality issue in an external system (e.g. a ticket or quality notification ID).",
				} as never,
			},
			{
				action: "merge",
				selector: { entityType: "DefectDetailedDescription_Type" },
				data: {
					"@Core.Description":
						"Long-text description attached to a defect, supporting multiple languages. Each entry is keyed by the defect ID, a counter, and a language key.",
				} as never,
			},
			{
				action: "merge",
				selector: {
					propertyType: "DefectLongText",
					entityType: "DefectDetailedDescription_Type",
				},
				data: {
					"@Core.Description":
						"Full rich-text long description of the defect in the language specified by the Language key. Stored as plain text, not HTML.",
				} as never,
			},
		],
	};
	// Minimal but representative EDMX covering the two entity types targeted by the overlay.
	// Includes a schema-level Annotation and outer <Annotations> blocks to verify they are preserved.
	const xmlInput = `<?xml version="1.0" encoding="utf-8"?><edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx" xmlns="http://docs.oasis-open.org/odata/ns/edm"><edmx:DataServices><Schema Namespace="com.sap.gateway.srvd_a2x.api_defect.v0001" Alias="SAP__self"><Annotation Term="SAP__core.SchemaVersion" String="1.3.0"/><EntityType Name="Defect_Type"><Key><PropertyRef Name="DefectInternalID"/></Key><Property Name="DefectInternalID" Type="Edm.String" Nullable="false" MaxLength="12"/><Property Name="DefectText" Type="Edm.String" Nullable="false" MaxLength="40"/><Property Name="DefectLifecycleStatus" Type="Edm.String" Nullable="false" MaxLength="2"/><Property Name="QualityIssueReference" Type="Edm.String" Nullable="false" MaxLength="40"/></EntityType><EntityType Name="DefectDetailedDescription_Type"><Key><PropertyRef Name="DefectInternalID"/><PropertyRef Name="LongTextInternalNumber"/><PropertyRef Name="Language"/></Key><Property Name="DefectInternalID" Type="Edm.String" Nullable="false" MaxLength="12"/><Property Name="LongTextInternalNumber" Type="Edm.Int16" Nullable="false"/><Property Name="Language" Type="Edm.String" Nullable="false" MaxLength="2"/><Property Name="DefectLongText" Type="Edm.String" Nullable="false"/></EntityType><Annotations Target="SAP__self.Defect_Type/DefectInternalID"><Annotation Term="SAP__common.Label" String="Internal Defect ID"/></Annotations></Schema></edmx:DataServices></edmx:Edmx>`;

	const xmlOutput = applyOverlayToEdmxDocument(xmlInput, overlay, {
		noMatchBehavior: "error",
	});

	const { XMLParser } = await import("fast-xml-parser");
	const ALWAYS = new Set([
		"Schema",
		"EntityType",
		"ComplexType",
		"Action",
		"Function",
		"Property",
		"NavigationProperty",
		"Annotation",
		"PropertyValue",
		"Record",
		"Annotations",
	]);
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		parseAttributeValue: false,
		isArray: (tagName) => ALWAYS.has(tagName),
	});

	const tree = parser.parse(xmlOutput) as Record<string, unknown>;
	assert.ok(tree["edmx:Edmx"], "output should be well-formed EDMX");

	const schema = (
		(tree["edmx:Edmx"] as Record<string, unknown>)[
			"edmx:DataServices"
		] as Record<string, unknown>
	).Schema as Array<Record<string, unknown>>;
	const entityTypes = schema[0].EntityType as Array<Record<string, unknown>>;
	const findET = (name: string) =>
		entityTypes.find((e) => e["@_Name"] === name);
	const findProp = (et: Record<string, unknown>, name: string) =>
		(et.Property as Array<Record<string, unknown>>).find(
			(p) => p["@_Name"] === name,
		);
	const getAnns = (el: Record<string, unknown>) =>
		(el.Annotation as Array<Record<string, unknown>>) ?? [];
	const findAnn = (el: Record<string, unknown>, term: string) =>
		getAnns(el).find((a) => a["@_Term"] === term);

	// patch 1: Defect_Type gets Core.Description and Core.LongDescription
	const defectET = findET("Defect_Type");
	assert.ok(defectET, "Defect_Type should exist");
	const coreDescAnn = findAnn(defectET, "Core.Description");
	assert.ok(coreDescAnn, "Defect_Type should have Core.Description");
	assert.ok(
		typeof (coreDescAnn as Record<string, unknown>).String === "string" &&
			((coreDescAnn as Record<string, unknown>).String as string).includes(
				"defect",
			),
		"Core.Description should mention 'defect'",
	);
	assert.ok(
		findAnn(defectET, "Core.LongDescription"),
		"Defect_Type should have Core.LongDescription",
	);

	// patch 2: Defect_Type.DefectText gets Core.Description
	const defectTextProp = findProp(defectET, "DefectText");
	assert.ok(defectTextProp, "DefectText property should exist");
	assert.ok(
		findAnn(defectTextProp, "Core.Description"),
		"DefectText should have Core.Description",
	);

	// patch 3: Defect_Type.DefectLifecycleStatus gets Core.Description
	const statusProp = findProp(defectET, "DefectLifecycleStatus");
	assert.ok(statusProp, "DefectLifecycleStatus should exist");
	assert.ok(
		findAnn(statusProp, "Core.Description"),
		"DefectLifecycleStatus should have Core.Description",
	);

	// patch 4: Defect_Type.QualityIssueReference gets Core.Description
	const qualityProp = findProp(defectET, "QualityIssueReference");
	assert.ok(qualityProp, "QualityIssueReference should exist");
	assert.ok(
		findAnn(qualityProp, "Core.Description"),
		"QualityIssueReference should have Core.Description",
	);

	// patch 5: DefectDetailedDescription_Type gets Core.Description
	const ddET = findET("DefectDetailedDescription_Type");
	assert.ok(ddET, "DefectDetailedDescription_Type should exist");
	assert.ok(
		findAnn(ddET, "Core.Description"),
		"DefectDetailedDescription_Type should have Core.Description",
	);

	// patch 6: DefectDetailedDescription_Type.DefectLongText gets Core.Description
	const longTextProp = findProp(ddET, "DefectLongText");
	assert.ok(longTextProp, "DefectLongText should exist");
	assert.ok(
		findAnn(longTextProp, "Core.Description"),
		"DefectLongText should have Core.Description",
	);

	// negative: properties without patches should have no inline annotations
	const defectInternalProp = findProp(defectET, "DefectInternalID");
	assert.ok(defectInternalProp, "DefectInternalID should exist");
	assert.equal(
		getAnns(defectInternalProp).length,
		0,
		"DefectInternalID must not acquire spurious annotations (pre-existing labels are in <Annotations> blocks, not inline)",
	);

	// pre-existing <Annotations> blocks (outer, not inline) should still be present in output
	const outerAnnotations = schema[0].Annotations as Array<
		Record<string, unknown>
	>;
	assert.ok(
		Array.isArray(outerAnnotations) && outerAnnotations.length > 0,
		"outer <Annotations> blocks should be preserved in output",
	);
	const schemaVersionAnn = schema[0].Annotation as Array<
		Record<string, unknown>
	>;
	assert.ok(
		Array.isArray(schemaVersionAnn) &&
			schemaVersionAnn.some((a) => a["@_Term"] === "SAP__core.SchemaVersion"),
		"schema-level SAP__core.SchemaVersion annotation should be preserved",
	);
});

// ─── EDMX-specific unit tests ─────────────────────────────────────────────────

test("EDMX: unmatched selector throws with noMatchBehavior error (default)", async () => {
	const xmlInput = await loadTextFixture(
		"src/overlay-merge/tests/fixtures/BusinessPartner.edmx.xml",
	);
	const overlay = await loadJsonFixture<ORDOverlay>(
		"examples/overlay/edmx-business-partner.overlay.json",
	);

	// Replace entity type name with one that doesn't exist to force no-match
	const brokenOverlay: ORDOverlay = {
		...overlay,
		patches: [
			{
				action: "merge",
				selector: { entityType: "NonExistent_Type" },
				data: { "@Core.Description": "should not apply" } as never,
			},
		],
	};

	assert.throws(
		() =>
			applyOverlayToEdmxDocument(xmlInput, brokenOverlay, {
				noMatchBehavior: "error",
			}),
		/did not match any target element/i,
		"should throw when entityType selector finds no match",
	);
});

test("EDMX: noMatchBehavior warn continues without throwing", async () => {
	const xmlInput = await loadTextFixture(
		"src/overlay-merge/tests/fixtures/BusinessPartner.edmx.xml",
	);
	const overlay: ORDOverlay = {
		ordOverlay: "0.1",
		patches: [
			{
				action: "merge",
				selector: { entityType: "NoSuchType" },
				data: { "@Core.Description": "ignored" } as never,
			},
		],
	};

	// Should not throw
	const result = applyOverlayToEdmxDocument(xmlInput, overlay, {
		noMatchBehavior: "warn",
	});
	assert.ok(
		typeof result === "string" && result.length > 0,
		"output should be non-empty XML string",
	);
});

test("EDMX: merging annotation that already exists replaces it, not duplicates", async () => {
	const xmlInput = await loadTextFixture(
		"src/overlay-merge/tests/fixtures/ExampleService.edmx.xml",
	);

	// CountryName already has Core.Description inline in the fixture
	const overlay: ORDOverlay = {
		ordOverlay: "0.1",
		patches: [
			{
				action: "merge",
				selector: { propertyType: "CountryName", entityType: "Customer" },
				data: { "@Core.Description": "Replaced description text" } as never,
			},
		],
	};

	const xmlOutput = applyOverlayToEdmxDocument(xmlInput, overlay, {
		noMatchBehavior: "error",
	});

	const { XMLParser } = await import("fast-xml-parser");
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		parseAttributeValue: false,
		isArray: (t) =>
			["Schema", "EntityType", "Property", "Annotation"].includes(t),
	});

	const tree = parser.parse(xmlOutput) as Record<string, unknown>;
	const schema = (
		(tree["edmx:Edmx"] as Record<string, unknown>)[
			"edmx:DataServices"
		] as Record<string, unknown>
	).Schema as Array<Record<string, unknown>>;
	const customerET = (
		schema[0].EntityType as Array<Record<string, unknown>>
	).find((e) => e["@_Name"] === "Customer");
	const countryNameProp = (
		customerET!.Property as Array<Record<string, unknown>>
	).find((p) => p["@_Name"] === "CountryName");
	const annotations =
		(countryNameProp!.Annotation as Array<Record<string, unknown>>) ?? [];

	const coreDescAnns = annotations.filter(
		(a) => a["@_Term"] === "Core.Description",
	);
	assert.equal(
		coreDescAnns.length,
		1,
		"Core.Description should appear exactly once (not duplicated)",
	);
	assert.equal(
		(coreDescAnns[0] as Record<string, unknown>).String,
		"Replaced description text",
		"Core.Description should have the replacement value",
	);
});

// ─── New concept-level selector tests ────────────────────────────────────────

test("entitySet selector patches EntitySet in CSDL JSON", async () => {
	const target = await loadJsonFixture<JSONValue>(
		"src/overlay-merge/tests/fixtures/ExampleService.csdl.json",
	);
	const overlay: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		description: "Test entitySet selector on CSDL JSON",
		patches: [
			{
				action: "merge",
				selector: { entitySet: "Customers" },
				data: {
					"@Capabilities.InsertRestrictions": {
						"@Capabilities.Insertable": false,
					},
				},
			},
		],
	};

	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: false,
		context: { definitionType: "csdl-json" },
	}) as Record<string, Record<string, Record<string, unknown>>>;

	const container = merged["OData.Demo"].Container;
	const customers = container.Customers as Record<string, unknown>;
	assert.ok(customers, "Customers EntitySet should exist");
	assert.ok(
		customers["@Capabilities.InsertRestrictions"] !== undefined,
		"Customers should have @Capabilities.InsertRestrictions after patch",
	);
});

test("entitySet selector patches EntitySet in EDMX XML", async () => {
	const xmlInput = await loadTextFixture(
		"src/overlay-merge/tests/fixtures/ExampleService.edmx.xml",
	);
	const overlay: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		description: "Test entitySet selector on EDMX",
		patches: [
			{
				action: "merge",
				selector: { entitySet: "Customers" },
				data: { "@Core.Description": "All customers" },
			},
		],
	};

	const xmlOutput = applyOverlayToEdmxDocument(xmlInput, overlay, {
		noMatchBehavior: "error",
	});

	const { XMLParser } = await import("fast-xml-parser");
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		parseAttributeValue: false,
		isArray: (tagName) =>
			["Schema", "EntitySet", "Annotation"].includes(tagName),
	});
	const tree = parser.parse(xmlOutput) as Record<string, unknown>;
	const schema = (
		(tree["edmx:Edmx"] as Record<string, unknown>)[
			"edmx:DataServices"
		] as Record<string, unknown>
	).Schema as Array<Record<string, unknown>>;
	const container = schema[0].EntityContainer as Record<string, unknown>;
	const entitySets = container.EntitySet as Array<Record<string, unknown>>;
	const customers = entitySets.find((es) => es["@_Name"] === "Customers");
	assert.ok(customers, "Customers EntitySet should exist");
	const annotations = customers!.Annotation as Array<Record<string, unknown>>;
	assert.ok(
		Array.isArray(annotations),
		"Customers should have Annotation array",
	);
	assert.ok(
		annotations.some((a) => a["@_Term"] === "Core.Description"),
		"Customers should have Core.Description annotation",
	);
});

test("namespace selector patches Schema namespace object in CSDL JSON", async () => {
	const target = await loadJsonFixture<JSONValue>(
		"src/overlay-merge/tests/fixtures/ExampleService.csdl.json",
	);
	const overlay: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		description: "Test namespace selector on CSDL JSON",
		patches: [
			{
				action: "merge",
				selector: { namespace: "OData.Demo" },
				data: { "@Core.Description": "OData Demo service" },
			},
		],
	};

	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: false,
		context: { definitionType: "csdl-json" },
	}) as Record<string, Record<string, unknown>>;

	const ns = merged["OData.Demo"];
	assert.ok(ns, "OData.Demo namespace should exist");
	assert.equal(
		ns["@Core.Description"],
		"OData Demo service",
		"Namespace should have @Core.Description after patch",
	);
});

test("namespace selector patches Schema element in EDMX XML", async () => {
	const xmlInput = await loadTextFixture(
		"src/overlay-merge/tests/fixtures/ExampleService.edmx.xml",
	);
	const overlay: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		description: "Test namespace selector on EDMX",
		patches: [
			{
				action: "merge",
				selector: { namespace: "OData.Demo" },
				data: { "@Core.Description": "OData Demo service" },
			},
		],
	};

	const xmlOutput = applyOverlayToEdmxDocument(xmlInput, overlay, {
		noMatchBehavior: "error",
	});

	const { XMLParser } = await import("fast-xml-parser");
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		parseAttributeValue: false,
		isArray: (tagName) => ["Schema", "Annotation"].includes(tagName),
	});
	const tree = parser.parse(xmlOutput) as Record<string, unknown>;
	const schema = (
		(tree["edmx:Edmx"] as Record<string, unknown>)[
			"edmx:DataServices"
		] as Record<string, unknown>
	).Schema as Array<Record<string, unknown>>;
	const annotations = schema[0].Annotation as Array<Record<string, unknown>>;
	assert.ok(Array.isArray(annotations), "Schema should have Annotation array");
	assert.ok(
		annotations.some((a) => a["@_Term"] === "Core.Description"),
		"Schema should have Core.Description annotation",
	);
});

test("enumType selector resolves EnumType in CSDL JSON", async () => {
	const target = await loadJsonFixture<JSONValue>(
		"src/overlay-merge/tests/fixtures/ExampleService.csdl.json",
	);
	const overlay: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		description: "Test EnumType via enumType selector",
		patches: [
			{
				action: "merge",
				selector: { enumType: "OData.Demo.Pattern" },
				data: { "@Core.Description": "Visual pattern enum" },
			},
		],
	};

	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: false,
		context: { definitionType: "csdl-json" },
	}) as Record<string, Record<string, unknown>>;

	const pattern = merged["OData.Demo"].Pattern as Record<string, unknown>;
	assert.ok(pattern, "Pattern EnumType should exist");
	assert.equal(
		pattern["@Core.Description"],
		"Visual pattern enum",
		"Pattern EnumType should have @Core.Description",
	);
});

test("propertyType + enumType selectors target EnumType member in CSDL JSON", async () => {
	const target = await loadJsonFixture<JSONValue>(
		"src/overlay-merge/tests/fixtures/ExampleService.csdl.json",
	);
	// For EnumType members in CSDL JSON, the member value is a number.
	// To add annotations, use "update" action to replace with an annotated object,
	// since "merge" cannot merge an object into a number.
	const overlay: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		description:
			"Test EnumType member via propertyType selector with enumType context",
		patches: [
			{
				action: "update",
				selector: { propertyType: "Yellow", enumType: "OData.Demo.Pattern" },
				data: {
					"@odata.value": 1,
					"@Core.Description": "A yellow colour pattern member",
				},
			},
		],
	};

	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: false,
		context: { definitionType: "csdl-json" },
	}) as Record<string, Record<string, unknown>>;

	const pattern = merged["OData.Demo"].Pattern as Record<string, unknown>;
	const yellow = pattern.Yellow as Record<string, unknown>;
	assert.ok(yellow, "Yellow enum member should exist");
	assert.equal(
		yellow["@Core.Description"],
		"A yellow colour pattern member",
		"Yellow member should have @Core.Description",
	);
});

test("complexType selector resolves ComplexType in CSDL JSON", async () => {
	const target = await loadJsonFixture<JSONValue>(
		"src/overlay-merge/tests/fixtures/ExampleService.csdl.json",
	);
	const overlay: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		description: "Test ComplexType via complexType selector",
		patches: [
			{
				action: "merge",
				selector: { complexType: "OData.Demo.Address" },
				data: { "@Core.Description": "Postal address structure" },
			},
		],
	};

	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: false,
		context: { definitionType: "csdl-json" },
	}) as Record<string, Record<string, unknown>>;

	const address = merged["OData.Demo"].Address as Record<string, unknown>;
	assert.ok(address, "Address ComplexType should exist");
	assert.equal(
		address["@Core.Description"],
		"Postal address structure",
		"Address ComplexType should have @Core.Description",
	);
});

test("propertyType + complexType selectors target ComplexType property in CSDL JSON", async () => {
	const target = await loadJsonFixture<JSONValue>(
		"src/overlay-merge/tests/fixtures/ExampleService.csdl.json",
	);
	const overlay: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		description:
			"Test ComplexType property via propertyType selector with complexType context",
		patches: [
			{
				action: "merge",
				selector: { propertyType: "Street", complexType: "OData.Demo.Address" },
				data: { "@Core.Description": "Street name and number" },
			},
		],
	};

	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: false,
		context: { definitionType: "csdl-json" },
	}) as Record<string, Record<string, unknown>>;

	const address = merged["OData.Demo"].Address as Record<string, unknown>;
	const street = address.Street as Record<string, unknown>;
	assert.ok(street, "Street property should exist");
	assert.equal(
		street["@Core.Description"],
		"Street name and number",
		"Street property should have @Core.Description",
	);
});

test("recursive merge: entityType with nested property annotations in CSDL JSON", async () => {
	const target = await loadJsonFixture<JSONValue>(
		"src/overlay-merge/tests/fixtures/ExampleService.csdl.json",
	);
	const overlay: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		description:
			"Test recursive merge of EntityType with all property annotations in one patch",
		patches: [
			{
				action: "merge",
				selector: { entityType: "OData.Demo.Customer" },
				data: {
					"@Core.Description": "Customer master data",
					"@Core.LongDescription":
						"Contains customer information including contact details and address.",
					Name: {
						"@Core.Description": "Customer display name",
					},
					CompanyName: {
						"@Core.Description": "Legal company name",
						"@Core.LongDescription":
							"The official registered company name for business customers.",
					},
					BirthDate: {
						"@Core.Description": "Date of birth for individual customers",
					},
				},
			},
		],
	};

	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: false,
		context: { definitionType: "csdl-json" },
	}) as Record<string, Record<string, unknown>>;

	const customer = merged["OData.Demo"].Customer as Record<string, unknown>;

	// Check entity-level annotations
	assert.equal(customer["@Core.Description"], "Customer master data");
	assert.equal(
		customer["@Core.LongDescription"],
		"Contains customer information including contact details and address.",
	);

	// Check property-level annotations
	const name = customer.Name as Record<string, unknown>;
	assert.equal(name["@Core.Description"], "Customer display name");

	const companyName = customer.CompanyName as Record<string, unknown>;
	assert.equal(companyName["@Core.Description"], "Legal company name");
	assert.equal(
		companyName["@Core.LongDescription"],
		"The official registered company name for business customers.",
	);

	const birthDate = customer.BirthDate as Record<string, unknown>;
	assert.equal(
		birthDate["@Core.Description"],
		"Date of birth for individual customers",
	);
});

test("recursive merge: entityType with nested property annotations in EDMX", async () => {
	const xmlInput = await loadTextFixture(
		"src/overlay-merge/tests/fixtures/ExampleService.edmx.xml",
	);
	const overlay: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		description:
			"Test recursive merge of EntityType with all property annotations in one patch (EDMX)",
		target: { definitionType: "edmx" },
		patches: [
			{
				action: "merge",
				selector: { entityType: "OData.Demo.Customer" },
				data: {
					"@Core.Description": "Customer master data",
					"@Core.LongDescription":
						"Contains customer information including contact details.",
					CompanyName: {
						"@Core.Description": "Legal company name",
					},
					ContactName: {
						"@Core.Description": "Primary contact person",
						"@Core.LongDescription":
							"The name of the primary contact for this customer.",
					},
				},
			},
		],
	};

	const merged = applyOverlayToEdmxDocument(xmlInput, overlay, {
		validateOverlaySemantics: false,
	});

	// Verify EntityType-level annotations
	assert.ok(
		merged.includes('Term="Core.Description"'),
		"EntityType should have Core.Description",
	);
	assert.ok(
		merged.includes("Customer master data"),
		"EntityType annotation value should be present",
	);

	// Verify property-level annotations
	assert.ok(
		merged.includes("Legal company name"),
		"CompanyName property should have annotation",
	);
	assert.ok(
		merged.includes("Primary contact person"),
		"ContactName property should have Core.Description",
	);
	assert.ok(
		merged.includes("The name of the primary contact"),
		"ContactName property should have Core.LongDescription",
	);
});

test("parameter selector targets Action parameter in CSDL JSON", async () => {
	const target = await loadJsonFixture<JSONValue>(
		"src/overlay-merge/tests/fixtures/ExampleService.csdl.json",
	);
	const overlay: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		description: "Test parameter selector on CSDL JSON",
		patches: [
			{
				action: "merge",
				selector: { parameter: "Reason", operation: "OData.Demo.Rejection" },
				data: { "@Core.Description": "Human-readable rejection reason" },
			},
		],
	};

	const merged = applyOverlayToDocument(target, overlay, {
		requireTargetMatch: false,
		context: { definitionType: "csdl-json" },
	}) as Record<string, Record<string, unknown>>;

	const rejection = (
		merged["OData.Demo"].Rejection as Array<Record<string, unknown>>
	)[0];
	const params = rejection["$Parameter"] as Array<Record<string, unknown>>;
	const reason = params.find((p) => p["$Name"] === "Reason");
	assert.ok(reason, "Reason parameter should exist");
	assert.equal(
		reason["@Core.Description"],
		"Human-readable rejection reason",
		"Reason parameter should have @Core.Description",
	);
});

test("parameter selector targets Action Parameter in EDMX XML", async () => {
	const xmlInput = await loadTextFixture(
		"src/overlay-merge/tests/fixtures/ExampleService.edmx.xml",
	);
	const overlay: ORDOverlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1",
		description: "Test parameter selector on EDMX",
		patches: [
			{
				action: "merge",
				selector: { parameter: "Reason", operation: "OData.Demo.Rejection" },
				data: { "@Core.Description": "Human-readable rejection reason" },
			},
		],
	};

	const xmlOutput = applyOverlayToEdmxDocument(xmlInput, overlay, {
		noMatchBehavior: "error",
	});

	const { XMLParser } = await import("fast-xml-parser");
	const parser = new XMLParser({
		ignoreAttributes: false,
		attributeNamePrefix: "@_",
		parseAttributeValue: false,
		isArray: (tagName) =>
			["Schema", "Action", "Parameter", "Annotation"].includes(tagName),
	});
	const tree = parser.parse(xmlOutput) as Record<string, unknown>;
	const schema = (
		(tree["edmx:Edmx"] as Record<string, unknown>)[
			"edmx:DataServices"
		] as Record<string, unknown>
	).Schema as Array<Record<string, unknown>>;
	const actions = schema[0].Action as Array<Record<string, unknown>>;
	const rejection = actions.find((a) => a["@_Name"] === "Rejection");
	assert.ok(rejection, "Rejection action should exist");
	const params = rejection!.Parameter as Array<Record<string, unknown>>;
	const reason = params.find((p) => p["@_Name"] === "Reason");
	assert.ok(reason, "Reason parameter should exist on Rejection");
	const annotations = reason!.Annotation as Array<Record<string, unknown>>;
	assert.ok(Array.isArray(annotations), "Reason should have Annotation array");
	assert.ok(
		annotations.some((a) => a["@_Term"] === "Core.Description"),
		"Reason should have Core.Description annotation",
	);
});

test("applyOverlayToEdmxDocument throws on ambiguous unqualified entityType across multiple EDMX schemas", () => {
	const xmlInput = `<?xml version="1.0" encoding="utf-8"?>
<edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx">
  <edmx:DataServices>
    <Schema Namespace="com.example.NS1" xmlns="http://docs.oasis-open.org/odata/ns/edm">
      <EntityType Name="Customer"><Key><PropertyRef Name="Id"/></Key><Property Name="Id" Type="Edm.String"/></EntityType>
    </Schema>
    <Schema Namespace="com.example.NS2" xmlns="http://docs.oasis-open.org/odata/ns/edm">
      <EntityType Name="Customer"><Key><PropertyRef Name="Id"/></Key><Property Name="Id" Type="Edm.String"/></EntityType>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>`;

	const overlay = {
		$schema:
			"https://open-resource-discovery.org/spec-extension/models/OrdOverlay.schema.json#",
		ordOverlay: "0.1" as const,
		description: "Test",
		patches: [
			{
				action: "merge" as const,
				selector: { entityType: "Customer" },
				data: { "@Core.Description": "A customer" },
			},
		] as [
			{
				action: "merge";
				selector: { entityType: string };
				data: Record<string, string>;
			},
		],
	};

	assert.throws(
		() => applyOverlayToEdmxDocument(xmlInput, overlay),
		/Ambiguous entityType selector "Customer"/,
	);
});
