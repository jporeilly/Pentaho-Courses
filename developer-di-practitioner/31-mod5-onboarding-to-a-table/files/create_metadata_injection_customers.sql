-- Target table for the Onboarding to a Table workshop (MySQL sampledata).
-- Its columns are the template's OUTPUT after injection: customers.txt's
-- fields, with id renamed to key_id and stateCode removed.
-- Run it once in DBeaver as pentaho_admin before the first run.

CREATE TABLE IF NOT EXISTS METADATA_INJECTION_CUSTOMERS (
  key_id    VARCHAR(3),
  name      VARCHAR(10),
  firstname VARCHAR(13),
  zip       VARCHAR(5),
  city      VARCHAR(8),
  birthdate DATETIME,
  street    VARCHAR(11),
  housenr   VARCHAR(3),
  state     VARCHAR(30)
);
