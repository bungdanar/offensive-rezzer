import OpenApiParser from '@readme/openapi-parser'
import { HttpMethods } from './enums/http-methods'
import { MethodDetailsHelper } from './utils/check-method-details'

const app = async () => {
  try {
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
          console.log(schema)
        }
      }
    } else {
      throw new Error('Paths are not found')
    }
  } catch (error) {
    console.error(error)
  }
}

app()
