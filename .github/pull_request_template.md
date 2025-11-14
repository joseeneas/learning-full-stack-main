# feat(student): enable Edit Student (backend PUT + frontend drawer)

## Summary

Enable Edit Student functionality end-to-end.

## Changes

- Backend: add `PUT /api/v1/students/{id}`
- Service: implement `updateStudent` with email uniqueness check and partial field updates
- Repository: add `existsByEmailAndIdNot(String email, Long id)`
- Frontend: add `updateStudent(id, body)` API, wire Edit button to open a prefilled drawer, reuse the existing form for create/edit
- UX: persist table page size selection via localStorage

## Backend Details

- `StudentController`: new `@PutMapping("{studentId}")`
- `StudentService`: `updateStudent(Long id, Student update)`
  - 404 if student not found
  - 400 if email is already used by a different student
  - updates `name`, `email`, `gender` when present
- `StudentRepository`: `existsByEmailAndIdNot`

## Frontend Details

- `Client.js`: `updateStudent(studentId, student)` uses HTTP PUT
- `StudentDrawerForm.js`: accepts `initialValues` and optional `onSubmit`; sets title per mode; uses `destroyOnClose` and keyed `Form` to re-mount with values
- `App.js`: tracks `editingStudent`; Edit opens drawer prefilled; Add opens empty; submit calls update or create accordingly

## Testing Notes

- Built and ran unit tests with Spring Boot 3.5.7
- Manual check: edit a student, change email/name/gender, submit; table refreshes with new data

## Checklist

- [x] Backend compiles and tests pass
- [x] Frontend builds
- [x] Edit path validated manually
- [x] No breaking changes to existing create/delete flows
