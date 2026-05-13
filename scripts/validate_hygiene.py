#!/usr/bin/env python3

import argparse
import json
import re
from collections import Counter
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
GENERATED_DIR = REPO_ROOT / "data" / "generated"
REPORT_PATH = REPO_ROOT / "docs" / "baselines" / "validation_report.txt"
LITERARY_DIR = REPO_ROOT / "public" / "literary"
RUNTIME_MANIFEST_PATH = LITERARY_DIR / "runtime-manifest.json"
PHENOMENOLOGY_SNAPSHOT_PATH = REPO_ROOT / "docs" / "baselines" / "phenomenology.snapshot.json"
RUNTIME_VERSION = "2026.05.13-atmospheric-freeze"
FORBIDDEN_NEEDLE = ".replace(" + repr("\\N")
TEXT_SUFFIXES = {
    ".json",
    ".md",
    ".py",
    ".js",
    ".ts",
    ".tsx",
    ".html",
    ".mjs",
    ".css",
    ".yml",
    ".yaml",
    ".txt",
}
ARTIFACTS = [
    "poems-raw.json",
    "poems-final.json",
    "poems-inferred.json",
    "poems-curated.json",
    "poem-hashes.json",
]
RUNTIME_FILES = ("reader.html", "archive.html", "topology.html", "curator.html")
FORBIDDEN_PUBLIC_RUNTIME = (
    *RUNTIME_FILES,
    "pending-modal.js",
    "curator_data_inline.js",
    "critical_lens_inline.js",
    "anchor_mri_inline.js",
    "instrument_translator.js",
    "motif_clusters_inline.js",
    "critical-lens.json",
    "anchor_mri.json",
    "motif_clusters.json",
)
FORBIDDEN_ROOT_RUNTIME = (
    *RUNTIME_FILES,
    "pending-modal.js",
    "curator_data_inline.js",
    "critical_lens_inline.js",
    "anchor_mri_inline.js",
    "instrument_translator.js",
    "motif_clusters_inline.js",
    "critical-lens.json",
    "anchor_mri.json",
    "motif_clusters.json",
)
LITERARY_REQUIRED = (
    *RUNTIME_FILES,
    "pending-modal.js",
    "curator_data_inline.js",
    "critical_lens_inline.js",
    "anchor_mri_inline.js",
    "instrument_translator.js",
    "motif_clusters_inline.js",
    "critical-lens.json",
    "anchor_mri.json",
    "motif_clusters.json",
)
LITERARY_REQUIRED_DIRS = ("audio", "textures", "poems")
FORBIDDEN_PUBLIC_RUNTIME_DIRS = ("audio", "textures", "poems")
BASELINE_NEEDLES = (
    f"Runtime Version Freeze:** `{RUNTIME_VERSION}`",
    "Velocity damping: ~0.94 - 0.98 friction multiplier.",
    "Scroll Resistance: `wheel` events dampen drift by 70% (`_driftVelocity *= 0.3`).",
    "No transition under 400ms",
    "No physics snap acceleration",
    "No opacity jump > 0.18/frame",
    "No camera zoom spikes",
)
RUNTIME_CONSTANT_NEEDLES: dict[str, tuple[str, ...]] = {
    "public/literary/reader.html": (
        "_driftVelocity *= 0.3;",
        "transition: opacity 2.4s ease, color 0.3s;",
        "transition: opacity 3.5s cubic-bezier(0.16, 1, 0.3, 1);",
    ),
    "public/literary/archive.html": (
        "window.__HL_RUNTIME_FLAGS",
        "reducedAtmospherics",
        "/poem/${p.slug}`",
    ),
    "public/literary/topology.html": (
        "const TOPOLOGY_PHYSICS = Object.freeze({",
        "springStiffness: 120,",
        "springDamping: 12,",
        "function isDebugPhysics() {",
        "window.__HL_RUNTIME_FLAGS",
        "validatePhysicsState();",
        "Debug Overlay API: HL Physics v1",
        "Cluster Integrity:",
        "Velocity Ceiling:",
        "NaN State:",
        "Center Drift:",
        "Particle Pressure:",
        "Active Region:",
    ),
    "src/engine/field/index.ts": (
        ".force('fieldCluster', fieldClusterForce(nodes, clusterCenters, FIELD_PHYSICS.clusterStrength))",
        ".velocityDecay(FIELD_PHYSICS.velocityDecay)",
        "function fieldClusterForce(nodes: FieldNode[], clusterCenters: ClusterCenters, strength: number) {",
        "export function computeClusterCenters(",
    ),
    "src/config/physics.ts": (
        "clusterStrength: 0.06,",
        "velocityDecay: 0.35,",
        "springStiffness: 120,",
        "silenceOnsetMs: 8000,",
    ),
    "src/runtime/literary-loader.ts": (
        "document.write(serialized)",
        "__HL_RUNTIME_FLAGS",
        "runtime-manifest.json",
    ),
    "src/components/dream/DreamField.tsx": (
        "Debug Overlay API: HL Physics v1",
        "Cluster Integrity:",
        "Velocity Ceiling:",
        "NaN State:",
        "Center Drift:",
        "Particle Pressure:",
        "Active Region:",
    ),
}


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def extract_required(pattern: str, text: str, label: str, cast=float):
    match = re.search(pattern, text, re.MULTILINE)
    if not match:
        raise ValueError(f"Missing pattern for {label}: {pattern}")
    return cast(match.group(1))


