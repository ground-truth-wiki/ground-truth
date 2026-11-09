---
id: microsoft-sas-token-exposure
book: 22
order: "22.36"
title: "Microsoft's SAS token exposure: an internal storage URL shared in a public AI repository"
level: practitioner
stability: moving
reviewed: "2026-11"
status: full
tags: [security, secrets-management, cloud-storage, open-source, public-record]
visuals: []
type: field-note
account: public-record
industry: "Technology (AI research at a software and cloud company)"
use_case: "Contributing to open-source AI learning models in a public GitHub repository, where a blob store URL carried an Azure Storage SAS token"
outcome: "An overly-permissive SAS token gave access to an internal storage account holding backups of two former employees' workstation profiles and internal Microsoft Teams messages; Microsoft reports no customer data exposed and mitigated the issue on June 24th, 2023"
measured_how: "No impact metric: the categories of exposed data and a timeline from Wiz's report on June 22nd, 2023 to mitigation on June 24th, 2023, from Microsoft's own investigation (MSRC blog, September 18, 2023)"
prerequisites: [supply-chain-security]
replications: []
---
> [!tldr]
> A blob store URL shared in a public GitHub repository, during work on open-source AI learning models, carried an overly-permissive SAS token for an internal Microsoft storage account. Wiz reported it on June 22nd, 2023, and Microsoft revoked the token on June 24th, 2023, reporting no customer data exposed. Its lesson: treat a SAS URL as a secret, and keep it narrow, short-lived and revocable.

> [!note] From the public record
> Built from Microsoft's own published account, "Microsoft mitigated exposure of internal information in a storage account due to overly-permissive SAS token" (September 2023), linked under Sources. The team did not write or review this page. If you worked on it, tell the first-hand story: open a pull request or use the "Share a playbook" form.

## Context

The Microsoft Security Response Center (MSRC) published this account on September 18, 2023, after a Coordinated Vulnerability Disclosure (CVD) report from Wiz.io. It concerns a URL for a blob store that was shared in a public GitHub repository "while contributing to open-source AI learning models". The post names the repository as `robust-models-transfer`.

The URL carried a Shared Access Signature (SAS) token. Unlike Shared Key, "which has full access to an entire storage account," SAS provides granular control over how clients can access data. This token, in the post's words, was "an overly-permissive Shared Access Signature (SAS) token for an internal storage account." The post does not state its permissions, its scope or its expiry.

As of September 2023, the post names three parts: Azure Storage with SAS tokens, a public GitHub repository, and GitHub's secret scanning service with a SAS detection provided by Microsoft.

## What happened

1. **Before June 22nd, 2023.** The URL with the token was provided in the public repository, on a date the post does not give.
2. **Access.** "Security researchers at Wiz were then able to use this token to access information in the storage account."
3. **June 22nd, 2023.** Wiz reported the issue to MSRC.
4. **June 24th, 2023.** MSRC worked with the relevant research and engineering teams to revoke the token "and prevent all external access to the storage account".
5. **After mitigation.** Microsoft investigated potential impact on customers and business continuity.
6. **September 18, 2023.** MSRC published the account, with best practices for customers.

## Impact, and how it was measured

The post describes impact in categories, from its own investigation, without numbers.

- **What was exposed.** The data "included backups of two former employees’ workstation profiles" and "internal Microsoft Teams messages of these two employees with their colleagues."
- **Customers and other services.** "No customer data was exposed, and no other internal services were put at risk because of this issue."
- **The investigation's conclusion.** "Our investigation concluded that there was no risk to customers as a result of this exposure." The post adds: "No customer action is required in response to this issue."
- **The platform.** "There was no security issue or vulnerability within Azure Storage or the SAS token feature."

**Not measured:** the post gives no volume of exposed data and no count of files or messages, does not say when the URL was first posted or how long the token was usable, does not state the token's permissions or expiry, and does not say whether anyone other than Wiz accessed the storage account.

## Why it happened

The post places the cause in how the token was handled, not in the platform:

- **A broad token in a public URL.** The token was overly permissive, it was included in a blob store URL, and the URL was provided in a public GitHub repository. The post's framing: "Like other secrets, SAS tokens should be created and managed properly."
- **A detection marked as a false positive.** GitHub's secret scanning service checks public code changes for plaintext secrets. Its SAS detection, provided by Microsoft, flags Azure Storage SAS URLs "pointing to sensitive content, such as VHDs and private cryptographic keys." Microsoft also performs complete historical rescans of all public repositories in Microsoft-owned or affiliated organizations and accounts. That system did detect the URL that Wiz identified, "but the finding was incorrectly marked as a false positive." The post does not say when the finding was raised or how it came to be marked that way.

## What changed afterwards

- **A wider detection.** "Microsoft has expanded this detection to include any SAS token that may have overly-permissive expirations or privileges."
- **The false positive.** "The root cause issue for this has been fixed", and the system is "now confirmed to be detecting and properly reporting on all over-provisioned SAS tokens." The post gives no data behind this confirmation.
- **Ongoing work.** The post lists ongoing improvements: to detections and scanning, to proactively identify such cases; to further harden the SAS token feature; and to encode the best practices in the default settings for storage accounts.

## Lessons

The source's lessons are five best practices that Azure Storage recommends for SAS URLs:

- **Apply the Principle of Least Privilege.** Scope SAS URLs to the smallest set of resources, such as a single blob, with only the permissions needed.
- **Use Short-Lived SAS.** "Azure Storage recommends 1 hour or less for all SAS URLs."
- **Handle SAS Tokens Carefully.** "SAS URLs grant access to your data and should be treated as an application secret." And: "Only expose SAS URLs to clients who need access to a storage account."
- **Have a Revocation Plan.** Use a Stored Access Policy, and be ready to remove it or rotate storage account keys after a leak.
- **Monitor and Audit Your Application.** Enable Azure Monitor and Azure Storage Logs, and use a SAS Expiration Policy "to detect clients using long-lived SAS URLs."

The wiki's reading: these points are for teams that publish models or data.

- **A storage link in a public repository is part of the release.** When models or data go out through a cloud storage link, the token in it is a public credential. Review its scope and lifetime first. See [Supply chain and model security](#supply-chain-security).
- **Detection is only as good as the triage behind it.** The scanning found the URL, and the finding was marked as a false positive. Dismissed secret findings deserve a second look. See [Incidents and on-call](#incidents-on-call).
- **Check the token, not only its target.** The original detection keyed on what a URL pointed to; the expanded one also looks at the token's expiry and privileges. A broad, long-lived token is a risk wherever it points.
- **Security exposures can be privacy exposures.** What was exposed here was tied to two former employees: backups of their workstation profiles and their Teams messages with colleagues. See [Privacy](#privacy).

## Disclosure

None.

## Sources

- MSRC, Microsoft, [“Microsoft mitigated exposure of internal information in a storage account due to overly-permissive SAS token”](https://www.microsoft.com/en-us/msrc/blog/2023/09/microsoft-mitigated-exposure-of-internal-information-in-a-storage-account-due-to-overly-permissive-sas-token), Microsoft Security Response Center blog, September 18, 2023.

## Related

- [About field notes](#about-field-notes)
- [Supply chain and model security](#supply-chain-security)
- [Incidents and on-call](#incidents-on-call)
- [Privacy](#privacy)
- [Public AI failures and incidents: a casebook](#ai-failure-casebook)
