---
inclusion: auto
---

# Changelog Maintenance

When making changes that result in a version bump or significant feature addition:

1. Update `CHANGELOG.md` at the project root
2. Follow the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) format
3. Group changes under: Added, Changed, Fixed, Deprecated, Removed, Security
4. Place new entries under an `## [Unreleased]` section until the version is published
5. When bumping the version in `package.json`, move unreleased items to a versioned heading with the release date
6. Keep entries concise but descriptive (one line per change)
7. Do not use em dashes in changelog entries
