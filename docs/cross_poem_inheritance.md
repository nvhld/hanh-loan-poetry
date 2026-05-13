# Cross-Poem Atmospheric Inheritance Protocol

Date: `2026-05-13`
Status: `PROTOCOL DESIGN ONLY`

This document defines how residue from one poem may alter nearby atmospheric space. It does not define recommendations, related content, next-reading prompts, or runtime implementation.

## Principle

Inheritance is field pressure.

It may make nearby poetic space feel slightly denser, slower, or more familiar. It must not explain itself, name itself, or ask the reader to follow it.

## Non-Goals

- No recommendation engine.
- No "users also read" logic.
- No reader profile.
- No global mood state.
- No visible CTA.
- No poem text mutation.
- No topology physics tuning.

## Inheritance Sources

Allowed sources are local and recent:

- Current poem `id`, `slug`, `dominantField`, and `motifs`.
- Canonical motif cluster adjacency.
- Reading duration on the current poem.
- Deep scroll / long linger signal.
- Instrument Modal open or long linger.
- Whisper cadence, only as timing texture, not semantic instruction.
- Residual familiarity, only as quiet local memory.

Disallowed sources:

- Account identity.
- Full reading history.
- Device fingerprinting.
- External analytics.
- SEO metadata.
- Inferred reader intention.

## Propagation Radius

Inheritance must remain local.

- Primary radius: poems sharing at least one motif with the source poem.
- Secondary radius: poems in adjacent motif clusters, if the current archive or field view already exposes that neighborhood.
- Maximum radius: one active inheritance field at a time.
- No global site-wide atmospheric wash.
- No cross-archive pressure unless the reader has entered an archive surface where motif proximity is already legible.

Propagation is not navigation. It should not reorder the archive, promote a title, or create a preferred path.

## Pressure Shape

Allowed effects, if implemented later:

- Slight archive density increase around nearby motif clusters.
- Slight opacity lift on nearby poems, capped below conscious callout.
- Slight drift friction increase within the active local region.
- Slight delay before unrelated atmospherics enter the foreground.
- Slight reduction of Instrument scan coldness for genuinely familiar nearby residues.

Forbidden effects:

- New particles.
- New visual systems.
- New labels.
- New buttons.
- Ranking.
- Auto-opening modals.
- Changing poem body, title, slug, id, or canonical metadata.
- Changing physics constants or cluster force behavior.

## Inheritance Decay

Pressure must cool.

- Time decay: pressure begins decaying after the source poem is left.
- Navigation decay: each poem transition weakens inherited pressure.
- Threshold decay: crossing the threshold surface resets active inheritance.
- Session decay: inheritance should not survive as a named state across sessions.
- Familiarity decay remains governed by `docs/residual_memory_protocol.md`.

Decay should be gradual enough to avoid a visible reset, but strong enough that the site never becomes a persistent reader aura.

## Silence-Safe Scheduling

Inheritance must obey the Silence Budget.

- It cannot spawn interruptive surfaces.
- It cannot compete with Instrument Modal, Pending Modal, or Transit Ghost.
- It cannot begin a visible change during an active foreground fade owner.
- It should wait behind whisper reveal and threshold dissolve.
- It should prefer absence over collision.

If inheritance and another atmospheric event both want the foreground, inheritance loses.

## Cluster Interaction

Clusters are read-only landmarks for inheritance.

- Inheritance may read motif or field cluster membership.
- Inheritance may use cluster proximity as a pressure map.
- Inheritance may not recompute cluster centers.
- Inheritance may not tune damping, force, drift, reveal radius, velocity ceilings, or silence timing constants.
- Physics debug output remains unaffected by inheritance.

This protects the Physics Layer from Research Layer pressure.

## Inheritance Ceiling

- At most `1` active inheritance field.
- Inheritance cannot override silence windows.
- Inheritance cannot spawn interruptive surfaces.
- Inheritance cannot modify poem text layer.
- Inheritance cannot change topology physics constants.
- Inheritance cannot outlive threshold reset.
- Inheritance cannot become a visible feature surface.

## Forbidden Inheritance

- "Recommended next poem."
- "Related poem."
- "Because you read..."
- Persistent reader taste model.
- Motif badges or progress markers.
- Cross-poem overlays that explain the connection.
- Archive sorting by pressure.
- Global ambience based on the last poem.
- Any inheritance that makes the reader feel watched.

## Protocol Test

Before implementation, any proposed inheritance behavior must answer:

1. Does it remain local?
2. Does it decay?
3. Does it avoid interruptive surfaces?
4. Does it preserve poem text as primary mass?
5. Does it leave physics constants untouched?
6. Would the reader notice it as a feature?

If the answer to `6` is yes, the behavior is too loud.