def build_phenomenology_snapshot() -> dict:
    reader_text = (LITERARY_DIR / "reader.html").read_text(encoding="utf-8")
    archive_text = (LITERARY_DIR / "archive.html").read_text(encoding="utf-8")
    topology_text = (LITERARY_DIR / "topology.html").read_text(encoding="utf-8")
    physics_text = (REPO_ROOT / "src" / "config" / "physics.ts").read_text(encoding="utf-8")

    return {
        "runtimeVersion": RUNTIME_VERSION,
        "reader": {
            "initialLoadFadeMs": int(extract_required(r"transition: opacity ([0-9.]+)s cubic-bezier\(0\.4, 0, 0\.2, 1\);", reader_text, "reader initial load") * 1000),
            "poemTextRevealMs": int(extract_required(r"transition: opacity ([0-9.]+)s ease, color 0\.3s;", reader_text, "reader poem reveal") * 1000),
            "archiveExitFadeMs": int(extract_required(r"window\.location\.href = isLocalFile \? 'archive\.html' : '/archive'; }, ([0-9]+)\);", reader_text, "reader archive exit", int)),
            "thresholdDissolveMsDefault": int(extract_required(r"window\._isMinimalMode \? 500 : ([0-9]+)\);", reader_text, "reader threshold default", int)),
            "thresholdDissolveMsMinimal": int(extract_required(r"window\._isMinimalMode \? ([0-9]+) : 4000\);", reader_text, "reader threshold minimal", int)),
            "scrollResistanceMultiplier": extract_required(r"_driftVelocity \*= ([0-9.]+);", reader_text, "reader scroll resistance"),
            "dustCapPoemOpenDesktop": int(extract_required(r"const maxDust = poemOpen \? \(isMobile \? 520 : ([0-9]+)\) : \(isMobile \? 220 : 420\);", reader_text, "reader dust cap desktop", int)),
            "dustCapPoemOpenMobile": int(extract_required(r"const maxDust = poemOpen \? \(isMobile \? ([0-9]+) : 980\) : \(isMobile \? 220 : 420\);", reader_text, "reader dust cap mobile", int)),
            "dustCapFieldDesktop": int(extract_required(r"const maxDust = poemOpen \? \(isMobile \? 520 : 980\) : \(isMobile \? 220 : ([0-9]+)\);", reader_text, "reader field dust cap desktop", int)),
            "dustCapFieldMobile": int(extract_required(r"const maxDust = poemOpen \? \(isMobile \? 520 : 980\) : \(isMobile \? ([0-9]+) : 420\);", reader_text, "reader field dust cap mobile", int)),
            "transitPressureDelayMs": int(extract_required(r"ghost\.classList\.add\('pressure'\); }, ([0-9]+)\)\);", reader_text, "reader transit pressure", int)),
            "transitTitleDelayMs": int(extract_required(r"ghost\.style\.cursor = 'pointer';\s+ghost\.onclick = \(\) => { if \(_transitTarget\) transitTo\(_transitTarget\); };\s+}, ([0-9]+)\)\);", reader_text, "reader transit title", int)),
            "transitWarmthDelayMs": int(extract_required(r"ghost\.classList\.add\('warmth'\); }, ([0-9]+)\)\);", reader_text, "reader transit warmth", int)),
            "instrumentModalClearMs": int(extract_required(r"ov\.querySelector\('#im-box'\)\.innerHTML = '';\s+}, ([0-9]+)\);", reader_text, "reader instrument modal clear", int)),
        },
        "archive": {
            "navigationFadeMs": int(extract_required(r"window\.location\.href = row\.href; }, ([0-9]+)\);", archive_text, "archive navigation fade", int)),
            "dustCapDesktop": int(extract_required(r"const dustCap = reducedAtmospherics \? \(isMob \? 120 : 260\) : \(isMob \? 260 : ([0-9]+)\);", archive_text, "archive dust cap desktop", int)),
            "dustCapMobile": int(extract_required(r"const dustCap = reducedAtmospherics \? \(isMob \? 120 : 260\) : \(isMob \? ([0-9]+) : 500\);", archive_text, "archive dust cap mobile", int)),
            "dustCapMinimalDesktop": int(extract_required(r"const dustCap = reducedAtmospherics \? \(isMob \? 120 : ([0-9]+)\) : \(isMob \? 260 : 500\);", archive_text, "archive minimal dust cap desktop", int)),
            "dustCapMinimalMobile": int(extract_required(r"const dustCap = reducedAtmospherics \? \(isMob \? ([0-9]+) : 260\) : \(isMob \? 260 : 500\);", archive_text, "archive minimal dust cap mobile", int)),
        },
        "topology": {
            "springStiffness": int(extract_required(r"springStiffness: ([0-9]+),", topology_text, "topology spring stiffness", int)),
            "springDamping": int(extract_required(r"springDamping: ([0-9]+),", topology_text, "topology spring damping", int)),
            "silenceOnsetMs": int(extract_required(r"silenceOnsetMs: ([0-9]+),", topology_text, "topology silence onset", int)),
            "resizeMemoryAlpha": extract_required(r"resizeMemoryAlpha: ([0-9.]+),", topology_text, "topology resize memory alpha"),
            "dustCapDefault": int(extract_required(r"const dustCap = reducedAtmospherics \? 96 : ([0-9]+);", topology_text, "topology dust cap default", int)),
            "dustCapMinimal": int(extract_required(r"const dustCap = reducedAtmospherics \? ([0-9]+) : 180;", topology_text, "topology dust cap minimal", int)),
        },
        "physics": {
            "clusterStrength": extract_required(r"clusterStrength: ([0-9.]+),", physics_text, "physics cluster strength"),
            "velocityDecay": extract_required(r"velocityDecay: ([0-9.]+),", physics_text, "physics velocity decay"),
            "clusterRadiusX": extract_required(r"clusterRadiusX: ([0-9.]+),", physics_text, "physics cluster radius x"),
            "clusterRadiusY": extract_required(r"clusterRadiusY: ([0-9.]+),", physics_text, "physics cluster radius y"),
            "clusterMemoryAlpha": extract_required(r"clusterMemoryAlpha: ([0-9.]+),", physics_text, "physics cluster memory alpha"),
            "clusterMaxVelocity": extract_required(r"clusterMaxVelocity: ([0-9.]+),", physics_text, "physics cluster max velocity"),
        },
    }


