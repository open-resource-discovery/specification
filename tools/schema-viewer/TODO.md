# Schema Viewer TODO

## Bugs
None currently known.

## Planned Features

### URL-based Deep Linking
Add query param which node should be the starting point, but use root node as default as is.
Don't expose this via config / ui. If a user highlights a node, the url should update to reflect this, allowing for deep links to specific nodes. Not sure how to handle the highlight / selection of edges, probably it should support both.

### Search Functionality
Add a search bar to quickly find and navigate to nodes by name or property.

### Raw Schema View
Add a toggle in the sidebar to view the source JSON Schema for the selected node or relationship.
