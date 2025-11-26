-- Table: public.student

-- DROP TABLE IF EXISTS public.student;

CREATE TABLE IF NOT EXISTS public.student
(
    id bigint NOT NULL,
    email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    gender character varying(255) COLLATE pg_catalog."default" NOT NULL,
    name character varying(255) COLLATE pg_catalog."default" NOT NULL,
    major character varying(255) COLLATE pg_catalog."default",
    minor character varying(255) COLLATE pg_catalog."default",
    nationality character varying(255) COLLATE pg_catalog."default",
    college character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT student_pkey PRIMARY KEY (id),
    CONSTRAINT ukfe0i52si7ybu0wjedj6motiim UNIQUE (email),
    CONSTRAINT student_gender_check CHECK (gender::text = ANY (ARRAY['MALE'::character varying, 'FEMALE'::character varying, 'OTHER'::character varying]::text[]))
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.student
    OWNER to eneas;

REVOKE ALL ON TABLE public.student FROM syscomz;

GRANT ALL ON TABLE public.student TO eneas;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE public.student TO syscomz;