def validate_generated(strict: bool) -> tuple[bool, list[str]]:
    errors: list[str] = []
    id_counter: Counter[str] = Counter()
    slug_counter: Counter[str] = Counter()

    for name in ARTIFACTS:
        path = GENERATED_DIR / name
        if not path.exists():
            errors.append(f"❌ Missing generated artifact: {path}")
            continue
        payload = load_json(path)
        if payload.get("schemaVersion") is None:
            errors.append(f"❌ schemaVersion missing in {name}")
        if payload.get("sourceHash") is None:
            errors.append(f"❌ sourceHash missing in {name}")
        if payload.get("generatedAt") is None:
            errors.append(f"❌ generatedAt missing in {name}")
        poems = payload.get("poems")
        if not isinstance(poems, list):
            errors.append(f"❌ poems list missing in {name}")
            continue
        if name != "poem-hashes.json":
            for poem in poems:
                id_counter.update([poem["id"]])
                slug_counter.update([poem["slug"]])
                if strict:
                    for field in ("id", "slug", "title", "body", "motifs"):
                        if field not in poem:
                            errors.append(f"❌ Missing {field} in {name} for {poem.get('title','?')}")

    duplicates = [key for key, count in slug_counter.items() if count > 4]
    if duplicates:
        errors.append(f"❌ Suspicious duplicate slug fan-out: {duplicates}")

    return bool(errors), errors


