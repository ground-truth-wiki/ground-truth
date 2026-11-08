---
id: os-level-sandboxing
book: 11
order: "11.8.1"
title: OS-level sandboxing for agents
level: expert
stability: moving
reviewed: "2026-11"
status: seed
tags: [sandboxing, linux-namespaces, seccomp, landlock, network-egress]
visuals: []
prerequisites: [sandboxes]
---
> [!tldr]
> OS-level sandboxing confines an ordinary process with operating-system features instead of a container: namespaces, seccomp and Landlock on Linux, often composed by bubblewrap, and Seatbelt profiles on macOS. Coding harnesses use it to keep an agent's shell commands inside the workspace and behind a local proxy that only lets allowlisted hosts through. Remember its edges: it covers only the processes started inside it, and a hostname allowlist without TLS inspection can leak.

## Key ideas

- **Linux gives a process its own view and its own budget.** Namespaces give a process separate mount points, process IDs, network stack, user and group IDs, IPC objects, hostname, cgroup root and clocks ([namespaces(7)](https://man7.org/linux/man-pages/man7/namespaces.7.html)), and cgroups v2 organizes processes in a hierarchy that distributes and limits CPU, memory, I/O and the number of processes ([Linux kernel: Control Group v2](https://docs.kernel.org/admin-guide/cgroup-v2.html)).
- **seccomp filters system calls; Landlock restricts access.** A seccomp-bpf filter inspects each system call and returns an action such as kill, trap, return an error, notify a user-space supervisor or allow; installing one requires `no_new_privs` or `CAP_SYS_ADMIN`, and the kernel docs state that "System call filtering isn't a sandbox", only a tool for building one ([Linux kernel: Seccomp BPF](https://docs.kernel.org/userspace-api/seccomp_filter.html)). Landlock, a stackable security module introduced in Linux 5.13, lets any process, unprivileged ones included, restrict its own access to file hierarchies and, from ABI version 4, to TCP ports, with UDP ports added in ABI version 10 ([Linux kernel: Landlock](https://docs.kernel.org/userspace-api/landlock.html)).
- **bubblewrap and Seatbelt compose the pieces.** bubblewrap starts the process in a new, empty mount namespace whose root is a tmpfs invisible from the host, shows only the paths you bind in, can hide other processes and the network, accepts seccomp filters and sets `PR_SET_NO_NEW_PRIVS`; its authors say it "is not a complete, ready-made sandbox with a specific security policy", and with its setuid mode removed it depends on unprivileged user namespaces ([containers/bubblewrap](https://github.com/containers/bubblewrap)). On macOS the equivalent is Seatbelt through `sandbox-exec`: Gemini CLI ships six profiles from `permissive-open`, the default, which confines writes to the project but allows network access, to `strict-proxied`, and also offers Docker or Podman, gVisor's `runsc`, LXC and a Windows mode based on integrity levels ([Gemini CLI: Sandboxing](https://geminicli.com/docs/cli/sandbox/)).
- **How coding harnesses use it, as of November 2026.** Claude Code builds on the open-source sandbox runtime: Seatbelt on macOS, bubblewrap plus `socat` on Linux and WSL2, an optional seccomp filter that blocks Unix domain sockets, and no sandbox on native Windows ([Claude Code: Sandboxing](https://code.claude.com/docs/en/sandboxing)); on Linux the runtime isolates the sandbox in its own network namespace and reaches HTTP and SOCKS5 proxies on the host over bind-mounted Unix sockets ([anthropics/sandbox-runtime](https://github.com/anthropics/sandbox-runtime)). Codex uses Seatbelt on macOS, bubblewrap on Linux and WSL2, and a native sandbox on Windows ([Codex: Sandboxing](https://learn.chatgpt.com/docs/sandboxing)).
- **Network filtering is a proxy with an allowlist.** In Claude Code, connections go through a local proxy that checks each hostname against an allowlist that starts empty and does not inspect TLS by default; UDP, QUIC and ICMP cannot leave, tools that ignore the proxy variables (plain `ssh`, most database drivers) cannot connect at all, and the docs warn that allowing a broad domain such as `github.com` opens exfiltration paths, for example through domain fronting ([Claude Code: Sandboxing](https://code.claude.com/docs/en/sandboxing)).
- **Know the defaults and the escape hatches.** By default sandboxed commands can write only to the working directory, a per-user temp directory and directories you added, but can read most of the machine, credential files such as `~/.ssh` included, unless you deny them; writes to Claude Code's settings and `.mcp.json`, and to shell startup files and git hooks in the working directory, are denied even inside writable folders; and the built-in file tools, hooks and local MCP servers run outside the sandbox entirely ([Claude Code: Sandboxing](https://code.claude.com/docs/en/sandboxing)). Commands that match `excludedCommands` always run unsandboxed. `allowUnsandboxedCommands: false` closes the `dangerouslyDisableSandbox` retry, and `failIfUnavailable: true` makes Claude Code refuse to start, rather than run commands unsandboxed, when the sandbox cannot start. `enableWeakerNestedSandbox`, which makes the sandbox work inside unprivileged Docker containers, "considerably weakens security" ([Claude Code: Sandboxing](https://code.claude.com/docs/en/sandboxing)).

## Planned visuals

- `diagram`: one agent command inside a Linux sandbox, with namespaces, the seccomp filter, Landlock rules and cgroup limits drawn as layers, and the crossing each one guards: files, network, other processes and resources.
- `sequence`: three commands leaving the sandbox through the local proxy: an allowed `curl` that passes, a request to an unlisted host that is refused, and an `ssh` or UDP call that cannot connect at all.
- `compare`: macOS Seatbelt beside Linux bubblewrap as coding harnesses use them, with how each handles files, network and nested sandboxes, and which escape hatches each needs.

## Talk like an expert

Experts talk about **namespaces**, **seccomp-bpf**, **Landlock**, **no_new_privs**, **bind mounts**, **Seatbelt profiles**, **egress proxies** and **fail-closed** startup. They ask what still runs outside the boundary and what an allowed domain can carry, and they step up to containers, gVisor or microVMs (see [Sandboxes and execution environments](#sandboxes)) when the code is untrusted or the host is shared.

## Go deeper

- [Seccomp BPF](https://docs.kernel.org/userspace-api/seccomp_filter.html), Linux kernel documentation.
- [Landlock: unprivileged access control](https://docs.kernel.org/userspace-api/landlock.html), Linux kernel documentation.
- [containers/bubblewrap](https://github.com/containers/bubblewrap), the bubblewrap repository and README.
- [Configure the sandboxed Bash tool](https://code.claude.com/docs/en/sandboxing), Claude Code documentation, including its security limitations.

## Related

- [Sandboxes and execution environments](#sandboxes)
- [Permissions, approvals and hooks in coding harnesses](#harness-permissions-hooks)
- [Securing coding agents](#coding-agent-security)
- [Build your own harness](#build-your-own-harness)
- [Secure agent design](#secure-agent-design)
