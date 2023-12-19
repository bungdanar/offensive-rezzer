import OpenApiParser from '@readme/openapi-parser'
import { PayloadBuilder } from './utils/payload-builder'

const app = async () => {
  try {
    const apiSpec = await OpenApiParser.validate('openapi.example.json')
    const allPayloads = PayloadBuilder.buildFuzzingPayloads(apiSpec)

    console.log(allPayloads)
  } catch (error) {
    console.error(error)
  }
}

app()
