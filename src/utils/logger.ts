import winston, { format } from 'winston'

export const consoleLogger = winston.createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf((info) => {
      return `${info.timestamp} ${info.level}: ${info.message}`
    })
  ),
  transports: [new winston.transports.Console()],
})

export const errorLogger = winston.createLogger({
  format: format.combine(
    format.timestamp(),
    format.printf((info) => {
      if (info instanceof Error) {
        return `${info.timestamp} ${info.level}: ${info.message}\n${info.stack}`
      }

      return `${info.timestamp} ${info.level}: ${info.message}`
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'output/error.log' }),
  ],
})
