# Getting Pulsar haptics into a developer's Figma MCP workflow

**Status:** research + proposal, nothing implemented.
**Written:** 2026-07-16. Figma's MCP surface moves fast — re-check the tool list before acting on this.

## The scenario

A developer implements a design with the Figma MCP server (their coding agent calls
`get_design_context` / `get_metadata` on a selection and writes the UI). The design has haptics
bound to components via the Pulsar plugin. We want the agent to also implement those haptics.

## Verdict: it does not work today

Two **independent** blockers. The second is the one that matters.

### 1. Pulsar's bindings are private to Pulsar

`figma/src/main/code.ts:507` stores each binding as private plugin data:

```ts
node.setPluginData(BINDING_KEY, JSON.stringify(binding)); // BINDING_KEY = 'pulsar:binding'
```

Per the [setPluginData docs](https://developers.figma.com/docs/plugins/api/properties/nodes-setplugindata/):

> The data is specific to your plugin ID. Plugins with other IDs won't be able to read this data.

> The data is stored privately for **stability**, not **security**. It prevents other plugins from
> accessing your data.

So nothing outside the plugin can see a binding.

### 2. Figma MCP has no channel for plugin data at all

This is the important one. The server exposes 24 tools ([Tools and
prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)):

`add_code_connect_map`, `create_new_file`, `download_assets`, `generate_diagram`,
`generate_figma_design`, `get_code_connect_map`, `get_code_connect_suggestions`,
`get_context_for_code_connect`, `get_design_context`, `get_figjam`, `get_libraries`,
`get_metadata`, `get_screenshot`, `get_shader_effect`, `get_shader_fill`, `get_variable_defs`,
`list_shader_effects`, `list_shader_fills`, `search_design_system`, `send_code_connect_mappings`,
`upload_assets`, `use_figma`, `whoami`.

**None of them returns `pluginData` or `sharedPluginData`.** `get_metadata` is documented as:

> a sparse XML representation of your selection containing just basic properties such as the layer
> IDs, names, types, position and sizes.

### The consequence worth internalising

**Switching `setPluginData` → `setSharedPluginData` does not fix this.** It's the intuitive first
move and it changes nothing for Figma MCP, because there is no tool on the other side that reads
plugin data of any kind.

The fix is not "expose our data *to* Figma MCP". It's **"give the agent a second source"** that it
consults alongside Figma MCP.

---

## Recommended: a Pulsar MCP server

The developer runs Pulsar MCP next to Figma MCP. Most of the pieces already exist.

### Why this is close to free

- The plugin **already publishes per-node bindings** to `pulsar-server.swmansion.com` for the share
  link — see `figma/src/ui/hooks/usePreviewSync.ts` (~line 315+), which builds
  `bindings[nodeId] → PresetData` plus an `elements` list carrying `nodeId`, `nodeName`,
  `presetName`.
- We **already generate per-platform SDK snippets** — `builtInSnippet(lang, name)` in
  `figma/src/ui/components/sdkSnippets.ts:34`, covering Swift, Android, KMP, React Native, Flutter
  and Web.

### Shape

```
get_haptics(fileKey, nodeIds?) -> [{ nodeId, nodeName, presetName, snippet }]
```

### Agent flow

1. Figma MCP `get_code` / `get_metadata` → generated UI **plus node IDs**.
2. Pulsar MCP `get_haptics(fileKey, thoseNodeIds)` → bound presets + ready SDK code.
3. Agent merges the haptic calls into the components it just wrote.

**The join works because node IDs are the shared key** — `get_metadata` returns layer IDs, and our
bindings are keyed by node ID. This is the linchpin of the whole approach.

### The agent needs to be told

It won't think to look. Ship a rules snippet for the developer's `CLAUDE.md` / cursor rules:
*"After generating UI from Figma, call Pulsar MCP `get_haptics` with the node IDs and wire up any
haptics it returns."*

### Two possible data sources

| Source | Needs | Works when |
| --- | --- | --- |
| **Pulsar share backend** (existing publish pipeline) | designer published a share link | preferred — no Figma token, and the payload is already shaped for this |
| **Figma REST API** | developer's Figma token | any file they can open, even if never shared |

The REST route reads our *private* data without any plugin change. The
[`plugin_data` param](https://developers.figma.com/docs/rest-api/file-endpoints/):

> A comma separated list of plugin IDs and/or the string `shared`. Any data present in the document
> written by those plugins will be included in the result in the `pluginData` and `sharedPluginData`
> properties.

Our plugin ID is public in `figma/manifest.json:3` — `1636329411590799509`.

---

## Complements (useful, not sufficient)

- **Dev Mode annotations** on bound nodes. Would make haptics visible to *humans* in the inspect
  panel, which is valuable on its own. Might reach agents via `get_design_context`. **Unverified** —
  a [forum report](https://forum.figma.com/ask-the-community-7/figma-mcp-unable-to-extract-annotation-values-from-the-design-url-46406)
  says annotations don't surface in `get_code` / `get_metadata`, with no official response.
- **Dev resources**: attach the share-preview link to bound nodes. Good for humans; unlikely to
  reach MCP output.
- **Code Connect**: can carry a haptic call inside a component's snippet, but it is *component*-level,
  not per-instance — it cannot express "this particular button has Afterglow". Also requires the dev
  to have Code Connect set up.
- **`setSharedPluginData`**: worth doing for ecosystem reasons (any tool/plugin could then read
  bindings, and `plugin_data=shared` works for third parties without knowing our ID). Note it's
  world-readable, and existing private bindings would need migrating. **Does not unblock Figma MCP.**
- **Do not** stuff preset names into layer names. It would reach the agent, but it vandalises the
  designer's file.

---

## Verification status

Be honest about what is and isn't proven.

| Claim | Status | How |
| --- | --- | --- |
| Bindings are private `pluginData` | **verified** | source: `code.ts:507` + plugin API docs |
| Figma MCP exposes no plugin-data tool | **verified (docs)** | official tool list + `get_metadata` description |
| REST `plugin_data=<our id>` returns our private bindings | **unverified** | needs a Figma token — see below |
| Annotations reach `get_design_context` | **unverified** | community report says no; no official answer |
| End-to-end agent behaviour | **not tested** | Dev Mode MCP server was off (see below) |

### Why there's no live test yet (2026-07-16)

Figma desktop was running, but the Dev Mode MCP server was **not enabled** — `127.0.0.1:3845`
refused connections.

To run the live test: Figma → Preferences → **Enable Dev Mode MCP server** (needs a Dev or Full
seat), select a node with a Pulsar binding, then call `get_design_context` and `get_metadata` and
inspect the output for anything haptics-related. That also settles the annotations question.

### The decisive REST test

Confirms whether the token-based source works with **no plugin change at all**:

```sh
curl -s -H "X-Figma-Token: $FIGMA_TOKEN" \
  "https://api.figma.com/v1/files/<FILE_KEY>/nodes?ids=<NODE_ID>&plugin_data=1636329411590799509" \
  | jq '.. | .pluginData? // empty'
```

A `pulsar:binding` entry on a bound node = REST path confirmed.

---

## Sources

- [Figma MCP — Tools and prompts](https://developers.figma.com/docs/figma-mcp-server/tools-and-prompts/)
- [Figma MCP — Introduction](https://developers.figma.com/docs/figma-mcp-server/)
- [Plugin API — setPluginData](https://developers.figma.com/docs/plugins/api/properties/nodes-setplugindata/)
- [REST API — File endpoints](https://developers.figma.com/docs/rest-api/file-endpoints/)
- [Figma blog — Introducing the Dev Mode MCP server](https://www.figma.com/blog/introducing-figma-mcp-server/)
- [Forum — MCP unable to extract annotation values](https://forum.figma.com/ask-the-community-7/figma-mcp-unable-to-extract-annotation-values-from-the-design-url-46406)
