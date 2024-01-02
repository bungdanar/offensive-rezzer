import { OpenAPI } from 'openapi-types'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { AllPayloads } from '../types/common'
import JSONbig from 'json-bigint'
import { consoleLogger, errorLogger } from './logger'
import { Report } from './report'
import { Environment } from './environment'

export class FuzzingRequest {
  private static getTargetUrl = (apiSpec: OpenAPI.Document): string => {
    return Environment.targetUrl !== undefined
      ? Environment.targetUrl
      : //@ts-ignore
        (apiSpec.servers[0].url as string)
  }

  private static handleReqError = (
    url: string,
    error: unknown
  ): AxiosResponse | null => {
    let data: AxiosResponse | null = null

    if (error instanceof AxiosError) {
      if (error.response) {
        data = error.response
      } else {
        consoleLogger.error(`Cannot send request to ${url}`)
      }
    } else {
      // Log the error
      errorLogger.error(error)
    }

    return data
  }

  private static handlePostReq = async (
    url: string,
    payload: any
  ): Promise<AxiosResponse | null> => {
    let data: AxiosResponse | null = null

    try {
      const serializedPayloads = JSON.stringify(payload, (key, value) =>
        typeof value === 'bigint' ? JSONbig.stringify(value) : value
      )

      const response = await axios.post<any>(url, serializedPayloads, {
        headers: {
          'Content-Type': 'application/json',
        },
      })

      data = response
    } catch (error) {
      data = this.handleReqError(url, error)
    }

    return data
  }

  public static sendPayloads = async (
    apiSpec: OpenAPI.Document,
    allPayloads: AllPayloads
  ) => {
    const targetUrl = this.getTargetUrl(apiSpec)

    for (const [path, methods] of Object.entries(allPayloads)) {
      for (const [method, payloads] of Object.entries(methods)) {
        consoleLogger.info(
          `Sending fuzzing payloads to endpoint [${method}] ${path}`
        )

        const responses = await Promise.all(
          payloads.map((payload) =>
            this.handlePostReq(`${targetUrl}${path}`, payload)
          )
        )

        for (let i = 0; i < responses.length; i++) {
          const r = responses[i]

          if (r) {
            let payload: any
            try {
              payload = JSONbig.parse(r.config.data)
            } catch (error) {
              payload = r.config.data
            }

            Report.addReportData({
              path,
              method,
              statusCode: r.status,
              payload: payload,
              response: r.data,
            })
          }
        }
      }
    }
  }
}
