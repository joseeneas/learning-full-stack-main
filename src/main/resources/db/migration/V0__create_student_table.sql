-- Initial schema: create student table with base columns
CREATE TABLE IF NOT EXISTS student (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    gender VARCHAR(50) NOT NULL
);
