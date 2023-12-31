import OpenApiParser from '@readme/openapi-parser'
import { PayloadBuilder } from './utils/payload-builder'
import { FuzzingRequest } from './utils/fuzzing-request'
import { Environment } from './utils/environment'

export const app = async () => {
  try {
    const apiSpec = await OpenApiParser.validate('openapi.json')

    const maxIter = Environment.maxIter
    console.log(`Number of fuzzing iterations is ${maxIter}`)

    for (let i = 1; i <= maxIter; i++) {
      console.log(`Fuzzing iteration ${i}`)

      const isOdd = i % 2 !== 0
      const allPayloads = PayloadBuilder.buildFuzzingPayloads(apiSpec, isOdd)
      await FuzzingRequest.sendPayloads(apiSpec, allPayloads)
    }

    console.log('Sending fuzzing payloads to all endpoints is completed')
  } catch (error) {
    console.error(error)
  }
}
