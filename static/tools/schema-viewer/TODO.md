There is a bug that when selecting a node I only get "Click on a node in the graph to see its details". Also sometimes it starts working,
  but when I click on another node, only the title changes, not the actual sidebar content and description of the node


Add query param which node should be the starting point, but use root node as default as is.
Don't expose this via config / ui. If a user highlights a node, the url should update to reflect this, allowing for deep links to specific nodes. Not sure how to handle the highlight / selection of edges, probably it should support both.



Make the self-relation loop edge a bit bigger, so that the edge label doesn't overlap with the node itself.