def validate_utf8_and_forbidden_patch() -> tuple[bool, list[str]]:
    errors: list[str] = []
    for path in REPO_ROOT.rglob("*"):
        if any(part in path.parts for part in (".git", ".next", "node_modules", "__pycache__")):
            continue
        if path.is_dir():
            continue
        if path.suffix.lower() not in TEXT_SUFFIXES:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            errors.append(f"❌ Non UTF-8 file: {path}")
            continue
        if path.suffix in {".py", ".js", ".ts", ".tsx", ".html", ".mjs"} and path.name != "build_canonical.py":
            if FORBIDDEN_NEEDLE in text:
                errors.append(f"❌ Forbidden runtime patch found: {path}")
    return bool(errors), errors


def validate_orphans() -> tuple[bool, list[str]]:
    errors: list[str] = []
    lens_path = LITERARY_DIR / "critical-lens.json"
    final_path = GENERATED_DIR / "poems-final.json"
    if not lens_path.exists() or not final_path.exists():
        return False, errors
    lens = load_json(lens_path)
    final_payload = load_json(final_path)
    final_ids = {poem["id"] for poem in final_payload.get("poems", []) if isinstance(poem, dict)}
    referenced_ids: set[str] = set()
    for entry in lens:
        if not isinstance(entry, dict):
            continue
        poem_ids = entry.get("poemId", [])
        if isinstance(poem_ids, list):
            referenced_ids.update(pid for pid in poem_ids if isinstance(pid, str))
        elif isinstance(poem_ids, str):
            referenced_ids.add(poem_ids)
    orphans = referenced_ids - final_ids
    if orphans:
        errors.append(f"❌ Orphan critical-lens ids: {sorted(orphans)}")
    return bool(errors), errors


def validate_duplicate_runtime() -> tuple[bool, list[str]]:
    warnings: list[str] = []
    for name in RUNTIME_FILES:
        root_path = REPO_ROOT / name
        public_path = REPO_ROOT / "public" / name
        if root_path.exists() and public_path.exists():
            warnings.append(f"⚠ Duplicate runtime retained for PR 4: {name}")
    return False, warnings


def sha256_file(path: Path) -> str:
    import hashlib

    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(65536), b""):
            digest.update(chunk)
    return digest.hexdigest()


def validate_runtime_manifest() -> tuple[bool, list[str]]:
    errors: list[str] = []
    if not RUNTIME_MANIFEST_PATH.exists():
        return True, [f"❌ Missing runtime manifest: {RUNTIME_MANIFEST_PATH}"]

    payload = load_json(RUNTIME_MANIFEST_PATH)
    if payload.get("runtimeVersion") != RUNTIME_VERSION:
        errors.append(
            f"❌ runtime-manifest runtimeVersion mismatch: expected {RUNTIME_VERSION}, got {payload.get('runtimeVersion')}"
        )
    entries = payload.get("entries")
    files = payload.get("files")
    if not isinstance(entries, dict):
        errors.append("❌ runtime-manifest entries missing or invalid")
        return True, errors
    if not isinstance(files, list):
        errors.append("❌ runtime-manifest files missing or invalid")
        return True, errors

    file_hashes = {}
    for item in files:
        rel_path = item.get("path")
        expected = item.get("sha256")
        if not isinstance(rel_path, str) or not isinstance(expected, str):
            errors.append("❌ runtime-manifest file item missing path/sha256")
            continue
        path = LITERARY_DIR / rel_path
        if not path.exists():
            errors.append(f"❌ runtime-manifest references missing file: {path}")
            continue
        actual = sha256_file(path)
        file_hashes[rel_path] = actual
        if actual != expected:
            errors.append(f"❌ runtime-manifest hash mismatch: {rel_path}")

    for entry_name, item in entries.items():
        runtime_file = item.get("file")
        dependencies = item.get("dependencies")
        if not isinstance(runtime_file, str):
            errors.append(f"❌ runtime-manifest entry missing file: {entry_name}")
            continue
        if not (LITERARY_DIR / runtime_file).exists():
            errors.append(f"❌ runtime entry file missing: {entry_name} -> {runtime_file}")
        if item.get("sha256") != file_hashes.get(runtime_file):
            errors.append(f"❌ runtime entry hash mismatch: {entry_name} -> {runtime_file}")
        if not isinstance(dependencies, list):
            errors.append(f"❌ runtime entry dependencies missing: {entry_name}")
            continue
        for dep in dependencies:
            if not isinstance(dep, str) or not (LITERARY_DIR / dep).exists():
                errors.append(f"❌ runtime entry dependency missing: {entry_name} -> {dep}")

    return bool(errors), errors


