import { as } from '../appsettings.js';
import * as ns from 'node-schedule';
import { repo } from './dbrepo.js';

export class Schedule {
    constructor () {
        this.j = [];
        this.bot = {};
    }

    reload(bot = null, msgOps) {
        for (const job in ns.scheduledJobs) {
            ns.cancelJob(job);
        } 
        this.j = [];

        if (bot != null) {
            this.bot = bot;
        }

        // push week change
        this.j.push(
            ns.scheduleJob('* 2 * * 7', () => {
                repo.changeWeek()
            })
        );

        repo.getPairTimes((r, e) => {   // first, get pair start | end times
            if (e) {
                console.error(e);
                return;
            }

            // save to variable
            let time = r.rows;

            let cron_str = '';
            let msg_str = '';

            // iterate through weeks, days and pairs
            for (let week = 1; week <= 2; week++) {
                for (let day = 1; day <= 6; day++) {
                    for (let pair = 1; pair <= 6; pair++) {
                        // get a pair
                        repo.getPair(week, day, pair, (res, err) => {
                            if (err) {
                                console.error(err);
                                return;
                            }

                            // if there are no pair at that time, ignore
                            if (res.rows.length < 1) {
                                return;
                            }
                            else {
                                // generate cron string
                                cron_str = `${time[pair - 1].begin_minutes - 5} ${time[pair - 1].begin_hours} * * ${day}`;

                                // generate message
                                msg_str = `Пара #${pair}\n`;
                                res.rows.forEach(row => {
                                    msg_str += `\n${row.name} (${row.type})`;
                                    if (row.link != null && row.link != 'null') {
                                        msg_str += ` - ${row.link}`;
                                    }
                                });

                                // funny js momemnt:
                                // the entire thing below (this.j.push)
                                // is in a callback, so it will use
                                // the last msg_str generated
                                // so we need to store it in const
                                const m_str = msg_str;

                                this.j.push(
                                    ns.scheduleJob(cron_str, () => {
                                        this.bot.telegram.sendMessage(as.telegram.group_chat_id, m_str);
                                    })
                                );
                            }
                        });
                    }
                }
            }
        });
    }

    get jobs() { return this.j; }

    static getInstance() {
        if (Schedule.instance) {
            return Schedule.instance;
        }
        Schedule.instance = new Schedule();
        return Schedule.instance;
    }
}