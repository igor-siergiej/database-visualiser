--
-- PostgreSQL database dump
--

-- Dumped from database version 13.8 (Debian 13.8-0+deb11u1)
-- Dumped by pg_dump version 13.8 (Debian 13.8-0+deb11u1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: student_username; Type: SCHEMA; Schema: -; Owner: student_username
--

CREATE SCHEMA student_username;


ALTER SCHEMA student_username OWNER TO student_username;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: localauthority; Type: TABLE; Schema: student_username; Owner: student_username
--

CREATE TABLE student_username.localauthority (
    name character varying(20) NOT NULL,
    total_population_above_3yrs integer NOT NULL,
    welsh_speaker_yes integer NOT NULL,
    welsh_speaker_no integer NOT NULL,
    "edspend_2017¬_18" numeric(10,2) NOT NULL,
    edspend_2018_19 numeric(10,2) NOT NULL,
    edspend_2019_20 numeric(10,2) NOT NULL,
    polauth_id character(9)
);


ALTER TABLE student_username.localauthority OWNER TO student_username;

--
-- Name: policeauthority; Type: TABLE; Schema: student_username; Owner: student_username
--

CREATE TABLE student_username.policeauthority (
    polauth_id character(9) NOT NULL,
    name character varying(20) NOT NULL
);


ALTER TABLE student_username.policeauthority OWNER TO student_username;

--
-- Name: policeauthority_crime; Type: TABLE; Schema: student_username; Owner: student_username
--

CREATE TABLE student_username.policeauthority_crime (
    polauth_id character(9) NOT NULL,
    total_crime integer NOT NULL,
    violence_against_the_person4 integer NOT NULL,
    homicide integer NOT NULL,
    violence_with_injury integer NOT NULL,
    violence_without_injury integer NOT NULL,
    stalking_and_harassment_5 integer NOT NULL,
    death_or_serious_injury_unlawful_driving_5 integer NOT NULL,
    sexual_offences integer NOT NULL,
    robbery integer NOT NULL,
    theft_offences integer NOT NULL,
    burglary integer NOT NULL,
    residential_burglary6 integer NOT NULL,
    non_residential_burglary6 integer NOT NULL,
    vehicle_offences integer NOT NULL,
    theft_from_the_person integer NOT NULL,
    bicycle_theft integer NOT NULL,
    shoplifting integer NOT NULL,
    other_theft_offences integer NOT NULL,
    criminal_damage_and_arson integer NOT NULL,
    drug_offences integer NOT NULL,
    possession_of_weapons_offences integer NOT NULL,
    public_order_offences integer NOT NULL,
    miscellaneous_crimes integer NOT NULL
);


ALTER TABLE student_username.policeauthority_crime OWNER TO student_username;

--
-- Data for Name: localauthority; Type: TABLE DATA; Schema: student_username; Owner: student_username
--

COPY student_username.localauthority (name, total_population_above_3yrs, welsh_speaker_yes, welsh_speaker_no, "edspend_2017¬_18", edspend_2018_19, edspend_2019_20, polauth_id) FROM stdin;
\.


--
-- Data for Name: policeauthority; Type: TABLE DATA; Schema: student_username; Owner: student_username
--

COPY student_username.policeauthority (polauth_id, name) FROM stdin;
\.


--
-- Data for Name: policeauthority_crime; Type: TABLE DATA; Schema: student_username; Owner: student_username
--

COPY student_username.policeauthority_crime (polauth_id, total_crime, violence_against_the_person4, homicide, violence_with_injury, violence_without_injury, stalking_and_harassment_5, death_or_serious_injury_unlawful_driving_5, sexual_offences, robbery, theft_offences, burglary, residential_burglary6, non_residential_burglary6, vehicle_offences, theft_from_the_person, bicycle_theft, shoplifting, other_theft_offences, criminal_damage_and_arson, drug_offences, possession_of_weapons_offences, public_order_offences, miscellaneous_crimes) FROM stdin;
\.


--
-- Name: localauthority localauthority_pkey; Type: CONSTRAINT; Schema: student_username; Owner: student_username
--

ALTER TABLE ONLY student_username.localauthority
    ADD CONSTRAINT localauthority_pkey PRIMARY KEY (name);


--
-- Name: policeauthority_crime policeauthority_crime_pkey; Type: CONSTRAINT; Schema: student_username; Owner: student_username
--

ALTER TABLE ONLY student_username.policeauthority_crime
    ADD CONSTRAINT policeauthority_crime_pkey PRIMARY KEY (polauth_id);


--
-- Name: policeauthority policeauthority_pkey; Type: CONSTRAINT; Schema: student_username; Owner: student_username
--

ALTER TABLE ONLY student_username.policeauthority
    ADD CONSTRAINT policeauthority_pkey PRIMARY KEY (polauth_id);


--
-- Name: policeauthority_crime polauth_id; Type: FK CONSTRAINT; Schema: student_username; Owner: student_username
--

ALTER TABLE ONLY student_username.policeauthority_crime
    ADD CONSTRAINT polauth_id FOREIGN KEY (polauth_id) REFERENCES student_username.policeauthority(polauth_id);


--
-- Name: localauthority polauth_id; Type: FK CONSTRAINT; Schema: student_username; Owner: student_username
--

ALTER TABLE ONLY student_username.localauthority
    ADD CONSTRAINT polauth_id FOREIGN KEY (polauth_id) REFERENCES student_username.policeauthority_crime(polauth_id);


--
-- PostgreSQL database dump complete
--

