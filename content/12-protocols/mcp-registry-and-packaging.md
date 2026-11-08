---
id: mcp-registry-and-packaging
book: 12
order: "12.9.1"
title: "Publishing and discovering MCP servers: the registry, server.json and bundles"
level: practitioner
stability: moving
reviewed: "2026-11"
status: seed
tags: [mcp, mcp-registry, packaging, server-discovery, supply-chain]
visuals: []
prerequisites: [building-mcp-servers]
---
> [!tldr]
> The official MCP Registry is a catalog of metadata about publicly reachable MCP servers: each entry is a `server.json` file that names the server and points to its npm, PyPI, NuGet, Cargo, container or bundle package, or to its remote URL. It hosts no code and checks who owns a name, not whether a server is safe, and it is still in preview (as of November 2026). The one thing to remember: the registry is a phone book, so hosts should read from curated subregistries and enterprises from their own.

## Key ideas

- **Metadata, not packages.** The registry launched in preview on 8 September 2025 as the official catalog of publicly accessible servers; code stays in package registries such as npm, PyPI and Docker Hub, and the registry only points to it. Private servers, on internal networks or private package registries, are out of scope; the maintainers recommend hosting your own registry for them ([The MCP Registry](https://modelcontextprotocol.io/registry/about.md); [“Introducing the MCP Registry” (2025)](https://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview/)).
- **`server.json` describes one published version.** It carries a reverse-DNS name such as `io.github.username/server-name` or `com.example/server`, a version string that must be unique and cannot be changed once published (semantic versioning is recommended, version ranges are refused), and `packages` entries with a `registryType` and a transport, or `remotes` entries with a publicly reachable URL, preferably for Streamable HTTP, since the SSE transport is deprecated ([The MCP Registry](https://modelcontextprotocol.io/registry/about.md); [Versioning published MCP servers](https://modelcontextprotocol.io/registry/versioning.md); [Publishing remote servers](https://modelcontextprotocol.io/registry/remote-servers.md)).
- **Two ownership checks.** The namespace is verified by GitHub sign-in (for `io.github.<user>/*` names) or by a domain proof, either a DNS TXT record or a file at `/.well-known/mcp-registry-auth`. Each package must then point back at the server name: `mcpName` in `package.json` for npm, an `mcp-name:` line in the README for PyPI, NuGet and Cargo, an `io.modelcontextprotocol.server.name` annotation on OCI images, and for MCPB bundles a URL containing "mcp" plus a SHA-256 hash that clients check before installing ([Registry authentication](https://modelcontextprotocol.io/registry/authentication.md); [Supported package types](https://modelcontextprotocol.io/registry/package-types.md)).
- **Built to be copied, not queried by every host.** The registry offers an unauthenticated, read-only REST API (`GET /v0.1/servers`, with cursor pagination through `nextCursor` and an `updated_since` filter) with no uptime or durability guarantees. Aggregators are expected to copy it on a regular but infrequent schedule (the docs give once per hour as an example) and add curation or extra metadata such as ratings. Those that also implement the registry's OpenAPI interface are subregistries: they can put ratings or scan results under their own `_meta` key, and they, like private registries built on the same interface, serve hosts, which are not meant to read the official registry directly ([MCP Registry Aggregators](https://modelcontextprotocol.io/registry/registry-aggregators.md); [The MCP Registry](https://modelcontextprotocol.io/registry/about.md)).
- **A listing is not an endorsement.** The moderation policy removes illegal content, malware, spam and non-functioning servers, but not buggy or vulnerable ones, and tells consumers to assume minimal to no moderation; security scanning is left to package registries and aggregators ([Moderation policy](https://modelcontextprotocol.io/registry/moderation-policy.md); [The MCP Registry](https://modelcontextprotocol.io/registry/about.md)). Enterprise allowlists can build on a private registry: GitHub Copilot, for example, can restrict clients to servers from a configured registry URL, though GitHub marks that option as a public preview and not its recommended method (as of November 2026) ([GitHub Docs, “Restrict MCP server access to a custom registry”](https://docs.github.com/en/copilot/how-tos/administer-copilot/manage-mcp-usage/restrict-based-on-registry)).
- **Bundles install, Server Cards describe.** An MCP Bundle (`.mcpb`, formerly DXT) is a zip archive holding a local server and a `manifest.json` for one-click installation, built with the `mcpb` CLI, and the format joined the MCP project in November 2025 ([modelcontextprotocol/mcpb](https://github.com/modelcontextprotocol/mcpb); [“Adopting the MCP Bundle format (.mcpb) for portable local servers” (2025)](https://blog.modelcontextprotocol.io/posts/2025-11-20-adopting-mcpb/)). A Server Card, a Beta extension as of November 2026, lets a client learn a remote server's transports and protocol versions before connecting; its format is meant to stay close to a subset of `server.json`, and clients should prefer live `server/discover` answers if the two disagree ([SEP-2127: MCP Server Cards](https://modelcontextprotocol.io/seps/2127-mcp-server-cards.md); [Server Card Working Group charter](https://modelcontextprotocol.io/community/working-groups/server-card.md)).

## Planned visuals

- **`diagram`:** the ecosystem in layers: package registries hold code, the official registry holds `server.json` records that point to them, aggregators and subregistries copy, curate and scan, hosts read the subregistries, and an enterprise runs its own private registry as an allowlist.
- **`sequence`:** publishing one server: sign in to prove the namespace, publish `server.json`, the registry checks the ownership marker in the package, and an aggregator later pages through the API with `nextCursor`.
- **`compare`:** `server.json`, an MCPB `manifest.json` and a Server Card side by side: what each describes, where it lives and who reads it.

## Talk like an expert

Experts call it a **metadata registry, not a package registry**, and talk about **namespace verification**, **ownership markers**, **subregistries** and **aggregators**, **MCPB** and **Server Cards**. They separate two questions the registry keeps apart: "who published this?", which it answers, and "is it safe to run?", which it leaves to you.

## Go deeper

- [The MCP Registry](https://modelcontextprotocol.io/registry/about.md): what the registry is for, how it relates to package registries, aggregators and hosts, and its trust model.
- [MCP Registry Supported Package Types](https://modelcontextprotocol.io/registry/package-types.md): every package type with its ownership check.
- [MCP Registry Aggregators](https://modelcontextprotocol.io/registry/registry-aggregators.md): the REST API, pagination and how to act as a subregistry.
- [modelcontextprotocol/mcpb](https://github.com/modelcontextprotocol/mcpb): the bundle specification, the CLI and the reference loader.

## Related

- [Building MCP servers](#building-mcp-servers)
- [MCP server types and catalog](#mcp-server-catalog)
- [MCP at scale](#mcp-at-scale)
- [MCP security](#mcp-security)
- [MCP extensions: the framework and the official extensions](#mcp-extensions)
- [Supply chain and model security](#supply-chain-security)
