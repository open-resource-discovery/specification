---
sidebar_position: 3
hide_table_of_contents: false
description: SAP pre-defined global group types.
---

# SAP Global Group Types

On SAP side we use the following group types as additional taxonomies on ORD resources:

- Data Product related
  - Business Capabilities
  - Business Processes
  - Data Packages
- CDS
  - CDS Service

## Data Product related

> <span class=".feature-status-alpha">ALPHA</span>: The following Group Types are proposals and to be considered <span class=".feature-status-alpha">ALPHA</span>. Using group types to express these taxonomies is clear, the exact group type ID, name and description needs to be aligned and approved with the taxonomy owners.

### Business Capabilities

A Business Capability describes the organization's capability to successfully perform activities, thereby achieving its business objectives and delivering value to its customers. [See Glossary](https://help.sap.com/docs/SAP_EARL/ef2378723bd449bd86f8bc6d8ac77972/0ff58f19291949cb86173875b5ea2ca4.html?state=DRAFT).

```js
{
  "groupTypes": [{
    "groupTypeId": "sap.eam:businessCapability", //exact id to be finalized
    "title": "Business Capabilities",
    "description": "TODO"
   }]
}
```

The actual business capabilities are delivered centrally SAP, based on the Enterprise Architecture content. Samples of Business Capabilities are "Finance", "Marketing", "Manufacturing", which will be published as dedicated groups:

```js
{
  "groups": [{
    "groupId": "sap.eam:businessCapability:sap.oneBcm:finance", //exact id to be finalized
    "groupTypeId": "sap.eam:businessCapability",
    "title": "Finance",
    "description": "TODO"
   },{
    "groupId": "sap.eam:businessCapability:sap.oneBcm:marketing", //exact id to be finalized
    "groupTypeId": "sap.eam:businessCapability",
    "title": "Marketing",
    "description": "TODO"
   },
   //...
   ]
}
```

### Business Processes

A combination of business activities performed to drive a business goal that creates value at the enterprise level. [See Glossary](https://help.sap.com/docs/SAP_EARL/ef2378723bd449bd86f8bc6d8ac77972/0ff58f19291949cb86173875b5ea2ca4.html?state=DRAFT).

```js
{
  "groupTypes": [{
    "groupTypeId": "sap.eam:businessProcess", //exact id to be finalized
    "title": "Business Process",
    "description": "TODO"
   }]
}
```

The actual business processes delivered centrally SAP, based on the Enterprise Architecture content. Samples of Business Capabilities are "Recruit to Retire", "Lead to Cash", "Source to Pay", which will be published as dedicated groups:

```js
{
  "groups": [{
    "groupId": "sap.eam:businessProcess:sap:h2r", //exact id to be finalized
    "groupTypeId": "sap.eam:businessProcess",
    "title": "Recruit to Retire",
    "description": "TODO"
   },{
    "groupId": "sap.eam:businessProcess:sap:l2c", //exact id to be finalized
    "groupTypeId": "sap.eam:businessProcess",
    "title": "Lead to Cash",
    "description": "TODO"
   },
   //...
   ]
}
```

### Data Package

A data package is a group of [data products](../../spec-v1/concepts/data-product.md) and additional e.g. analytical content that form together a relevant use cases.

```js
{
  "groupTypes": [{
    "groupTypeId": "sap.bdc:dataPackage", //exact id to be finalized
    "title": "Data Package",
    "description": "TODO"
   }]
}
```

The actual data packages are delivered with the applications or data platform that are producing at least the leading data products of this package. Samples are "People Analytics" or "Finance Foundation".

```js
{
  "groups": [{
    "groupId": "sap.bdc:dataPackage:sap.s4:finfdn", //exact id to be finalized
    "groupTypeId": "sap.bdc:dataPackage",
    "title": "Finance Foundation",
    "description": "TODO"
   },{
    "groupId": "sap.bdc:dataPackage:sap.sf:peopleAnalytics", //exact id to be finalized
    "groupTypeId": "sap.bdc:dataPackage",
    "title": "People Analytics",
    "description": "TODO"
   },
   //...
   ]
}
```

### Example Usage of the taxonomies in Data Products

Within a data product, we use these taxonomies in the following ways:

- with [partOfGroups](../../spec-v1/interfaces/document.md#data-product_partofgroups) we express the business capabilities, business processes and data package assignments
- via [partOfPackage](../../spec-v1/interfaces/document.md#data-product_partofpackage) we have a unique relationship to the application providing the data product, including a reference to the product, that is [assigned to the package](../../spec-v1/interfaces/document.md#package_partofproducts).
- via [industry](../../spec-v1/interfaces/document.md#data-product_industry) and [lineOfBusiness](../../spec-v1/interfaces/document.md#data-product_lineofbusiness) there is a fixed set of taxonomies for data products.

```js
 "dataProducts": [
    {
      "ordId": "sap.s4:dataProduct:CostCenter:v1",
      //...
      "partOfGroups": [
        "sap.eam:businessCapability:sap.oneBcm:finance",
        "sap.eam:businessProcess:sap:h2r",
        "sap.eam:businessProcess:sap:s2p", //data product can be part of multiple business processes or capabilities
        "sap.bdc:dataPackage:sap.s4:finfdn",
        "sap.bdc:dataPackage:sap.sf:peopleAnalytics" //data product can be part of multiple data packages
      ],
      "partOfPackage": "sap.s4:package:S4HANA:v1", //--> a package has the product assignment
      "industry": [
        "Retail",
        "Consumer Products"
      ],
      "lineOfBusiness": [
        "Sales"
      ],
   //...
   }
   //...
  ]
```

## CDS Related

### CDS Service

Defines that there is a concept for grouping "CDS Service", owned by the sap.cds authority namespace. It is used to group multiple API and event resources together that are based of the same underlying CDS model.

```js
{
  "groupTypes": [{
    "groupTypeId": "sap.cds:service",
    "title": "CAP CDS Service",
    "description": "Description of the CDS Service concept and how its correctly used for grouping..."
   }]
}
```
