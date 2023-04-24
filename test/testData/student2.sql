--
-- PostgreSQL database dump
--
-- Dumped from database version 13.8 (Debian 13.8-0+deb11u1)
-- Dumped by pg_dump version 15.0
SET statement_timeout = 0;

SET lock_timeout = 0;

SET idle_in_transaction_session_timeout = 0;

SET client_encoding = 'UTF8';

SET standard_conforming_strings = ON;

SELECT
    pg_catalog.SET_CONFIG('search_path' , '' , FALSE);

SET check_function_bodies = FALSE;

SET xmloption = content;

SET client_min_messages = warning;

SET row_security = OFF;

--
-- Name: student2_username; Type: SCHEMA; Schema: -; Owner: student2_username
--
CREATE SCHEMA student2_username;

ALTER SCHEMA student2_username OWNER TO student2_username;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: actionability; Type: TABLE; Schema: student2_username; Owner: student2_username
--
CREATE TABLE student2_username.actionability (
    hgnc_id character varying(100) NOT NULL
    , mondo_id character varying(100) NOT NULL
    , actionability_assertion_classifications character varying(2048) NOT NULL
    , actionability_assertion_reports character varying(2048) NOT NULL
    , actionability_groups character varying(2048) NOT NULL
);

ALTER TABLE student2_username.actionability OWNER TO student2_username;

--
-- Name: disease; Type: TABLE; Schema: student2_username; Owner: student2_username
--
CREATE TABLE student2_username.disease (
    "DISEASE ID (MONDO)" character varying(100) NOT NULL
    , "DISEASE LABEL" character varying(2048) NOT NULL
);

ALTER TABLE student2_username.disease OWNER TO student2_username;

--
-- Name: dosage_sensitivity; Type: TABLE; Schema: student2_username; Owner: student2_username
--
CREATE TABLE student2_username.dosage_sensitivity (
    "HGNC ID" character varying(100) NOT NULL
    , haploinsufficiency character varying(2048) NOT NULL
    , "ONLINE REPORT" character varying(2048) NOT NULL
    , "LAST EVALUATION DATE" timestamp with time zone NOT NULL
);

ALTER TABLE student2_username.dosage_sensitivity OWNER TO student2_username;

--
-- Name: gene; Type: TABLE; Schema: student2_username; Owner: student2_username
--
CREATE TABLE student2_username.gene (
    hgnc_id character varying(100) NOT NULL
    , gene_symbol character varying(100) NOT NULL
    , gene_url character varying(1024) NOT NULL
);

ALTER TABLE student2_username.gene OWNER TO student2_username;

--
-- Name: gene_disease_validity; Type: TABLE; Schema: student2_username; Owner: student2_username
--
CREATE TABLE student2_username.gene_disease_validity (
    "GENE ID (HGNC)" character varying(100) NOT NULL
    , "DISEASE ID (MONDO)" character varying(100) NOT NULL
    , "MOI" character varying(10) NOT NULL
    , sop character varying(10) NOT NULL
    , classification character varying(100) NOT NULL
    , "ONLINE REPORT" character varying(2048) NOT NULL
    , "CLASSIFICATION DATE" timestamp with time zone NOT NULL
    , gcep character varying(1024) NOT NULL
);

ALTER TABLE student2_username.gene_disease_validity OWNER TO student2_username;

--
-- Name: triplosensitivity; Type: TABLE; Schema: student2_username; Owner: student2_username
--
CREATE TABLE student2_username.triplosensitivity (
    "HGNC ID" character varying(100) NOT NULL
    , triplosensitivity character varying(2048) NOT NULL
);

ALTER TABLE student2_username.triplosensitivity OWNER TO student2_username;

--
-- Data for Name: actionability; Type: TABLE DATA; Schema: student2_username; Owner: student2_username
--
COPY student2_username.actionability (hgnc_id, mondo_id, actionability_assertion_classifications, actionability_assertion_reports, actionability_groups) FROM stdin;
\.

--
-- Data for Name: disease; Type: TABLE DATA; Schema: student2_username; Owner: student2_username
--
COPY student2_username.disease ("DISEASE ID (MONDO)", "DISEASE LABEL") FROM stdin;
\.

--
-- Data for Name: dosage_sensitivity; Type: TABLE DATA; Schema: student2_username; Owner: student2_username
--
COPY student2_username.dosage_sensitivity ("HGNC ID", haploinsufficiency, "ONLINE REPORT", "LAST EVALUATION DATE") FROM stdin;
\.

--
-- Data for Name: gene; Type: TABLE DATA; Schema: student2_username; Owner: student2_username
--
COPY student2_username.gene (hgnc_id, gene_symbol, gene_url) FROM stdin;
\.

