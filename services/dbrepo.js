import { as } from '../appsettings.js';
import * as pg from 'pg';
const { Pool } = pg.default;


class DbRepo {
    constructor() {
        this.pgContext = new Pool(as.database);
        this.pgContext.connect();
    }

    //#region userdata
    addUser(id, callback) {
        this.#query(`INSERT INTO public.user(id) VALUES (\'${id}\');`, callback);
    }

    getUser(id, callback) {
        this.#query(`SELECT * FROM public.user WHERE id = \'${id}\';`, callback);
    }

    deleteUser(id, callback) {
        this.#query(`DELETE FROM public.user WHERE id = \'${id}\';`, callback);
    }

    setUserSession(id, commandSession, sessionData, sessionStage, callback) {
        let query = `update public.user set`;

        let crutch = false;
        if (commandSession != null) {
            query += ` command_session = \'${commandSession}\'`;
            crutch = true;
        }
        if (sessionData != null) {
            query += `${crutch ? ',' : ''} session_data = \'${sessionData}\'`;
            crutch = true;
        }
        if (sessionStage != null) {
            query += `${crutch ? ',' : ''} session_stage = \'${sessionStage}\'`;
            crutch = true;
        }

        query += ` where id = \'${id}\';`;

        this.#query(query, callback);
    }
    //#endregion


    //#region schedule
    changeWeek() {
        this.#query(`select * from public.week_num;`, (res, err) => {
            if (err) {
                console.error(err);
                return;
            }
            if (res.rows[0].num == 1) {
                this.#query(`update public.week_num set num = 2 where num = 1;`, (res, err) => {});
            }
            else {
                this.#query(`update public.week_num set num = 1 where num = 2;`, (res, err) => { });
            }
        });
    }

    getPair(week, day, num, callback) {
        this.#query(`select subject.id, subject.name, subject.type, subject.auditory, subject.link, subject.teacher from subject join schedule on schedule.subject_id = subject.id where schedule.week_num = ${week} and schedule.day_num = ${day} and schedule.pair_id = ${num} ;`, callback);
    }

    getPairTimes(callback) {
        this.#query(`select * from public.pair_time;`, callback);
    }

    addPair(week, day, pair, name, type, link, callback) {
        this.#query(`insert into public.subject(name, type, link) values (\'${name}\', \'${type}\', \'${link == '*' ? null : link}\') returning *;`, (res, err) => {
            this.#query(`insert into public.schedule(subject_id, week_num, day_num, pair_id) values (${res.rows[0].id}, ${week}, ${day}, ${pair});`, callback);
        });
    }

    editPair(id, name, type, link, callback) {
        let query = `update public.subject set`;

        let crutch = false;
        if (name != null) {
            query += ` name = \'${name}\'`;
            crutch = true;
        }
        if (type != null) {
            query += `${crutch ? ',' : ''} type = \'${type}\'`;
            crutch = true;
        }
        if (link != null) {
            query += `${crutch ? ',' : ''} link = \'${link}\'`;
            crutch = true;
        }

        query += ` where id = \'${id}\';`;

        this.#query(query, callback);
    }
    //#endregion


    #query(query, callback) {
        this.pgContext
            .query(query)
            .then(res => callback(res, null))
            .catch(err => callback(null, err));
    }
}

export const repo = new DbRepo();