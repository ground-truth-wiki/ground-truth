---
id: litellm-supply-chain-incident
book: 22
order: "22.11"
title: "LiteLLM's March 2026 supply chain incident: two malicious releases on PyPI"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [supply-chain, incidents, ci-cd, ai-gateways, public-record]
visuals: []
type: field-note
account: public-record
industry: "AI infrastructure software (AI gateway and SDK)"
use_case: "The LiteLLM AI Gateway (Proxy) and SDK, distributed as a PyPI package and as Docker images, whose PyPI release path was used to publish two malicious versions"
outcome: "litellm 1.82.7 and 1.82.8, which appear to have included a credential stealer, were live on PyPI on 24 March 2026 from 10:39 UTC for about 40 minutes; the official Docker image was not impacted"
measured_how: "No impact metric: affected versions, a UTC exposure window, indicators of compromise and an audit of releases v1.78.0 to v1.82.6 (LiteLLM security update, 24 March 2026, and town hall post, 27 March 2026)"
prerequisites: [supply-chain-security, ci-cd-for-ai]
replications: []
---
> [!tldr]
> On 24 March 2026, two LiteLLM versions that appear to have included a credential stealer were live on PyPI for about 40 minutes. LiteLLM's understanding is that a compromised Trivy dependency in its CI security scan let attackers obtain static release credentials from a shared CI environment. The changes it reports: isolated CI environments, Trusted Publishing for PyPI, pinned GitHub Actions and signed Docker images.

> [!note] From the public record
> Built from LiteLLM's own published accounts, "Security Update: Suspected Supply Chain Incident" (March 2026), "Security Townhall Updates" (March 2026) and "Announcing CI/CD v2 for LiteLLM" (March 2026), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

LiteLLM's posts refer to the LiteLLM AI Gateway (also called the LiteLLM Proxy) and the SDK. The security update names pip installs from PyPI, the official Docker image, LiteLLM Cloud and source installs from GitHub. LiteLLM can also arrive as a transitive dependency, "for example through AI agent frameworks, MCP servers, or LLM orchestration tools".

The town hall post describes the setup as of March 2026: "everything was running on CircleCI, and all steps shared a common environment". Release credentials, including those for PyPI, GHCR and Docker publishing, were available there as static secrets.

## What happened

All times are UTC on 24 March 2026 unless stated.

1. **10:39.** "LiteLLM v1.82.7 was pushed to PyPI." Version v1.82.8 "was published soon after". Initial evidence, says the security update, suggests the attacker bypassed official CI/CD workflows and uploaded the packages directly to PyPI.
2. **About 40 minutes after 10:39.** The packages were quarantined by PyPI.
3. **By 16:00.** The LiteLLM team had worked with PyPI to delete the affected packages.
4. **The same day.** LiteLLM published the security update. It states that all new releases were paused "until we complete a broader supply-chain review".
5. **25 to 27 March.** The security update received dated updates. A town hall post followed on 27 March.
6. **30 March.** An update dated 30 March reports that v1.83.0 is available, "released by our new CI/CD v2 pipeline".

v1.82.7 "contained a malicious payload in the LiteLLM AI Gateway proxy_server.py". v1.82.8 contained `litellm_init.pth` and a malicious payload in the same file. The versions "appear to have included a credential stealer" designed to scan for environment variables, SSH keys, cloud provider credentials, Kubernetes tokens and database passwords. It was designed to encrypt and exfiltrate data via a POST request to models.litellm.cloud, "which is not an official BerriAI / LiteLLM domain".

## Impact, and how it was measured

The posts report exposure and audits, not measured harm.

- **Affected versions.** "The compromised PyPI packages were litellm==1.82.7 and litellm==1.82.8." And: "Those packages were live on March 24, 2026 from 10:39 UTC for about 40 minutes before being quarantined by PyPI."
- **Who may be affected.** Anyone who installed or upgraded via pip "between 10:39 UTC and 16:00 UTC", unpinned installs that received either version, Docker builds in the window with an unpinned install, and transitive, unpinned dependencies.
- **Who was not.** "Customers running the official LiteLLM Proxy Docker image were not impacted." That deployment path "pins dependencies in requirements.txt". Also not affected: LiteLLM Cloud users, users on v1.82.6 or earlier who did not upgrade in the window, and source installs from GitHub.
- **Earlier releases.** LiteLLM audited every release published between v1.78.0 and v1.82.6 on PyPI and Docker. For each artifact it computed the SHA-256 digest, scanned for the indicators of compromise and compared the contents with the Git commit: "All versions listed below are confirmed clean."
- **LiteLLM's own systems.** Its investigation to date, with external security experts, found "no evidence of lateral movement into our internal corporate systems".

