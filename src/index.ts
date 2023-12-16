import OpenApiParser from '@readme/openapi-parser'
import { HttpMethods } from './enums/http-methods'
import { MethodDetailsHelper } from './utils/check-method-details'
import {
  CorrectPayloadBuilder,
  MissingPayloadBuilder,
} from './utils/payload-builder'

type AllPayloads = {
  // Paths
  [key: string]: {
    // Methods
    [key: string]: {
      [key: string]: any
    }[]
  }
}

const app = async () => {
  try {
    const allPayloads: AllPayloads = {}

    const apiSpec = await OpenApiParser.validate('openapi.example.json')
    // Iterating paths
    if (apiSpec.paths) {
      for (const [path, methods] of Object.entries(apiSpec.paths)) {
        // Iterating methods
        for (const [method, methodDetails] of Object.entries(methods)) {
          if (method !== HttpMethods.POST) {
            console.log(`Operation for ${method} is not supported yet`)
            continue
          }

          if (!MethodDetailsHelper.checkIfSchemaExists(methodDetails as any)) {
            console.log('Schema does not exist. Skip this operation')
            continue
          }

          const schema = MethodDetailsHelper.getSchema(methodDetails as any)
          const correctPayload =
            CorrectPayloadBuilder.generateObjectPayload(schema)

          const missingPayloads = MissingPayloadBuilder.generateObjectPayload(
            correctPayload,
            schema
          )

          if (allPayloads[path] === undefined) {
            allPayloads[path] = {
              [method]: [correctPayload, ...missingPayloads],
            }
          } else {
            if (allPayloads[path][method] === undefined) {
              allPayloads[path] = {
                [method]: [correctPayload, ...missingPayloads],
              }
            } else {
              allPayloads[path][method] = [
                ...allPayloads[path][method],
                correctPayload,
                ...missingPayloads,
              ]
            }
          }
        }
      }
    } else {
      throw new Error('Paths are not found')
    }

    console.log(allPayloads)
  } catch (error) {
    console.error(error)
  }
}

app()
