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
-- Name: studentid_anon3; Type: SCHEMA; Schema: -; Owner: studentid_anon3
--

CREATE SCHEMA studentid_anon3;


ALTER SCHEMA studentid_anon3 OWNER TO studentid_anon3;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: drivers; Type: TABLE; Schema: studentid_anon3; Owner: studentid_anon3
--

CREATE TABLE studentid_anon3.drivers (
    given_name character varying(200) NOT NULL,
    last_name character varying(200) DEFAULT '---'::character varying NOT NULL,
    driver_code character(3) NOT NULL,
    nationality character(3) NOT NULL
);


ALTER TABLE studentid_anon3.drivers OWNER TO studentid_anon3;

--
-- Name: races; Type: TABLE; Schema: studentid_anon3; Owner: studentid_anon3
--

CREATE TABLE studentid_anon3.races (
    grandprix character varying(200) NOT NULL,
    date timestamp without time zone NOT NULL,
    winner_given_name character varying(200) NOT NULL,
    winner_last_name character varying(200) DEFAULT '---'::character varying NOT NULL,
    winner_driver_code character(3) NOT NULL,
    constructor character varying(200) NOT NULL,
    laps integer NOT NULL,
    race_duration time without time zone NOT NULL
);


ALTER TABLE studentid_anon3.races OWNER TO studentid_anon3;

--
-- Name: tweets; Type: TABLE; Schema: studentid_anon3; Owner: studentid_anon3
--

CREATE TABLE studentid_anon3.tweets (
    username character varying(15) NOT NULL,
    date timestamp without time zone NOT NULL,
    "time" time without time zone NOT NULL,
    text character varying(280) NOT NULL,
    is_retweet boolean NOT NULL
);


ALTER TABLE studentid_anon3.tweets OWNER TO studentid_anon3;

--
-- Name: twitter_user; Type: TABLE; Schema: studentid_anon3; Owner: studentid_anon3
--

CREATE TABLE studentid_anon3.twitter_user (
    username character varying(15) NOT NULL,
    user_description character varying(1000),
    user_created timestamp without time zone NOT NULL,
    user_followers integer NOT NULL,
    user_friends integer NOT NULL,
    user_favourites integer NOT NULL,
    user_verified boolean DEFAULT false NOT NULL
);


ALTER TABLE studentid_anon3.twitter_user OWNER TO studentid_anon3;

--
-- Data for Name: drivers; Type: TABLE DATA; Schema: studentid_anon3; Owner: studentid_anon3
--

COPY studentid_anon3.drivers (given_name, last_name, driver_code, nationality) FROM stdin;
\.


--
-- Data for Name: races; Type: TABLE DATA; Schema: studentid_anon3; Owner: studentid_anon3
--

COPY studentid_anon3.races (grandprix, date, winner_given_name, winner_last_name, winner_driver_code, constructor, laps, race_duration) FROM stdin;
\.


--
-- Data for Name: tweets; Type: TABLE DATA; Schema: studentid_anon3; Owner: studentid_anon3
--

COPY studentid_anon3.tweets (username, date, "time", text, is_retweet) FROM stdin;
\.


--
-- Data for Name: twitter_user; Type: TABLE DATA; Schema: studentid_anon3; Owner: studentid_anon3
--

COPY studentid_anon3.twitter_user (username, user_description, user_created, user_followers, user_friends, user_favourites, user_verified) FROM stdin;
\.


--
-- Name: drivers drivers_pkey; Type: CONSTRAINT; Schema: studentid_anon3; Owner: studentid_anon3
--

ALTER TABLE ONLY studentid_anon3.drivers
    ADD CONSTRAINT drivers_pkey PRIMARY KEY (given_name, last_name, driver_code);


--
-- Name: races races_pkey; Type: CONSTRAINT; Schema: studentid_anon3; Owner: studentid_anon3
--

ALTER TABLE ONLY studentid_anon3.races
    ADD CONSTRAINT races_pkey PRIMARY KEY (date);


--
-- Name: tweets tweets_pkey; Type: CONSTRAINT; Schema: studentid_anon3; Owner: studentid_anon3
--

ALTER TABLE ONLY studentid_anon3.tweets
    ADD CONSTRAINT tweets_pkey PRIMARY KEY (username, date, "time");


--
-- Name: twitter_user twitter_user_pkey; Type: CONSTRAINT; Schema: studentid_anon3; Owner: studentid_anon3
--

ALTER TABLE ONLY studentid_anon3.twitter_user
    ADD CONSTRAINT twitter_user_pkey PRIMARY KEY (username);


--
-- Name: races races_winner_given_name_winner_last_name_winner_driver_cod_fkey; Type: FK CONSTRAINT; Schema: studentid_anon3; Owner: studentid_anon3
--

ALTER TABLE ONLY studentid_anon3.races
    ADD CONSTRAINT races_winner_given_name_winner_last_name_winner_driver_cod_fkey FOREIGN KEY (winner_given_name, winner_last_name, winner_driver_code) REFERENCES studentid_anon3.drivers(given_name, last_name, driver_code);


--
-- Name: tweets tweets_date_fkey; Type: FK CONSTRAINT; Schema: studentid_anon3; Owner: studentid_anon3
--

ALTER TABLE ONLY studentid_anon3.tweets
    ADD CONSTRAINT tweets_date_fkey FOREIGN KEY (date) REFERENCES studentid_anon3.races(date);


--
-- Name: tweets tweets_username_fkey; Type: FK CONSTRAINT; Schema: studentid_anon3; Owner: studentid_anon3
--

ALTER TABLE ONLY studentid_anon3.tweets
    ADD CONSTRAINT tweets_username_fkey FOREIGN KEY (username) REFERENCES studentid_anon3.twitter_user(username);


--
-- PostgreSQL database dump complete
--

