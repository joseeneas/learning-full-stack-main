# Changelog

All notable changes to this project will be documented in this file.

This project follows a simplified Keep a Changelog format.

## 2025-11-13

### Changed

- Frontend (UI polish): replace `Radio.Group` with `Space` for action buttons in the Students table.
- Frontend (buttons): use `size="small"` for Delete and Edit buttons.
- Frontend (avatar): harden `TheAvatar` to safely handle null/undefined/empty names and avoid runtime errors.
- Frontend (menu): fix `defaultSelectedKeys` to use an existing key (`'sub1'`).
- Frontend (footer): replace invalid `<sp>` tags with proper spacing using `{' '}`.

### Build

- Verified `npm run build` compiles successfully after UI updates.

### Reference

- Commit: `1bca30c` – "chore(frontend): replace Radio.Group with Space, small buttons; harden TheAvatar; fix menu key and footer spacing"
