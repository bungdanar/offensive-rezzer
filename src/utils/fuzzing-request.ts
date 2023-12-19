import { OpenAPI } from 'openapi-types'
import axios from 'axios'
import { AllPayloads } from '../types/common'

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
          await Promise.all(
            payloads.map((p) => axios.post<any>(`${TARGET_URL}${path}`, p))
          )
        } catch (error) {
          // For now, do nothing
        }
      }
    }

    console.log('Sending fuzzing payloads to all endpoints is completed')
  }
}
