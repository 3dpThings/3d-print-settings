# Maintaining

Notes for maintainers on triage, reviews and releases. The goal is to keep the project trustworthy (values people can rely on) and pleasant to contribute to, without burning out.

## Labels

Create these once in *Issues › Labels*:

| Label | Use |
|---|---|
| `printer`, `filament`, `data` | Catalogue requests and fixes (the issue forms add them). |
| `settings-feedback` | "These values didn't work for me" reports. |
| `translation` | Language fixes and new languages. |
| `bug`, `enhancement` | App behaviour. |
| `good first issue` | Small, well-described tasks, ideal for new contributors. |
| `help wanted` | Accepted, but nobody is working on it yet. |
| `needs source` | Waiting for a data sheet, spec page or test results. |
| `needs info` | Waiting for the reporter to answer. |
| `wontfix` / `duplicate` | Closed without changes; always say why. |

## Triage (aim for a first reply within a few days)

1. **Thank the person** and check the request is complete. If a source is missing, add `needs source` and ask for the TDS or spec page.
2. **Decide**: accept it (`help wanted`, or `good first issue` if it's simple), ask for information (`needs info`), or decline politely with the reason.
3. **Close stale issues**: if `needs info` gets no answer in 30 days, close it with a friendly note that it can be reopened anytime.
4. **Settings feedback**: one report is an anecdote, several similar reports are a pattern. Ask for the slicer, nozzle and how they tested. Only change a default when it's backed by the data sheet or several consistent reports.

## Reviewing pull requests

CI runs `node scripts/check.mjs` on every PR; it must be green before you merge.

**Data PRs (printers, filaments)**
- Every new value has a source in the PR description, or it's clearly marked as an estimate.
- Existing `id`s are unchanged: they're stored in people's history.
- The values make sense for the class (for example a PLA bed at 110 °C is a typo).
- The text isn't copied from the manufacturer's website (copyright): tips should be in the contributor's own words.
- Check out the branch locally (`gh pr checkout <number>`), serve it and try one or two combinations.

**Translation PRs**
- Ideally a second native speaker approves. You can ask in the PR: "Any native speakers who could take a look?"
- Placeholders and list lengths are checked automatically.

**Code PRs**
- Was it discussed in an issue first? Big unrequested refactors can be declined kindly.
- No new dependencies or build step without discussion.
- Still works in a narrow and a wide window, and in light and dark mode.

**Merging**
- Prefer *Squash and merge* with a clean title (`Add Creality K2 Pro`), so the history reads like a changelog.
- Add a line to `CHANGELOG.md` under *Unreleased* (or ask the contributor to).
- Thank the contributor. First-time contributors especially remember how their first PR was received.

## Saying no

It's fine to decline things that don't fit, such as features that need a server or accounts, unsourced values, or very niche printers with no specs available. Explain why, suggest an alternative if there is one, and close the issue. A clear "no" is kinder than leaving an issue open for months.

## Releases

Release when there's something worth announcing: a batch of printers or filaments, or a new feature. There's no need for a fixed schedule.

1. Move the *Unreleased* notes in `CHANGELOG.md` under a new version and date, and update `version` in `package.json`.
2. Commit, then create a tag and a GitHub release: *Releases › Draft a new release › tag `v1.1.0`*. Paste the changelog section as the description.
3. GitHub Pages deploys `main` automatically; check the live site after a minute.

Versions: **major** when stored history or exported files change incompatibly, **minor** for features, printers and filaments, **patch** for fixes.

## Security and abuse

- Branch protection on `main`: *Settings › Branches › Add rule*. Require a pull request and the *Check* workflow to pass.
- Never merge PRs that add external scripts, trackers or network calls without discussion.
- Spam or abusive comments: hide or delete them, then block the user if needed (see the [Code of Conduct](../CODE_OF_CONDUCT.md)).

## Avoiding burnout

- You don't owe anyone an immediate answer. Set expectations in the README if you're busy.
- Invite regular, careful contributors to become maintainers (*Settings › Collaborators*), for example one person per language or per printer brand.
- Use saved replies (*GitHub settings › Saved replies*) for common answers, such as asking for a source or explaining the one-topic-per-PR rule.