**Not measured:** the posts give no download count for the two versions, no number of affected users, and no account of whether stolen credentials were used. The cause is stated as LiteLLM's belief, the security update's status reads "Active investigation", and no forensic results are reported.

## Why it happened

The security update's overview says: "Current evidence suggests a maintainer's PyPI account may have been compromised and used to distribute malicious code." Its summary at the top: "We believe that the compromise originated from the Trivy dependency used in our CI/CD security scanning workflow."

The town hall post of 27 March names "three major contributing factors":

1. **A shared CI/CD environment.** "That increased blast radius": one compromised component could potentially access credentials intended for other parts of the pipeline.
2. **Static credentials in environment variables.** A compromised step could access long-lived release credentials.
3. **An unpinned Trivy dependency.** LiteLLM's present understanding is that a compromised Trivy package ran during the scan, had access to environment variables and enabled attackers to obtain those credentials.

In its summary, "a compromised package in CI had access to secrets it should not have had", and those secrets were then used in the release path.

## What changed afterwards

The security update lists the first steps: LiteLLM removed the compromised packages from PyPI, rotated maintainer credentials and engaged Google's Mandiant security team for forensic analysis. The town hall post adds that it deleted or rotated "all impacted or adjacent secret keys", removed "roughly 6,000 open branches" and pinned all GitHub Actions.

The CI/CD v2 post of 30 March lists the structural changes. Security scans and unit tests run in isolated environments. Validation and release live in separate repositories, "making it harder for an attacker to reach release credentials". PyPI releases use Trusted Publishing, so "no long-lived credentials are used to publish releases". "Starting from v1.83.0-nightly, all LiteLLM Docker images published to GHCR are signed with cosign." The town hall post also plans "a cooldown period before upgrading to a new version of a package". The posts do not report whether the changes have been tested against an attack.

## Lessons

The posts do not list lessons as such. The closest statement is the town hall post's "4 guiding principles" for the new CI/CD pipeline: "Limit what each package can access", "Reduce the number of sensitive environment variables", "Avoid compromised packages" and "Prevent release tampering".

The wiki's reading:

- **CI tools are part of the supply chain.** The likely entry point LiteLLM names is a security scanner that shared an environment with release secrets. See [Supply chain and model security](#supply-chain-security) and [CI/CD for AI](#ci-cd-for-ai).
- **Pinning mattered at both ends.** An unpinned dependency let the attack into the pipeline, unpinned installs carried it to users, and the pinned Docker path was not affected.
- **Gateways sit next to secrets.** A gateway runs close to API keys and cloud credentials, the kind of data this stealer was designed to collect. See [Gateways and routers](#gateways-routers).
- **Write the notice for the reader who must act.** Versions, a time window, indicators and clean checksums let users check themselves. See [Incidents and on-call](#incidents-on-call).

## Disclosure

None.

## Sources

- Krrish Dholakia (CEO, LiteLLM) and Ishaan Jaffer (CTO, LiteLLM), LiteLLM, [“Security Update: Suspected Supply Chain Incident”](https://docs.litellm.ai/blog/security-update-march-2026), LiteLLM blog, published 24 March 2026, last updated 27 March 2026, with an update note dated 30 March 2026.
- Krrish Dholakia (CEO, LiteLLM) and Ishaan Jaffer (CTO, LiteLLM), LiteLLM, [“Security Townhall Updates”](https://docs.litellm.ai/blog/security-townhall-updates), LiteLLM blog, 27 March 2026.
- Krrish Dholakia (CEO, LiteLLM), LiteLLM, [“Announcing CI/CD v2 for LiteLLM”](https://docs.litellm.ai/blog/ci-cd-v2-improvements), LiteLLM blog, 30 March 2026.

## Related

- [About field notes](#about-field-notes)
- [Supply chain and model security](#supply-chain-security)
- [CI/CD for AI](#ci-cd-for-ai)
- [Gateways and routers](#gateways-routers)
- [Incidents and on-call](#incidents-on-call)
