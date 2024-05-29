import OpenApiParser from '@readme/openapi-parser'
import { PayloadBuilder } from './utils/payload-builder'
import { FuzzingRequest } from './utils/fuzzing-request'
import { Environment } from './utils/environment'
import { consoleLogger, errorLogger } from './utils/logger'
import { Report } from './utils/report'
import { Authentication } from './utils/authentication'

export const app = async () => {
  try {
    const apiSpec = await OpenApiParser.validate('api-spec/openapi.json')

    const maxIter = Environment.maxIter
    consoleLogger.info(`Number of fuzzing iterations is ${maxIter}`)

    for (let i = 1; i <= maxIter; i++) {
      consoleLogger.info(`Fuzzing iteration ${i}`)

      await Authentication.getAuthOperation()

      const isOdd = i % 2 !== 0
      const allPayloads = await PayloadBuilder.buildFuzzingPayloads(
        apiSpec,
        isOdd
      )
      await FuzzingRequest.sendPayloads(apiSpec, allPayloads)
      Authentication.resetAuth()
    }
    consoleLogger.info('Sending fuzzing payloads to all endpoints is completed')

    consoleLogger.info(
      `Generating fuzzing session report to 'output/report.json'`
    )
    await Report.writeReport()
  } catch (error) {
    // Any error in this point should be logged
    errorLogger.error(error)
  }
}
