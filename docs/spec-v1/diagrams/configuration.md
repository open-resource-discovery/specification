# ORD Configuration Diagram

## OpenResourceDiscoveryV1
See [OpenResourceDiscoveryV1 interface](../interfaces/configuration.md#ord-v1-support).
  ```mermaid
  classDiagram
  class OpenResourceDiscoveryV1
  style OpenResourceDiscoveryV1 stroke:#333,stroke-width:3px
  OpenResourceDiscoveryV1 *-- "0..*" V1DocumentDescription : documents
  OpenResourceDiscoveryV1 *-- "0..1" V1Capabilities : capabilities
  click OpenResourceDiscoveryV1 href "#openresourcediscoveryv1" "Go to OpenResourceDiscoveryV1"
  click V1DocumentDescription href "#v1documentdescription" "Go to V1DocumentDescription"
  click V1Capabilities href "#v1capabilities" "Go to V1Capabilities"
  ```
  

## V1DocumentDescription
See [V1DocumentDescription interface](../interfaces/configuration.md#ord-v1-document-description).
  ```mermaid
  classDiagram
  class V1DocumentDescription
  style V1DocumentDescription stroke:#333,stroke-width:3px
  OpenResourceDiscoveryV1 *-- "0..*" V1DocumentDescription : documents
  V1DocumentDescription *-- "1..*" AccessStrategy : accessStrategies
  click OpenResourceDiscoveryV1 href "#openresourcediscoveryv1" "Go to OpenResourceDiscoveryV1"
  click V1DocumentDescription href "#v1documentdescription" "Go to V1DocumentDescription"
  click AccessStrategy href "#accessstrategy" "Go to AccessStrategy"
  ```
  

## V1Capabilities
See [V1Capabilities interface](../interfaces/configuration.md#ord-v1-capabilities).
  ```mermaid
  classDiagram
  class V1Capabilities
  style V1Capabilities stroke:#333,stroke-width:3px
  OpenResourceDiscoveryV1 *-- "0..1" V1Capabilities : capabilities
  click OpenResourceDiscoveryV1 href "#openresourcediscoveryv1" "Go to OpenResourceDiscoveryV1"
  ```
  

## AccessStrategy
See [AccessStrategy interface](../interfaces/configuration.md#access-strategy).
  ```mermaid
  classDiagram
  class AccessStrategy
  style AccessStrategy stroke:#333,stroke-width:3px
  V1DocumentDescription *-- "1..*" AccessStrategy : accessStrategies
  click V1DocumentDescription href "#v1documentdescription" "Go to V1DocumentDescription"
  ```
  