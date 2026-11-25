# Dependency installation security

Use npm 11.20.0 or later for repository development.
CI bootstraps npm 11.20.0 before npm commands.
Published consumer engine requirements are unchanged.

Install from the committed lockfiles with npm ci.
Project configuration applies a two-day minimum release age and rejects dependency lifecycle scripts that have no explicit decision.
Version-specific allowScripts entries deny automatic scripts unless an existing reviewed approval is retained.
Repository pre/post build and generation commands remain enabled.
Review a dependency script and its registry identity/integrity before changing its entry to true.
Avoid scope-wide age exceptions, and use a documented package/version exception only for an urgent reviewed security fix.

Policy roots:

- .

After updating dependencies, review lockfile packages marked hasInstallScript and update the version-specific decisions.
Verify npm config get min-release-age and npm config get strict-allow-scripts in every install root.
Unsupported clients may ignore these controls; the documented development client and CI pin are part of the policy.
