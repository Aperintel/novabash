-- Adds the validation-result columns referenced by the Key Health system.
-- Runs after the initial table migration.

alter table credentials
  add column if not exists last_validation_ok boolean,
  add column if not exists last_validation_error text;
