import { as } from '../appsettings.js';
import * as pg from 'pg';
const { Pool } = pg.default;


class DbRepo {
    constructor() {
        this.pgContext = new Pool(as.database);
        this.pgContext.connect();
    }

    //#region userdata
    async addUser(id) {
        let res = await this.#query(`INSERT INTO public.user(id) VALUES (\'${id}\') returning *;`);
        return res.rows.length < 1 ? null : res.rows[0];
    }

    async getUser(id) {
        let res = await this.#query(`SELECT * FROM public.user WHERE id = \'${id}\';`);
        return res.rows.length < 1 ? null : res.rows[0];
    }

    async deleteUser(id) {
        await this.#query(`DELETE FROM public.user WHERE id = \'${id}\';`);
    }

    async setUserSession(id, commandSession, sessionData, sessionStage) {
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

        await this.#query(query);
    }
    //#endregion


    //#region schedule
    async getWeek() {
        let res = await this.#query(`select * from public.week_num;`);
        return res.rows[0].num;
    }

    async changeWeek() {
        let res = await this.#query(`select * from public.week_num;`);

        let query = '';

        if (res.rows[0].num == 1) {
            query = `update public.week_num set num = 2 where num = 1;`;
        }
        else {
            query = `update public.week_num set num = 1 where num = 2;`;
        }

        await this.#query(query);
    }

    async getPair(week, day, num) {
        let res = await this.#query(`select subject.id, subject.name, subject.type, subject.auditory, subject.link, subject.teacher from subject join schedule on schedule.subject_id = subject.id where schedule.week_num = ${week} and schedule.day_num = ${day} and schedule.pair_id = ${num} ;`);
        return res.rows;
    }

    async getDay(week, day) {
        let res = await this.#query(`select schedule.pair_id, subject.name, subject.type, subject.link from schedule join subject on schedule.subject_id = subject.id where schedule.week_num = ${week} and schedule.day_num = ${day} order by schedule.pair_id;`);
        return res.rows;
    }

    async getAllPairs() {
        let res = await this.#query(`select * from public.subject order by id;`);
        return res.rows;
    }

    async getPairTimes() {
        let response = await this.#query(`select * from public.pair_time;`);
        let res = [];
        response.rows.forEach(row => {
            res.push({
                id: +row.id,
                begin: new Date(`1970-01-01T${('0' + row.begin_hours).slice(-2)}:${('0' + row.begin_minutes).slice(-2)}:00`),
                end: new Date(`1970-01-01T${('0' + row.end_hours).slice(-2)}:${('0' + row.end_minutes).slice(-2)}:00`)
            });
        });

        res.sort((a, b) => {
            var x = a['id']; var y = b['id'];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });

        return res;
    }

    async addPair(name, type, link) {
        await this.#query(`insert into public.subject(name, type, link) values (\'${name}\', \'${type}\', \'${link == '*' ? null : link}\');`);
    }

    async assignPair(week, day, pair, id) {
        await this.#query(`insert into public.schedule(subject_id, week_num, day_num, pair_id) values (${id}, ${week}, ${day}, ${pair});`);
    }

    async removePair(week, day, pair, id) {
        await this.#query(`delete from public.schedule where subject_id = ${id} and week_num = ${week} and day_num = ${day} and pair_id = ${pair};`);
    }

    async editPair(id, name, type, link) {
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

        await this.#query(query);
    }

    async deletePair(id) {
        await this.#query(`delete from public.schedule where subject_id = ${id} ;`);
        await this.#query(`delete from public.subject where id = ${id} ;`);
    }
    //#endregion


    async #query(query) {
        return await this.pgContext.query(query);
    }
}

export const repo = new DbRepo();