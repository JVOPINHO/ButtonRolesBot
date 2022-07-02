import winston from 'winston';
import chalk from 'chalk';

const { printf, combine, timestamp, colorize } = winston.format; 

const config = {
    levels: {
        error: 0,
        warn: 1,
        info: 2,
        http: 3,
        debug: 5,
    },
    colors: {
        error: 'red',
        warn: 'yellowBG',
        info: 'green',
        http: 'blue',
        debug: 'yellow',
    }
}

const myFormat = printf(({ level, message, label, timestamp = new Date().toISOString() }) => {
    return `${timestamp} ${level} --- ${label ? `[${chalk.cyan(label)}]:` : ''} ${message}`;
})

winston.addColors(config.colors);

// @ts-ignore
const logger: MyLogger = winston.createLogger({
    format: combine(
        colorize({ level: true }),
        winston.format.simple(),
        timestamp(),
        myFormat,
    ),
    levels: config.levels,
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/combined.log' }),
    ],
    exitOnError: false,
});

global.logger = logger;