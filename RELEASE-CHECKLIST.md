# Before this site goes live

This branch (`redesign`) is a full redesign and has NOT been published. Nothing is deployed until `main` is pushed (GitHub Pages serves `main`).

## Fill in
- [x] GitHub address: the repository is `https://github.com/tylerkaska112/PortHole` (already created, currently empty). The Get it page links to its Releases page.
- [ ] Download page: when the first release exists, replace the "isn't out yet" box with the IPA, its SHA-256 and the source link.
- [ ] `compat.json`: regenerate the snapshot with `tools/publish_compat_snapshot.py` (in the app repo) so the list is current.
- [ ] Check every claim on the home page against the build that is released (controller badges, Steam downloads, setup guide).

## Keep it fresh
- [ ] After adding or replacing a picture in `img/` run `./optimize-images.sh` (WebP copies, small logos, the JPEG link-preview card).
- [ ] Before publishing run `python3 tools/refresh_site_content.py` in the app repo: it rewrites the changelog's "Every build" list, the Get it page's newest-build line and the sitemap dates from `CHANGELOG.json`.
- [ ] Refresh the numbers on the home page's "What runs, and how well": `tools/publish_compat_snapshot.py` (it reads `compat.json`).

## Check
- [ ] Open every page in light and dark mode, on a phone width and a desktop width.
- [ ] `https://portholehq.site/img/og-image.png` loads (link previews).
- [ ] The privacy page still matches what the released app sends.

## Images
The pictures in `img/` are drawn by `tools/make_icon.swift` in the app repo (`porthole-sunset.png`, `porthole-night.png`, the favicons and the apple touch icon). `og-image.png` is a 1200 x 630 card made from the sunset porthole.
