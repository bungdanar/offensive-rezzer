import { OpenAPI } from 'openapi-types'
import axios, { AxiosError } from 'axios'
import { AllPayloads } from '../types/common'
import JSONbig from 'json-bigint'
import { getErrorMessage } from './get-err-message'
import { consoleLogger, errorLogger } from './logger'

export class FuzzingRequest {
  private static handleReqError = (url: string, error: unknown) => {
    if (error instanceof AxiosError) {
      if (error.response) {
        // Log to report
        consoleLogger.error(error)
      } else {
        consoleLogger.error(`Cannot send request to ${url}`)
      }
    } else {
      const errMessage = getErrorMessage(error)
      // Log the error
      errorLogger.error(errMessage)
    }
  }

  private static handlePostReq = async (url: string, data: any) => {
    try {
      const serializedPayloads = JSON.stringify(data, (key, value) =>
        typeof value === 'bigint' ? JSONbig.stringify(value) : value
      )

      const response = await axios.post<any>(url, serializedPayloads, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      consoleLogger.info(response)
    } catch (error) {
      this.handleReqError(url, error)
    }
  }

  public static sendPayloads = async (
    apiSpec: OpenAPI.Document,
    allPayloads: AllPayloads
  ) => {
    //@ts-ignore
    const TARGET_URL = apiSpec.servers[0].url as string

    for (const [path, methods] of Object.entries(allPayloads)) {
      for (const [method, payloads] of Object.entries(methods)) {
        consoleLogger.info(
          `Sending fuzzing payloads to endpoint [${method}] ${path}`
        )

        await Promise.all(
          payloads.map((payload) =>
            this.handlePostReq(`${TARGET_URL}${path}`, payload)
          )
        )
      }
    }
  }
}
