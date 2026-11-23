# Maintainers

## Owner

[@aeoess](https://github.com/aeoess) (Tymofii Pidlisnyi, Agent Passport System) is the only owner of the NOSAI-Federation organization and of this repository. Adding a second owner goes through the process below.

## Proposed maintainers

These accounts are proposed for GitHub's Maintain role on this repository. None holds it yet. Each scope is a commitment the maintainer made in public, and GitHub does not enforce it.

| Account | Project | Scope | Time | Agreed | Status |
|---|---|---|---|---|---|
| [@Poke-nushi](https://github.com/Poke-nushi) | VATE | VATE descriptions and examples, including a worked example when a project asks how its systems connect, which another participant can check from the original records. Reviews of changes to VATE's own entries. | Asynchronous, as updates come up | [#244](https://github.com/NOSAI-Federation/agent-governance-vocabulary/issues/244#issuecomment-7055850249), [confirmed](https://github.com/NOSAI-Federation/agent-governance-vocabulary/issues/244#issuecomment-7071290894) | Pending review |
| [@darklordVirtual](https://github.com/darklordVirtual) | REMORA | REMORA entries, documentation and occasional pull request reviews, starting with a small scope | Asynchronous, based on availability | [#244](https://github.com/NOSAI-Federation/agent-governance-vocabulary/issues/244#issuecomment-7062099455), [confirmed](https://github.com/NOSAI-Federation/agent-governance-vocabulary/pull/281#issuecomment-7116991575) | Pending review |

A maintainer reviews changes to their own project's entries. Changes to files that more than one project relies on are coordinated on the pull request concerned and follow [SHARED-DECISIONS.md](./SHARED-DECISIONS.md).

## Reviewer without a repository role

[@ogasurfproject-jpg](https://github.com/ogasurfproject-jpg) (Horizon Shield) reviews pull requests that touch the shared files and crosswalk rows through comments.

## What the Maintain role allows

Maintain permits code and workflow changes, merging under the repository's rules, and some settings changes, including Pages configuration. It does not grant organization ownership or control over repository access, branch protection, deletion or transfer. The exact permissions are in [GitHub's role table](https://docs.github.com/en/organizations/managing-user-access-to-your-organizations-repositories/managing-repository-roles/repository-roles-for-an-organization).

Changes to `.github/`, `scripts/`, `package.json`, `package-lock.json` and this file are assigned to the owner for review in [CODEOWNERS](./.github/CODEOWNERS). Those paths hold the workflows, the code CI runs, its dependencies and the access list. A repository rule that requires that review and blocks direct pushes to `main` will be enabled and tested before any Maintain role is granted.

## Changing access

Adding a maintainer or an owner, or removing one who has not asked to leave, requires a public pull request that stays open for 14 days and explicit support from at least two participating projects, as listed in [SHARED-DECISIONS.md](./SHARED-DECISIONS.md#participating-projects), other than the project gaining or losing access. Silence does not count as support.

A maintainer may step down at any time. Their access is removed on request, and the change is recorded publicly.

An account whose access presents an immediate security risk can have that access suspended temporarily without waiting 14 days. The owner records the reason publicly as soon as doing so is safe and opens the normal review for the lasting decision. This exception does not authorize adding an owner or granting new access.

This is the process proposed in the migration plan ([#247](https://github.com/NOSAI-Federation/agent-governance-vocabulary/pull/247)). The pull request that added this file followed it.
