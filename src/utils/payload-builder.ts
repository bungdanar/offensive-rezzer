import { OpenAPI } from 'openapi-types'
import { AllPayloads } from '../types/common'
import { HttpMethods } from '../enums/http-methods'
import { MethodDetailsHelper } from './check-method-details'
import { CorrectPayloadBuilder } from './correct-payload-builder'
import { MissingPayloadBuilder } from './missing-payload-builder'
import { InvalidPayloadBuilder } from './invalid-payload-builder'
import { ConstraintViolationPayloadBuilder } from './constraint-violation-payload-builder'
import { consoleLogger } from './logger'

export class PayloadBuilder {
  private static hasParameter = (path: string): boolean => {
    const parameterRegex = /\{([^}]+)\}/g
    return parameterRegex.test(path)
  }

  public static buildFuzzingPayloads = (
    apiSpec: OpenAPI.Document,
    useSpecDef: boolean
  ): AllPayloads => {
    const allPayloads: AllPayloads = {}

    // Iterating paths
    if (apiSpec.paths) {
      for (const [path, methods] of Object.entries(apiSpec.paths)) {
        if (this.hasParameter(path)) {
          consoleLogger.info(
            'Operation for endpoint that contains path paramater is not supported yet'
          )
          consoleLogger.info(`Not supported endpoint: ${path}`)
          continue
        }

        // Iterating methods
        for (const [method, methodDetails] of Object.entries(methods)) {
          if (method !== HttpMethods.POST) {
            consoleLogger.info(`Operation for ${method} is not supported yet`)
            continue
          }

          if (!MethodDetailsHelper.checkIfSchemaExists(methodDetails as any)) {
            consoleLogger.info('Schema does not exist. Skip this operation')
            continue
          }

          consoleLogger.info(
            `Building fuzzing payloads for endpoint [${method}] ${path}`
          )

          const schema = MethodDetailsHelper.getSchema(methodDetails as any)
          const correctPayload = CorrectPayloadBuilder.generateObjectPayload(
            schema,
            useSpecDef
          )

          const missingPayloads = MissingPayloadBuilder.generateObjectPayload(
            correctPayload,
            schema
          )

          const invalidTypePayloads =
            InvalidPayloadBuilder.generateObjectPayload(correctPayload, schema)

          const constraintViolationPayloads =
            ConstraintViolationPayloadBuilder.generateObjectPayload(
              correctPayload,
              schema
            )

          const totalGeneratedPayloads = [
            correctPayload,
            ...missingPayloads,
            ...invalidTypePayloads,
            ...constraintViolationPayloads,
          ]

          if (allPayloads[path] === undefined) {
            allPayloads[path] = {
              [method]: totalGeneratedPayloads,
            }
          } else {
            if (allPayloads[path][method] === undefined) {
              allPayloads[path] = {
                [method]: totalGeneratedPayloads,
              }
            } else {
              allPayloads[path][method] = [
                ...allPayloads[path][method],
                ...totalGeneratedPayloads,
              ]
            }
          }
        }
      }

      consoleLogger.info('Building fuzzing payloads is completed')

      return allPayloads
    } else {
      throw new Error('Paths are not found')
    }
  }
}