def validate_phenomenology_snapshot() -> tuple[bool, list[str]]:
    errors: list[str] = []
    if not PHENOMENOLOGY_SNAPSHOT_PATH.exists():
        return True, [f"❌ Missing phenomenology snapshot: {PHENOMENOLOGY_SNAPSHOT_PATH}"]
    expected = load_json(PHENOMENOLOGY_SNAPSHOT_PATH)
    actual = build_phenomenology_snapshot()
    if expected != actual:
        errors.append("❌ Phenomenology snapshot drift detected.")
        expected_blob = json.dumps(expected, ensure_ascii=False, sort_keys=True)
        actual_blob = json.dumps(actual, ensure_ascii=False, sort_keys=True)
        if expected_blob != actual_blob:
            errors.append(f"   expected: {expected_blob}")
            errors.append(f"   actual:   {actual_blob}")
    return bool(errors), errors


def validate_runtime_preservation() -> tuple[bool, list[str]]:
    errors: list[str] = []

    for name in RUNTIME_FILES:
        root_path = REPO_ROOT / name
        public_path = REPO_ROOT / "public" / name
        literary_path = LITERARY_DIR / name
        if root_path.exists():
            errors.append(f"❌ Duplicate runtime file still in repo root: {root_path}")
        if public_path.exists():
            errors.append(f"❌ Duplicate runtime file still in public root: {public_path}")
        if not literary_path.exists():
            errors.append(f"❌ Literary runtime file missing: {literary_path}")

    for name in FORBIDDEN_ROOT_RUNTIME:
        path = REPO_ROOT / name
        if path.exists():
            errors.append(f"❌ Runtime support file still in repo root: {path}")

    public_root = REPO_ROOT / "public"
    for name in FORBIDDEN_PUBLIC_RUNTIME:
        path = public_root / name
        if path.exists():
            errors.append(f"❌ Runtime support file still in public root: {path}")

    for name in LITERARY_REQUIRED:
        path = LITERARY_DIR / name
        if not path.exists():
            errors.append(f"❌ Required literary runtime asset missing: {path}")

    for name in FORBIDDEN_PUBLIC_RUNTIME_DIRS:
        path = public_root / name
        if path.exists():
            errors.append(f"❌ Runtime support directory still in public root: {path}")

    for name in LITERARY_REQUIRED_DIRS:
        path = LITERARY_DIR / name
        if not path.exists() or not path.is_dir():
            errors.append(f"❌ Required literary runtime directory missing: {path}")

    baseline_path = REPO_ROOT / "PHENOMENOLOGY_BASELINE.md"
    if baseline_path.exists():
        baseline_text = baseline_path.read_text(encoding="utf-8")
        for needle in BASELINE_NEEDLES:
            if needle not in baseline_text:
                errors.append(f"❌ Baseline constant missing from PHENOMENOLOGY_BASELINE.md: {needle}")
    else:
        errors.append(f"❌ Missing baseline file: {baseline_path}")

    for rel_path, needles in RUNTIME_CONSTANT_NEEDLES.items():
        path = REPO_ROOT / rel_path
        if not path.exists():
            errors.append(f"❌ Missing runtime constant source file: {path}")
            continue
        text = path.read_text(encoding="utf-8")
        for needle in needles:
            if needle not in text:
                errors.append(f"❌ Runtime preservation constant missing in {rel_path}: {needle}")

    manifest_failed, manifest_errors = validate_runtime_manifest()
    errors.extend(manifest_errors)
    snapshot_failed, snapshot_errors = validate_phenomenology_snapshot()
    errors.extend(snapshot_errors)

    return bool(errors), errors


def write_report(lines: list[str]) -> None:
    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    parser = argparse.ArgumentParser(description="Validate canonical generated artifacts.")
    parser.add_argument("--strict", action="store_true")
    parser.add_argument("--preserve-runtime", action="store_true")
    args = parser.parse_args()

    sections: list[str] = []
    has_error = False
    validations = [validate_generated, validate_utf8_and_forbidden_patch, validate_orphans, validate_duplicate_runtime]
    if args.preserve_runtime:
        validations.append(validate_runtime_preservation)
    for fn in validations:
        failed, lines = fn(args.strict) if fn is validate_generated else fn()
        has_error = has_error or failed
        sections.extend(lines)

    if not sections:
        sections.append("✅ All hygiene checks passed.")
    write_report(sections)
    for line in sections:
        print(line)
    if has_error:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
