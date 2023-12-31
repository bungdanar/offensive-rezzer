import OpenApiParser from '@readme/openapi-parser'
import { PayloadBuilder } from './utils/payload-builder'
import { FuzzingRequest } from './utils/fuzzing-request'
import { Environment } from './utils/environment'
import { getErrorMessage } from './utils/get-err-message'
import { consoleLogger, errorLogger } from './utils/logger'

export const app = async () => {
  try {
    const apiSpec = await OpenApiParser.validate('openapi.json')

    const maxIter = Environment.maxIter
    consoleLogger.info(`Number of fuzzing iterations is ${maxIter}`)

    for (let i = 1; i <= maxIter; i++) {
      consoleLogger.info(`Fuzzing iteration ${i}`)

      const isOdd = i % 2 !== 0
      const allPayloads = PayloadBuilder.buildFuzzingPayloads(apiSpec, isOdd)
      await FuzzingRequest.sendPayloads(apiSpec, allPayloads)
    }

    consoleLogger.info('Sending fuzzing payloads to all endpoints is completed')
  } catch (error) {
    // Any error in this point should be logged
    const errMessage = getErrorMessage(error)
    errorLogger.error(errMessage)
  }
}