--
-- Data for Name: gene_disease_validity; Type: TABLE DATA; Schema: student2_username; Owner: student2_username
--
COPY student2_username.gene_disease_validity ("GENE ID (HGNC)", "DISEASE ID (MONDO)", "MOI", sop, classification, "ONLINE REPORT", "CLASSIFICATION DATE", gcep) FROM stdin;
\.

--
-- Data for Name: triplosensitivity; Type: TABLE DATA; Schema: student2_username; Owner: student2_username
--
COPY student2_username.triplosensitivity ("HGNC ID", triplosensitivity) FROM stdin;
\.

--
-- Name: disease disease_pkey; Type: CONSTRAINT; Schema: student2_username; Owner: student2_username
--
ALTER TABLE ONLY student2_username.disease
    ADD CONSTRAINT disease_pkey PRIMARY KEY ("DISEASE ID (MONDO)");

--
-- Name: dosage_sensitivity dosage_sensitivity_pkey; Type: CONSTRAINT; Schema: student2_username; Owner: student2_username
--
ALTER TABLE ONLY student2_username.dosage_sensitivity
    ADD CONSTRAINT dosage_sensitivity_pkey PRIMARY KEY ("HGNC ID");

--
-- Name: gene gene_pkey; Type: CONSTRAINT; Schema: student2_username; Owner: student2_username
--
ALTER TABLE ONLY student2_username.gene
    ADD CONSTRAINT gene_pkey PRIMARY KEY (hgnc_id);

--
-- Name: actionability pk_actionability; Type: CONSTRAINT; Schema: student2_username; Owner: student2_username
--
ALTER TABLE ONLY student2_username.actionability
    ADD CONSTRAINT pk_actionability PRIMARY KEY (hgnc_id , mondo_id);

--
-- Name: gene_disease_validity pk_gene_disease_validity; Type: CONSTRAINT; Schema: student2_username; Owner: student2_username
--
ALTER TABLE ONLY student2_username.gene_disease_validity
    ADD CONSTRAINT pk_gene_disease_validity PRIMARY KEY ("GENE ID (HGNC)" , "DISEASE ID (MONDO)" , "MOI");

--
-- Name: triplosensitivity triplosensitivity_pkey; Type: CONSTRAINT; Schema: student2_username; Owner: student2_username
--
ALTER TABLE ONLY student2_username.triplosensitivity
    ADD CONSTRAINT triplosensitivity_pkey PRIMARY KEY ("HGNC ID");

--
-- Name: actionability fk_a_disease; Type: FK CONSTRAINT; Schema: student2_username; Owner: student2_username
--
ALTER TABLE ONLY student2_username.actionability
    ADD CONSTRAINT fk_a_disease FOREIGN KEY (mondo_id) REFERENCES student2_username.disease ("DISEASE ID (MONDO)");

--
-- Name: actionability fk_a_gene; Type: FK CONSTRAINT; Schema: student2_username; Owner: student2_username
--
ALTER TABLE ONLY student2_username.actionability
    ADD CONSTRAINT fk_a_gene FOREIGN KEY (hgnc_id) REFERENCES student2_username.gene (hgnc_id);

--
-- Name: dosage_sensitivity fk_ds_gene; Type: FK CONSTRAINT; Schema: student2_username; Owner: student2_username
--
ALTER TABLE ONLY student2_username.dosage_sensitivity
    ADD CONSTRAINT fk_ds_gene FOREIGN KEY ("HGNC ID") REFERENCES student2_username.gene (hgnc_id);

--
-- Name: dosage_sensitivity fk_ds_triplosensitivity; Type: FK CONSTRAINT; Schema: student2_username; Owner: student2_username
--
ALTER TABLE ONLY student2_username.dosage_sensitivity
    ADD CONSTRAINT fk_ds_triplosensitivity FOREIGN KEY ("HGNC ID") REFERENCES student2_username.triplosensitivity ("HGNC ID");

--
-- Name: gene_disease_validity fk_gdv_disease; Type: FK CONSTRAINT; Schema: student2_username; Owner: student2_username
--
ALTER TABLE ONLY student2_username.gene_disease_validity
    ADD CONSTRAINT fk_gdv_disease FOREIGN KEY ("DISEASE ID (MONDO)") REFERENCES student2_username.disease ("DISEASE ID (MONDO)");

--
-- Name: gene_disease_validity fk_gdv_gene; Type: FK CONSTRAINT; Schema: student2_username; Owner: student2_username
--
ALTER TABLE ONLY student2_username.gene_disease_validity
    ADD CONSTRAINT fk_gdv_gene FOREIGN KEY ("GENE ID (HGNC)") REFERENCES student2_username.gene (hgnc_id);

--
-- PostgreSQL database dump complete
--
