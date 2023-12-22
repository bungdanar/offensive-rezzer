import OpenApiParser from '@readme/openapi-parser'
import { PayloadBuilder } from './utils/payload-builder'
import { FuzzingRequest } from './utils/fuzzing-request'

const app = async () => {
  try {
    const apiSpec = await OpenApiParser.validate('openapi.json')
    const allPayloads = PayloadBuilder.buildFuzzingPayloads(apiSpec)

    await FuzzingRequest.sendPayloads(apiSpec, allPayloads)
  } catch (error) {
    console.error(error)
  }
}

app()
