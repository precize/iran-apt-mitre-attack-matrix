# Precize - Iran-Linked MITRE ATT&CK Enterprise Matrix

## What it contains

- `index.html` - external-facing static site
- `assets/` - site CSS and JavaScript
- `data/generated_layers/*.json` - one per-group Navigator layer generated from MITRE ATT&CK Excel mappings
- `data/iran_attack_aggregated_layer.json` - combined Navigator layer across all selected groups
- `data/manifest.json` - full machine-readable dataset used by the site
- `data/validation.json` - validation summary
- `data/enterprise-attack-v18.1-groups.xlsx` - MITRE ATT&CK source file
- `data/enterprise-attack-v18.1-techniques.xlsx` - MITRE ATT&CK source file
- `data/enterprise-attack-v18.1-tactics.xlsx` - MITRE ATT&CK source file
- `scripts/build_repo.py` - regeneration script

## Build logic

This repository uses MITRE ATT&CK Excel v18.1 files from the official ATT&CK Data & Tools page.

1. Group descriptions are taken from `groups.xlsx`.
2. Group-to-technique mappings are taken from `groups.xlsx` → `techniques used`.
3. Technique names, URLs, tactics, and platforms are taken from `techniques.xlsx`.
4. Per-group local layer files are generated in `data/generated_layers/`.
5. The combined layer in `data/iran_attack_aggregated_layer.json` scores each technique by the number of selected groups that use it.

## Selected group IDs

### Group IDs and names

- G1030	**Agrius**
- G0130	**Ajax Security Team**
- G0064	**APT33**
- G0087	**APT39** 
- G1044	**APT42** 
- G0003	**Cleaver** 
- G0052	**CopyKittens** 
- G1012	**CURIUM**
- G1027	**CyberAv3ngers** 
- G0137	**Ferocious Kitten** 
- G0117	**Fox Kitten** 
- G0043	**Group5** 
- G0077	**Leafminer** 
- G0059	**Magic Hound**
- G1009	**Moses Staff**
- G0069	**MuddyWater** 
- G0049	**OilRig**
- G0122	**Silent Librarian**

## Open the combined matrix in ATT&CK Navigator

1. Go to the MITRE ATT&CK Navigator https://mitre-attack.github.io/attack-navigator/
2. Choose **Open Existing Layer**.
3. Upload `data/iran_attack_aggregated_layer.json` or point to https://github.com/precize/precize-iran-mitre-matrix/blob/main/data/iran_attack_aggregated_layer.json

## Notes

- The repository keeps the original MITRE Excel source files so external reviewers can reproduce the build.
- The per-group JSON files are generated locally from those MITRE mappings. They are intended for GitHub sharing and ATT&CK Navigator loading.
