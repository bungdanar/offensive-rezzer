import winston, { format } from 'winston'

const customFormat = format.printf(({ level, message, timestamp }) => {
  return `${timestamp} ${level}: ${message}`
})

export const consoleLogger = winston.createLogger({
  format: format.combine(format.timestamp(), customFormat),
  transports: [new winston.transports.Console()],
})

export const errorLogger = winston.createLogger({
  format: format.combine(format.timestamp(), customFormat),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'output/error.log' }),
  ],
})
