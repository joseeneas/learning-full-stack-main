SPRING_DATASOURCE_URL = jdbc:postgresql://awseb-e-vvrexpsbmg-stack-awsebrdsdatabase-hb8niodpfih2.cr08uw0iyflv.us-east-1.rds.amazonaws.com:5432/ebdb
SPRING_DATASOURCE_USERNAME = postgres  
SPRING_DATASOURCE_PASSWORD = [YOUR_PASSWORD_YOU_SET_WHEN_CREATING_DB]



Plain text
SPRING_DATASOURCE_PASSWORD
top2gun6

Plain text
SPRING_DATASOURCE_URL
jdbc:postgresql://awseb-e-vvrexpsbmg-stack-awsebrdsdatabase-hb8niodpfih2.cr08uw0iyflv.us-east-1.rds.amazonaws.com:5432/ebdb
jdbc:postgresql://awseb-e-kfxwpczupn-stack-awsebrdsdatabase-7oc89vgwuoct.cr08uw0iyflv.us-east-1.rds.amazonaws.com:5432/ebdb

Plain text
SPRING_DATASOURCE_USERNAME
postgres

Plain text
SPRING_PROFILES_ACTIVE
dev



CREATE TABLE IF NOT EXISTS student (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    gender VARCHAR(50) NOT NULL
);
ALTER TABLE student ADD COLUMN nationality VARCHAR(100);
ALTER TABLE student ADD COLUMN college VARCHAR(100);
ALTER TABLE student ADD COLUMN major VARCHAR(100);
ALTER TABLE student ADD COLUMN minor VARCHAR(100);