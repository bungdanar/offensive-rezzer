import { OpenAPI } from 'openapi-types'
import axios from 'axios'
import { AllPayloads } from '../types/common'
import JSONbig from 'json-bigint'

export class FuzzingRequest {
  public static sendPayloads = async (
    apiSpec: OpenAPI.Document,
    allPayloads: AllPayloads
  ) => {
    //@ts-ignore
    const TARGET_URL = apiSpec.servers[0].url as string

    for (const [path, methods] of Object.entries(allPayloads)) {
      for (const [method, payloads] of Object.entries(methods)) {
        console.log(`Sending fuzzing payloads to endpoint [${method}] ${path}`)

        try {
          const serializedPayloads = payloads.map((p) =>
            JSON.stringify(p, (key, value) =>
              typeof value === 'bigint' ? JSONbig.stringify(value) : value
            )
          )

          await Promise.all(
            serializedPayloads.map((sp) =>
              axios.post<any>(`${TARGET_URL}${path}`, sp, {
                headers: {
                  'Content-Type': 'application/json',
                },
              })
            )
          )
        } catch (error) {
          // For now, do nothing
          if (error instanceof TypeError) {
            console.log(error)
          }
        }
      }
    }

    console.log('Sending fuzzing payloads to all endpoints is completed')
  }
}
