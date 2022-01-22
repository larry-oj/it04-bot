import { as } from '../appsettings.js';
import * as pg from 'pg';
const { Pool } = pg.default;


class DbRepo {
    constructor() {
        this.pgContext = new Pool(as.database);
        this.pgContext.connect();
    }

    addUser(id, callback) {
        this.#query(`INSERT INTO public.user(id) VALUES (\'${id}\');`, callback);
    }

    getUser(id, callback) {
        this.#query(`SELECT * FROM public.user WHERE id = \'${id}\';`, callback);
    }

    deleteUser(id, callback) {
        this.#query(`DELETE FROM public.user WHERE id = \'${id}\';`, callback);
    }

    setUserSession(id, callback, commandSession = '', sessionData = '') {
        this.#query(`UPDATE public.user SET command_session = \'${commandSession}\', session_data = \'${sessionData}\' WHERE id = \'${id}\';`, callback)
    }

    #query(query, callback) {
        this.pgContext
            .query(query)
            .then(res => callback(res, null))
            .catch(err => callback(null, err));
    }
}

export const repo = new DbRepo();