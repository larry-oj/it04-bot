import { as } from '../appsettings.js';
import * as ns from 'node-schedule';
import { repo } from './dbrepo.js';

export class Schedule {
    constructor () {
        this.j = [];
        this.bot = {};
    }

    async reload(bot = null, msgOps) {
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

        let time = await repo.getPairTimes();   // first, get pair start | end times

        let cron_str = '';
        let msg_str = '';

        // iterate through weeks, days and pairs
        for (let week = 1; week <= 2; week++) {
            for (let day = 1; day <= 6; day++) {
                for (let pair = 1; pair <= 6; pair++) {
                    // get a pair
                    let pairs = await repo.getPair(week, day, pair);

                    // if there are no pair at that time, ignore
                    if (pairs.length < 1) {
                        return;
                    }
                    else {
                        // generate cron string
                        cron_str = `${time[pair - 1].begin.getMinutes() - 5} ${time[pair - 1].begin.getHours()} * * ${day}`;

                        // generate message
                        msg_str = `Пара #${pair}\n`;
                        pairs.forEach(p => {
                            msg_str += `\n${p.name} (${p.type})`;
                            if (p.link != null && p.link != 'null') {
                                msg_str += ` - ${p.link}`;
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
                }
            }
        }
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