# ORD Document Diagram

## Package
See [Package interface](../interfaces/document.md#package).
  ```mermaid
  classDiagram
  class Package
  style Package stroke:#333,stroke-width:3px
  Package *-- "0..*" PackageLink : packageLinks
  Package *-- "0..*" Link : links
  Package --> "1" Vendor : vendor
  Package --> "0..*" Product : partOfProducts
  Package *-- "0..1" Labels : labels
  Package *-- "0..1" DocumentationLabels : documentationLabels
  ApiResource --> "1" Package : partOfPackage
  EventResource --> "1" Package : partOfPackage
  EntityType --> "1" Package : partOfPackage
  DataProduct --> "1" Package : partOfPackage
  Capability --> "1" Package : partOfPackage
  IntegrationDependency --> "1" Package : partOfPackage
  click Package href "#package" "Go to Package"
  click PackageLink href "#packagelink" "Go to PackageLink"
  click Link href "#link" "Go to Link"
  click Vendor href "#vendor" "Go to Vendor"
  click Product href "#product" "Go to Product"
  click Labels href "#labels" "Go to Labels"
  click DocumentationLabels href "#documentationlabels" "Go to DocumentationLabels"
  click ApiResource href "#apiresource" "Go to ApiResource"
  click EventResource href "#eventresource" "Go to EventResource"
  click EntityType href "#entitytype" "Go to EntityType"
  click DataProduct href "#dataproduct" "Go to DataProduct"
  click Capability href "#capability" "Go to Capability"
  click IntegrationDependency href "#integrationdependency" "Go to IntegrationDependency"
  ```
  

## ConsumptionBundle
See [ConsumptionBundle interface](../interfaces/document.md#consumption-bundle).
  ```mermaid
  classDiagram
  class ConsumptionBundle
  style ConsumptionBundle stroke:#333,stroke-width:3px
  ConsumptionBundle *-- "0..*" CredentialExchangeStrategy : credentialExchangeStrategies
  ConsumptionBundle *-- "0..*" Link : links
  ConsumptionBundle *-- "0..1" Labels : labels
  ConsumptionBundle *-- "0..1" DocumentationLabels : documentationLabels
  ConsumptionBundleReference --> "1" ConsumptionBundle : ordId
  ApiResource --> "0..1" ConsumptionBundle : defaultConsumptionBundle
  EventResource --> "0..1" ConsumptionBundle : defaultConsumptionBundle
  click ConsumptionBundle href "#consumptionbundle" "Go to ConsumptionBundle"
  click CredentialExchangeStrategy href "#credentialexchangestrategy" "Go to CredentialExchangeStrategy"
  click Link href "#link" "Go to Link"
  click Labels href "#labels" "Go to Labels"
  click DocumentationLabels href "#documentationlabels" "Go to DocumentationLabels"
  click ConsumptionBundleReference href "#consumptionbundlereference" "Go to ConsumptionBundleReference"
  click ApiResource href "#apiresource" "Go to ApiResource"
  click EventResource href "#eventresource" "Go to EventResource"
  ```
  

## ConsumptionBundleReference
See [ConsumptionBundleReference interface](../interfaces/document.md#consumption-bundle-reference).
  ```mermaid
  classDiagram
  class ConsumptionBundleReference
  style ConsumptionBundleReference stroke:#333,stroke-width:3px
  ConsumptionBundleReference --> "1" ConsumptionBundle : ordId
  ApiResource *-- "0..*" ConsumptionBundleReference : partOfConsumptionBundles
  EventResource *-- "0..*" ConsumptionBundleReference : partOfConsumptionBundles
  click ConsumptionBundleReference href "#consumptionbundlereference" "Go to ConsumptionBundleReference"
  click ConsumptionBundle href "#consumptionbundle" "Go to ConsumptionBundle"
  click ApiResource href "#apiresource" "Go to ApiResource"
  click EventResource href "#eventresource" "Go to EventResource"
  ```
  

## ApiResource
See [ApiResource interface](../interfaces/document.md#api-resource).
  ```mermaid
  classDiagram
  class ApiResource
  style ApiResource stroke:#333,stroke-width:3px
  ApiResource --> "1" Package : partOfPackage
  ApiResource --> "0..*" Group : partOfGroups
  ApiResource *-- "0..*" ConsumptionBundleReference : partOfConsumptionBundles
  ApiResource --> "0..1" ConsumptionBundle : defaultConsumptionBundle
  ApiResource --> "0..*" Product : partOfProducts
  ApiResource --> "0..*" ApiResource : successors
  ApiResource *-- "0..*" ChangelogEntry : changelogEntries
  ApiResource *-- "0..*" ApiResourceDefinition : resourceDefinitions
  ApiResource *-- "0..*" EntityTypeMapping : entityTypeMappings
  ApiResource *-- "0..*" APIEventResourceLink : apiResourceLinks
  ApiResource *-- "0..*" Link : links
  ApiResource *-- "0..1" Extensible : extensible
  ApiResource *-- "0..1" Labels : labels
  ApiResource *-- "0..1" DocumentationLabels : documentationLabels
  click ApiResource href "#apiresource" "Go to ApiResource"
  click Package href "#package" "Go to Package"
  click Group href "#group" "Go to Group"
  click ConsumptionBundleReference href "#consumptionbundlereference" "Go to ConsumptionBundleReference"
  click ConsumptionBundle href "#consumptionbundle" "Go to ConsumptionBundle"
  click Product href "#product" "Go to Product"
  click ChangelogEntry href "#changelogentry" "Go to ChangelogEntry"
  click ApiResourceDefinition href "#apiresourcedefinition" "Go to ApiResourceDefinition"
  click EntityTypeMapping href "#entitytypemapping" "Go to EntityTypeMapping"
  click APIEventResourceLink href "#apieventresourcelink" "Go to APIEventResourceLink"
  click Link href "#link" "Go to Link"
  click Extensible href "#extensible" "Go to Extensible"
  click Labels href "#labels" "Go to Labels"
  click DocumentationLabels href "#documentationlabels" "Go to DocumentationLabels"
  ```
  

## EventResource
See [EventResource interface](../interfaces/document.md#event-resource).
  ```mermaid
  classDiagram
  class EventResource
  style EventResource stroke:#333,stroke-width:3px
  EventResource --> "1" Package : partOfPackage
  EventResource --> "0..*" Group : partOfGroups
  EventResource *-- "0..*" ConsumptionBundleReference : partOfConsumptionBundles
  EventResource --> "0..1" ConsumptionBundle : defaultConsumptionBundle
  EventResource --> "0..*" Product : partOfProducts
  EventResource --> "0..*" EventResource : successors
  EventResource *-- "0..*" ChangelogEntry : changelogEntries
  EventResource *-- "0..*" EventResourceDefinition : resourceDefinitions
  EventResource *-- "0..*" EntityTypeMapping : entityTypeMappings
  EventResource *-- "0..*" APIEventResourceLink : eventResourceLinks
  EventResource *-- "0..*" Link : links
  EventResource *-- "0..1" Extensible : extensible
  EventResource *-- "0..1" Labels : labels
  EventResource *-- "0..1" DocumentationLabels : documentationLabels
  click EventResource href "#eventresource" "Go to EventResource"
  click Package href "#package" "Go to Package"
  click Group href "#group" "Go to Group"
  click ConsumptionBundleReference href "#consumptionbundlereference" "Go to ConsumptionBundleReference"
  click ConsumptionBundle href "#consumptionbundle" "Go to ConsumptionBundle"
  click Product href "#product" "Go to Product"
  click ChangelogEntry href "#changelogentry" "Go to ChangelogEntry"
  click EventResourceDefinition href "#eventresourcedefinition" "Go to EventResourceDefinition"
  click EntityTypeMapping href "#entitytypemapping" "Go to EntityTypeMapping"
  click APIEventResourceLink href "#apieventresourcelink" "Go to APIEventResourceLink"
  click Link href "#link" "Go to Link"
  click Extensible href "#extensible" "Go to Extensible"
  click Labels href "#labels" "Go to Labels"
  click DocumentationLabels href "#documentationlabels" "Go to DocumentationLabels"
  ```
  

## EntityType
See [EntityType interface](../interfaces/document.md#entity-type).
  ```mermaid
  classDiagram
  class EntityType
  style EntityType stroke:#333,stroke-width:3px
  EntityType --> "1" Package : partOfPackage
  EntityType --> "0..*" Group : partOfGroups
  EntityType --> "0..*" Product : partOfProducts
  EntityType --> "0..*" EntityType : successors
  EntityType *-- "0..*" ChangelogEntry : changelogEntries
  EntityType *-- "0..*" RelatedEntityType : relatedEntityTypes
  EntityType *-- "0..*" Link : links
  EntityType *-- "0..1" Extensible : extensible
  EntityType *-- "0..1" Labels : labels
  EntityType *-- "0..1" DocumentationLabels : documentationLabels
  DataProduct --> "0..*" EntityType : entityTypes
  Capability --> "0..*" EntityType : relatedEntityTypes
  RelatedEntityType --> "1" EntityType : ordId
  EntityTypeOrdIdTarget --> "1" EntityType : ordId
  click EntityType href "#entitytype" "Go to EntityType"
  click Package href "#package" "Go to Package"
  click Group href "#group" "Go to Group"
  click Product href "#product" "Go to Product"
  click ChangelogEntry href "#changelogentry" "Go to ChangelogEntry"
  click RelatedEntityType href "#relatedentitytype" "Go to RelatedEntityType"
  click Link href "#link" "Go to Link"
  click Extensible href "#extensible" "Go to Extensible"
  click Labels href "#labels" "Go to Labels"
  click DocumentationLabels href "#documentationlabels" "Go to DocumentationLabels"
  click DataProduct href "#dataproduct" "Go to DataProduct"
  click Capability href "#capability" "Go to Capability"
  click EntityTypeOrdIdTarget href "#entitytypeordidtarget" "Go to EntityTypeOrdIdTarget"
  ```
  

## DataProduct
See [DataProduct interface](../interfaces/document.md#data-product).
  ```mermaid
  classDiagram
  class DataProduct
  style DataProduct stroke:#333,stroke-width:3px
  DataProduct --> "1" Package : partOfPackage
  DataProduct --> "0..*" Group : partOfGroups
  DataProduct --> "0..*" DataProduct : successors
  DataProduct *-- "0..*" ChangelogEntry : changelogEntries
  DataProduct --> "0..*" EntityType : entityTypes
  DataProduct *-- "0..*" DataProductInputPort : inputPorts
  DataProduct *-- "1..*" DataProductOutputPort : outputPorts
  DataProduct *-- "0..*" DataProductLink : dataProductLinks
  DataProduct *-- "0..*" Link : links
  DataProduct *-- "0..1" Labels : labels
  DataProduct *-- "0..1" DocumentationLabels : documentationLabels
  click DataProduct href "#dataproduct" "Go to DataProduct"
  click Package href "#package" "Go to Package"
  click Group href "#group" "Go to Group"
  click ChangelogEntry href "#changelogentry" "Go to ChangelogEntry"
  click EntityType href "#entitytype" "Go to EntityType"
  click DataProductInputPort href "#dataproductinputport" "Go to DataProductInputPort"
  click DataProductOutputPort href "#dataproductoutputport" "Go to DataProductOutputPort"
  click DataProductLink href "#dataproductlink" "Go to DataProductLink"
  click Link href "#link" "Go to Link"
  click Labels href "#labels" "Go to Labels"
  click DocumentationLabels href "#documentationlabels" "Go to DocumentationLabels"
  ```
  

## DataProductInputPort
See [DataProductInputPort interface](../interfaces/document.md#data-product-input-port).
  ```mermaid
  classDiagram
  class DataProductInputPort
  style DataProductInputPort stroke:#333,stroke-width:3px
  DataProduct *-- "0..*" DataProductInputPort : inputPorts
  DataProductInputPort --> "1" IntegrationDependency : ordId
  click DataProduct href "#dataproduct" "Go to DataProduct"
  click DataProductInputPort href "#dataproductinputport" "Go to DataProductInputPort"
  click IntegrationDependency href "#integrationdependency" "Go to IntegrationDependency"
  ```
  

## DataProductOutputPort
See [DataProductOutputPort interface](../interfaces/document.md#data-product-output-port).
  ```mermaid
  classDiagram
  class DataProductOutputPort
  style DataProductOutputPort stroke:#333,stroke-width:3px
  DataProduct *-- "1..*" DataProductOutputPort : outputPorts
  click DataProduct href "#dataproduct" "Go to DataProduct"
  ```
  

## ApiResourceDefinition
See [ApiResourceDefinition interface](../interfaces/document.md#api-resource-definition).
  ```mermaid
  classDiagram
  class ApiResourceDefinition
  style ApiResourceDefinition stroke:#333,stroke-width:3px
  ApiResource *-- "0..*" ApiResourceDefinition : resourceDefinitions
  ApiResourceDefinition *-- "0..*" AccessStrategy : accessStrategies
  click ApiResource href "#apiresource" "Go to ApiResource"
  click ApiResourceDefinition href "#apiresourcedefinition" "Go to ApiResourceDefinition"
  click AccessStrategy href "#accessstrategy" "Go to AccessStrategy"
  ```
  

## EventResourceDefinition
See [EventResourceDefinition interface](../interfaces/document.md#event-resource-definition).
  ```mermaid
  classDiagram
  class EventResourceDefinition
  style EventResourceDefinition stroke:#333,stroke-width:3px
  EventResource *-- "0..*" EventResourceDefinition : resourceDefinitions
  EventResourceDefinition *-- "0..*" AccessStrategy : accessStrategies
  click EventResource href "#eventresource" "Go to EventResource"
  click EventResourceDefinition href "#eventresourcedefinition" "Go to EventResourceDefinition"
  click AccessStrategy href "#accessstrategy" "Go to AccessStrategy"
  ```
  

## Product
See [Product interface](../interfaces/document.md#product).
  ```mermaid
  classDiagram
  class Product
  style Product stroke:#333,stroke-width:3px
  Package --> "0..*" Product : partOfProducts
  ApiResource --> "0..*" Product : partOfProducts
  EventResource --> "0..*" Product : partOfProducts
  EntityType --> "0..*" Product : partOfProducts
  Product --> "1" Vendor : vendor
  Product --> "0..1" Product : parent
  Product *-- "0..1" Labels : labels
  Product *-- "0..1" DocumentationLabels : documentationLabels
  click Package href "#package" "Go to Package"
  click ApiResource href "#apiresource" "Go to ApiResource"
  click EventResource href "#eventresource" "Go to EventResource"
  click EntityType href "#entitytype" "Go to EntityType"
  click Product href "#product" "Go to Product"
  click Vendor href "#vendor" "Go to Vendor"
  click Labels href "#labels" "Go to Labels"
  click DocumentationLabels href "#documentationlabels" "Go to DocumentationLabels"
  ```
  

## Capability
See [Capability interface](../interfaces/document.md#capability).
  ```mermaid
  classDiagram
  class Capability
  style Capability stroke:#333,stroke-width:3px
  Capability --> "1" Package : partOfPackage
  Capability --> "0..*" Group : partOfGroups
  Capability --> "0..*" EntityType : relatedEntityTypes
  Capability *-- "0..*" CapabilityDefinition : definitions
  Capability *-- "0..*" Link : links
  Capability *-- "0..1" Labels : labels
  Capability *-- "0..1" DocumentationLabels : documentationLabels
  click Capability href "#capability" "Go to Capability"
  click Package href "#package" "Go to Package"
  click Group href "#group" "Go to Group"
  click EntityType href "#entitytype" "Go to EntityType"
  click CapabilityDefinition href "#capabilitydefinition" "Go to CapabilityDefinition"
  click Link href "#link" "Go to Link"
  click Labels href "#labels" "Go to Labels"
  click DocumentationLabels href "#documentationlabels" "Go to DocumentationLabels"
  ```
  

## CapabilityDefinition
See [CapabilityDefinition interface](../interfaces/document.md#capability-definition).
  ```mermaid
  classDiagram
  class CapabilityDefinition
  style CapabilityDefinition stroke:#333,stroke-width:3px
  Capability *-- "0..*" CapabilityDefinition : definitions
  CapabilityDefinition *-- "0..*" AccessStrategy : accessStrategies
  click Capability href "#capability" "Go to Capability"
  click CapabilityDefinition href "#capabilitydefinition" "Go to CapabilityDefinition"
  click AccessStrategy href "#accessstrategy" "Go to AccessStrategy"
  ```
  

## IntegrationDependency
See [IntegrationDependency interface](../interfaces/document.md#integration-dependency).
  ```mermaid
  classDiagram
  class IntegrationDependency
  style IntegrationDependency stroke:#333,stroke-width:3px
  DataProductInputPort --> "1" IntegrationDependency : ordId
  IntegrationDependency --> "1" Package : partOfPackage
  IntegrationDependency --> "0..*" Group : partOfGroups
  IntegrationDependency --> "0..*" IntegrationDependency : successors
  IntegrationDependency *-- "0..*" IntegrationAspect : aspects
  IntegrationDependency --> "0..*" IntegrationDependency : relatedIntegrationDependencies
  IntegrationDependency *-- "0..*" Link : links
  IntegrationDependency *-- "0..1" Labels : labels
  IntegrationDependency *-- "0..1" DocumentationLabels : documentationLabels
  click DataProductInputPort href "#dataproductinputport" "Go to DataProductInputPort"
  click IntegrationDependency href "#integrationdependency" "Go to IntegrationDependency"
  click Package href "#package" "Go to Package"
  click Group href "#group" "Go to Group"
  click IntegrationAspect href "#integrationaspect" "Go to IntegrationAspect"
  click Link href "#link" "Go to Link"
  click Labels href "#labels" "Go to Labels"
  click DocumentationLabels href "#documentationlabels" "Go to DocumentationLabels"
  ```
  

## IntegrationAspect
See [IntegrationAspect interface](../interfaces/document.md#aspect).
  ```mermaid
  classDiagram
  class IntegrationAspect
  style IntegrationAspect stroke:#333,stroke-width:3px
  IntegrationDependency *-- "0..*" IntegrationAspect : aspects
  IntegrationAspect *-- "0..*" ApiResourceIntegrationAspect : apiResources
  IntegrationAspect *-- "0..*" EventResourceIntegrationAspect : eventResources
  click IntegrationDependency href "#integrationdependency" "Go to IntegrationDependency"
  click IntegrationAspect href "#integrationaspect" "Go to IntegrationAspect"
  click ApiResourceIntegrationAspect href "#apiresourceintegrationaspect" "Go to ApiResourceIntegrationAspect"
  click EventResourceIntegrationAspect href "#eventresourceintegrationaspect" "Go to EventResourceIntegrationAspect"
  ```
  

## ApiResourceIntegrationAspect
See [ApiResourceIntegrationAspect interface](../interfaces/document.md#api-resource-integration-aspect).
  ```mermaid
  classDiagram
  class ApiResourceIntegrationAspect
  style ApiResourceIntegrationAspect stroke:#333,stroke-width:3px
  IntegrationAspect *-- "0..*" ApiResourceIntegrationAspect : apiResources
  click IntegrationAspect href "#integrationaspect" "Go to IntegrationAspect"
  ```
  

## EventResourceIntegrationAspect
See [EventResourceIntegrationAspect interface](../interfaces/document.md#event-resource-integration-aspect).
  ```mermaid
  classDiagram
  class EventResourceIntegrationAspect
  style EventResourceIntegrationAspect stroke:#333,stroke-width:3px
  IntegrationAspect *-- "0..*" EventResourceIntegrationAspect : eventResources
  EventResourceIntegrationAspect *-- "0..*" EventResourceIntegrationAspectSubset : subset
  click IntegrationAspect href "#integrationaspect" "Go to IntegrationAspect"
  click EventResourceIntegrationAspect href "#eventresourceintegrationaspect" "Go to EventResourceIntegrationAspect"
  click EventResourceIntegrationAspectSubset href "#eventresourceintegrationaspectsubset" "Go to EventResourceIntegrationAspectSubset"
  ```
  

## EventResourceIntegrationAspectSubset
See [EventResourceIntegrationAspectSubset interface](../interfaces/document.md#event-resource-integration-aspect-subset).
  ```mermaid
  classDiagram
  class EventResourceIntegrationAspectSubset
  style EventResourceIntegrationAspectSubset stroke:#333,stroke-width:3px
  EventResourceIntegrationAspect *-- "0..*" EventResourceIntegrationAspectSubset : subset
  click EventResourceIntegrationAspect href "#eventresourceintegrationaspect" "Go to EventResourceIntegrationAspect"
  ```
  

## Vendor
See [Vendor interface](../interfaces/document.md#vendor).
  ```mermaid
  classDiagram
  class Vendor
  style Vendor stroke:#333,stroke-width:3px
  Package --> "1" Vendor : vendor
  Product --> "1" Vendor : vendor
  Vendor --> "0..*" Vendor : partners
  Vendor *-- "0..1" Labels : labels
  Vendor *-- "0..1" DocumentationLabels : documentationLabels
  click Package href "#package" "Go to Package"
  click Product href "#product" "Go to Product"
  click Vendor href "#vendor" "Go to Vendor"
  click Labels href "#labels" "Go to Labels"
  click DocumentationLabels href "#documentationlabels" "Go to DocumentationLabels"
  ```
  

## ChangelogEntry
See [ChangelogEntry interface](../interfaces/document.md#changelog-entry).
  ```mermaid
  classDiagram
  class ChangelogEntry
  style ChangelogEntry stroke:#333,stroke-width:3px
  ApiResource *-- "0..*" ChangelogEntry : changelogEntries
  EventResource *-- "0..*" ChangelogEntry : changelogEntries
  EntityType *-- "0..*" ChangelogEntry : changelogEntries
  DataProduct *-- "0..*" ChangelogEntry : changelogEntries
  click ApiResource href "#apiresource" "Go to ApiResource"
  click EventResource href "#eventresource" "Go to EventResource"
  click EntityType href "#entitytype" "Go to EntityType"
  click DataProduct href "#dataproduct" "Go to DataProduct"
  ```
  

## Link
See [Link interface](../interfaces/document.md#link).
  ```mermaid
  classDiagram
  class Link
  style Link stroke:#333,stroke-width:3px
  Package *-- "0..*" Link : links
  ConsumptionBundle *-- "0..*" Link : links
  ApiResource *-- "0..*" Link : links
  EventResource *-- "0..*" Link : links
  EntityType *-- "0..*" Link : links
  DataProduct *-- "0..*" Link : links
  Capability *-- "0..*" Link : links
  IntegrationDependency *-- "0..*" Link : links
  click Package href "#package" "Go to Package"
  click ConsumptionBundle href "#consumptionbundle" "Go to ConsumptionBundle"
  click ApiResource href "#apiresource" "Go to ApiResource"
  click EventResource href "#eventresource" "Go to EventResource"
  click EntityType href "#entitytype" "Go to EntityType"
  click DataProduct href "#dataproduct" "Go to DataProduct"
  click Capability href "#capability" "Go to Capability"
  click IntegrationDependency href "#integrationdependency" "Go to IntegrationDependency"
  ```
  

## PackageLink
See [PackageLink interface](../interfaces/document.md#package-link).
  ```mermaid
  classDiagram
  class PackageLink
  style PackageLink stroke:#333,stroke-width:3px
  Package *-- "0..*" PackageLink : packageLinks
  click Package href "#package" "Go to Package"
  ```
  

## APIEventResourceLink
See [APIEventResourceLink interface](../interfaces/document.md#api-and-event-resource-link).
  ```mermaid
  classDiagram
  class APIEventResourceLink
  style APIEventResourceLink stroke:#333,stroke-width:3px
  ApiResource *-- "0..*" APIEventResourceLink : apiResourceLinks
  EventResource *-- "0..*" APIEventResourceLink : eventResourceLinks
  click ApiResource href "#apiresource" "Go to ApiResource"
  click EventResource href "#eventresource" "Go to EventResource"
  ```
  

## DataProductLink
See [DataProductLink interface](../interfaces/document.md#data-product-link).
  ```mermaid
  classDiagram
  class DataProductLink
  style DataProductLink stroke:#333,stroke-width:3px
  DataProduct *-- "0..*" DataProductLink : dataProductLinks
  click DataProduct href "#dataproduct" "Go to DataProduct"
  ```
  

## SystemInstance
See [SystemInstance interface](../interfaces/document.md#system-instance).
  ```mermaid
  classDiagram
  class SystemInstance
  style SystemInstance stroke:#333,stroke-width:3px
  SystemInstance *-- "0..1" Labels : labels
  SystemInstance *-- "0..1" DocumentationLabels : documentationLabels
  click SystemInstance href "#systeminstance" "Go to SystemInstance"
  click Labels href "#labels" "Go to Labels"
  click DocumentationLabels href "#documentationlabels" "Go to DocumentationLabels"
  ```
  

## SystemType
See [SystemType interface](../interfaces/document.md#system-type).
  ```mermaid
  classDiagram
  class SystemType
  style SystemType stroke:#333,stroke-width:3px
  SystemType *-- "0..1" Labels : labels
  SystemType *-- "0..1" DocumentationLabels : documentationLabels
  click SystemType href "#systemtype" "Go to SystemType"
  click Labels href "#labels" "Go to Labels"
  click DocumentationLabels href "#documentationlabels" "Go to DocumentationLabels"
  ```
  

## SystemVersion
See [SystemVersion interface](../interfaces/document.md#system-version).
  ```mermaid
  classDiagram
  class SystemVersion
  style SystemVersion stroke:#333,stroke-width:3px
  SystemVersion *-- "0..1" Labels : labels
  SystemVersion *-- "0..1" DocumentationLabels : documentationLabels
  click SystemVersion href "#systemversion" "Go to SystemVersion"
  click Labels href "#labels" "Go to Labels"
  click DocumentationLabels href "#documentationlabels" "Go to DocumentationLabels"
  ```
  

## AccessStrategy
See [AccessStrategy interface](../interfaces/document.md#access-strategy).
  ```mermaid
  classDiagram
  class AccessStrategy
  style AccessStrategy stroke:#333,stroke-width:3px
  ApiResourceDefinition *-- "0..*" AccessStrategy : accessStrategies
  EventResourceDefinition *-- "0..*" AccessStrategy : accessStrategies
  CapabilityDefinition *-- "0..*" AccessStrategy : accessStrategies
  click ApiResourceDefinition href "#apiresourcedefinition" "Go to ApiResourceDefinition"
  click EventResourceDefinition href "#eventresourcedefinition" "Go to EventResourceDefinition"
  click CapabilityDefinition href "#capabilitydefinition" "Go to CapabilityDefinition"
  ```
  

## CredentialExchangeStrategy
See [CredentialExchangeStrategy interface](../interfaces/document.md#credential-exchange-strategy).
  ```mermaid
  classDiagram
  class CredentialExchangeStrategy
  style CredentialExchangeStrategy stroke:#333,stroke-width:3px
  ConsumptionBundle *-- "0..*" CredentialExchangeStrategy : credentialExchangeStrategies
  click ConsumptionBundle href "#consumptionbundle" "Go to ConsumptionBundle"
  ```
  

## Labels
See [Labels interface](../interfaces/document.md#labels).
  ```mermaid
  classDiagram
  class Labels
  style Labels stroke:#333,stroke-width:3px
  Package *-- "0..1" Labels : labels
  ConsumptionBundle *-- "0..1" Labels : labels
  ApiResource *-- "0..1" Labels : labels
  EventResource *-- "0..1" Labels : labels
  EntityType *-- "0..1" Labels : labels
  DataProduct *-- "0..1" Labels : labels
  Product *-- "0..1" Labels : labels
  Capability *-- "0..1" Labels : labels
  IntegrationDependency *-- "0..1" Labels : labels
  Vendor *-- "0..1" Labels : labels
  SystemInstance *-- "0..1" Labels : labels
  SystemType *-- "0..1" Labels : labels
  SystemVersion *-- "0..1" Labels : labels
  click Package href "#package" "Go to Package"
  click ConsumptionBundle href "#consumptionbundle" "Go to ConsumptionBundle"
  click ApiResource href "#apiresource" "Go to ApiResource"
  click EventResource href "#eventresource" "Go to EventResource"
  click EntityType href "#entitytype" "Go to EntityType"
  click DataProduct href "#dataproduct" "Go to DataProduct"
  click Product href "#product" "Go to Product"
  click Capability href "#capability" "Go to Capability"
  click IntegrationDependency href "#integrationdependency" "Go to IntegrationDependency"
  click Vendor href "#vendor" "Go to Vendor"
  click SystemInstance href "#systeminstance" "Go to SystemInstance"
  click SystemType href "#systemtype" "Go to SystemType"
  click SystemVersion href "#systemversion" "Go to SystemVersion"
  ```
  

## GroupType
See [GroupType interface](../interfaces/document.md#group-type).
  ```mermaid
  classDiagram
  class GroupType
  style GroupType stroke:#333,stroke-width:3px
  Group --> "1" GroupType : groupTypeId
  Tombstone --> "0..1" GroupType : groupTypeId
  click Group href "#group" "Go to Group"
  click Tombstone href "#tombstone" "Go to Tombstone"
  ```
  

## Group
See [Group interface](../interfaces/document.md#group).
  ```mermaid
  classDiagram
  class Group
  style Group stroke:#333,stroke-width:3px
  ApiResource --> "0..*" Group : partOfGroups
  EventResource --> "0..*" Group : partOfGroups
  EntityType --> "0..*" Group : partOfGroups
  DataProduct --> "0..*" Group : partOfGroups
  Capability --> "0..*" Group : partOfGroups
  IntegrationDependency --> "0..*" Group : partOfGroups
  Group --> "1" GroupType : groupTypeId
  Tombstone --> "0..1" Group : groupId
  click ApiResource href "#apiresource" "Go to ApiResource"
  click EventResource href "#eventresource" "Go to EventResource"
  click EntityType href "#entitytype" "Go to EntityType"
  click DataProduct href "#dataproduct" "Go to DataProduct"
  click Capability href "#capability" "Go to Capability"
  click IntegrationDependency href "#integrationdependency" "Go to IntegrationDependency"
  click Group href "#group" "Go to Group"
  click GroupType href "#grouptype" "Go to GroupType"
  click Tombstone href "#tombstone" "Go to Tombstone"
  ```
  

## DocumentationLabels
See [DocumentationLabels interface](../interfaces/document.md#documentation-labels).
  ```mermaid
  classDiagram
  class DocumentationLabels
  style DocumentationLabels stroke:#333,stroke-width:3px
  Package *-- "0..1" DocumentationLabels : documentationLabels
  ConsumptionBundle *-- "0..1" DocumentationLabels : documentationLabels
  ApiResource *-- "0..1" DocumentationLabels : documentationLabels
  EventResource *-- "0..1" DocumentationLabels : documentationLabels
  EntityType *-- "0..1" DocumentationLabels : documentationLabels
  DataProduct *-- "0..1" DocumentationLabels : documentationLabels
  Product *-- "0..1" DocumentationLabels : documentationLabels
  Capability *-- "0..1" DocumentationLabels : documentationLabels
  IntegrationDependency *-- "0..1" DocumentationLabels : documentationLabels
  Vendor *-- "0..1" DocumentationLabels : documentationLabels
  SystemInstance *-- "0..1" DocumentationLabels : documentationLabels
  SystemType *-- "0..1" DocumentationLabels : documentationLabels
  SystemVersion *-- "0..1" DocumentationLabels : documentationLabels
  click Package href "#package" "Go to Package"
  click ConsumptionBundle href "#consumptionbundle" "Go to ConsumptionBundle"
  click ApiResource href "#apiresource" "Go to ApiResource"
  click EventResource href "#eventresource" "Go to EventResource"
  click EntityType href "#entitytype" "Go to EntityType"
  click DataProduct href "#dataproduct" "Go to DataProduct"
  click Product href "#product" "Go to Product"
  click Capability href "#capability" "Go to Capability"
  click IntegrationDependency href "#integrationdependency" "Go to IntegrationDependency"
  click Vendor href "#vendor" "Go to Vendor"
  click SystemInstance href "#systeminstance" "Go to SystemInstance"
  click SystemType href "#systemtype" "Go to SystemType"
  click SystemVersion href "#systemversion" "Go to SystemVersion"
  ```
  

## Extensible
See [Extensible interface](../interfaces/document.md#extensible).
  ```mermaid
  classDiagram
  class Extensible
  style Extensible stroke:#333,stroke-width:3px
  ApiResource *-- "0..1" Extensible : extensible
  EventResource *-- "0..1" Extensible : extensible
  EntityType *-- "0..1" Extensible : extensible
  click ApiResource href "#apiresource" "Go to ApiResource"
  click EventResource href "#eventresource" "Go to EventResource"
  click EntityType href "#entitytype" "Go to EntityType"
  ```
  

## EntityTypeMapping
See [EntityTypeMapping interface](../interfaces/document.md#entity-type-mapping).
  ```mermaid
  classDiagram
  class EntityTypeMapping
  style EntityTypeMapping stroke:#333,stroke-width:3px
  ApiResource *-- "0..*" EntityTypeMapping : entityTypeMappings
  EventResource *-- "0..*" EntityTypeMapping : entityTypeMappings
  EntityTypeMapping *-- "0..1" ApiModelSelectorOData : apiModelSelectors
  EntityTypeMapping *-- "0..1" ApiModelSelectorJsonPointer : apiModelSelectors
  EntityTypeMapping *-- "1" EntityTypeOrdIdTarget : entityTypeTargets
  EntityTypeMapping *-- "1" EntityTypeCorrelationIdTarget : entityTypeTargets
  click ApiResource href "#apiresource" "Go to ApiResource"
  click EventResource href "#eventresource" "Go to EventResource"
  click EntityTypeMapping href "#entitytypemapping" "Go to EntityTypeMapping"
  click ApiModelSelectorOData href "#apimodelselectorodata" "Go to ApiModelSelectorOData"
  click ApiModelSelectorJsonPointer href "#apimodelselectorjsonpointer" "Go to ApiModelSelectorJsonPointer"
  click EntityTypeOrdIdTarget href "#entitytypeordidtarget" "Go to EntityTypeOrdIdTarget"
  click EntityTypeCorrelationIdTarget href "#entitytypecorrelationidtarget" "Go to EntityTypeCorrelationIdTarget"
  ```
  

## ApiModelSelectorOData
See [ApiModelSelectorOData interface](../interfaces/document.md#api-model-selector-(odata)).
  ```mermaid
  classDiagram
  class ApiModelSelectorOData
  style ApiModelSelectorOData stroke:#333,stroke-width:3px
  EntityTypeMapping *-- "0..1" ApiModelSelectorOData : apiModelSelectors
  click EntityTypeMapping href "#entitytypemapping" "Go to EntityTypeMapping"
  ```
  

## ApiModelSelectorJsonPointer
See [ApiModelSelectorJsonPointer interface](../interfaces/document.md#api-model-selector-(json-pointer)).
  ```mermaid
  classDiagram
  class ApiModelSelectorJsonPointer
  style ApiModelSelectorJsonPointer stroke:#333,stroke-width:3px
  EntityTypeMapping *-- "0..1" ApiModelSelectorJsonPointer : apiModelSelectors
  click EntityTypeMapping href "#entitytypemapping" "Go to EntityTypeMapping"
  ```
  

## RelatedEntityType
See [RelatedEntityType interface](../interfaces/document.md#related-entity-type).
  ```mermaid
  classDiagram
  class RelatedEntityType
  style RelatedEntityType stroke:#333,stroke-width:3px
  EntityType *-- "0..*" RelatedEntityType : relatedEntityTypes
  RelatedEntityType --> "1" EntityType : ordId
  click EntityType href "#entitytype" "Go to EntityType"
  click RelatedEntityType href "#relatedentitytype" "Go to RelatedEntityType"
  ```
  

## EntityTypeOrdIdTarget
See [EntityTypeOrdIdTarget interface](../interfaces/document.md#entity-type-target-(ord-id)).
  ```mermaid
  classDiagram
  class EntityTypeOrdIdTarget
  style EntityTypeOrdIdTarget stroke:#333,stroke-width:3px
  EntityTypeMapping *-- "1" EntityTypeOrdIdTarget : entityTypeTargets
  EntityTypeOrdIdTarget --> "1" EntityType : ordId
  click EntityTypeMapping href "#entitytypemapping" "Go to EntityTypeMapping"
  click EntityTypeOrdIdTarget href "#entitytypeordidtarget" "Go to EntityTypeOrdIdTarget"
  click EntityType href "#entitytype" "Go to EntityType"
  ```
  

## EntityTypeCorrelationIdTarget
See [EntityTypeCorrelationIdTarget interface](../interfaces/document.md#entity-type-target-(correlation-id)).
  ```mermaid
  classDiagram
  class EntityTypeCorrelationIdTarget
  style EntityTypeCorrelationIdTarget stroke:#333,stroke-width:3px
  EntityTypeMapping *-- "1" EntityTypeCorrelationIdTarget : entityTypeTargets
  click EntityTypeMapping href "#entitytypemapping" "Go to EntityTypeMapping"
  ```
  

## Tombstone
See [Tombstone interface](../interfaces/document.md#tombstone).
  ```mermaid
  classDiagram
  class Tombstone
  style Tombstone stroke:#333,stroke-width:3px
  Tombstone --> "0..1" Group : groupId
  Tombstone --> "0..1" GroupType : groupTypeId
  click Tombstone href "#tombstone" "Go to Tombstone"
  click Group href "#group" "Go to Group"
  click GroupType href "#grouptype" "Go to GroupType"
  ```
  