-- Migration to add contact_messages table

CREATE TABLE contact_messages (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL,
    subject NVARCHAR(255) NOT NULL,
    message NVARCHAR(MAX) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
