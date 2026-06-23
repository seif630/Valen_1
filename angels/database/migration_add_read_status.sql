-- Migration to add read status to contact_messages table

ALTER TABLE contact_messages
ADD is_read BIT DEFAULT 0 NOT NULL;
