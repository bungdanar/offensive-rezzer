import { OpenAPI } from 'openapi-types'
import { AllPayloads, ObjectPayload, PathPayloads } from '../types/common'
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

  private static transformParamToObjSchema = (
    params: any[]
  ): { [key: string]: any } => {
    const objSchema: { [key: string]: any } = {
      type: 'object',
      properties: {},
    }

    const requiredFields = params.filter((p) => p.required === true)
    if (requiredFields.length > 0) {
      objSchema['required'] = requiredFields.map((f) => f.name)
    }

    for (let i = 0; i < params.length; i++) {
      const p = params[i]
      objSchema['properties'][p.name] = p.schema
    }

    return objSchema
  }

  private static generatePayloadsForQuery = (
    methodDetails: any,
    method: string,
    path: string,
    useSpecDef: boolean
  ): ObjectPayload[] => {
    let generatedPayloads: ObjectPayload[] = []

    if (MethodDetailsHelper.checkIfParametersExists(methodDetails)) {
      consoleLogger.info(
        `Building query fuzzing payloads for endpoint [${method}] ${path}`
      )

      const paramaters = MethodDetailsHelper.getParameters(methodDetails)
      const query = paramaters.filter((p: any) => p.in === 'query')
      const schema = this.transformParamToObjSchema(query)

      const correctPayload = CorrectPayloadBuilder.generateObjectPayload(
        schema,
        useSpecDef
      )

      const missingPayloads = MissingPayloadBuilder.generateObjectPayload(
        correctPayload,
        schema
      )

      const invalidTypePayloads = InvalidPayloadBuilder.generateObjectPayload(
        correctPayload,
        schema
      )

      const constraintViolationPayloads =
        ConstraintViolationPayloadBuilder.generateObjectPayload(
          correctPayload,
          schema
        )

      generatedPayloads = [
        correctPayload,
        ...missingPayloads,
        ...invalidTypePayloads,
        ...constraintViolationPayloads,
      ]
    }

    return generatedPayloads
  }

  private static generatePayloadsForReqBody = (
    methodDetails: any,
    method: string,
    path: string,
    useSpecDef: boolean
  ): ObjectPayload[] => {
    let generatedPayloads: ObjectPayload[] = []

    if (MethodDetailsHelper.checkIfReqBodySchemaExists(methodDetails)) {
      consoleLogger.info(
        `Building request body fuzzing payloads for endpoint [${method}] ${path}`
      )

      const reqBodySchema = MethodDetailsHelper.getReqBodySchema(methodDetails)
      const correctPayload = CorrectPayloadBuilder.generateObjectPayload(
        reqBodySchema,
        useSpecDef
      )

      const missingPayloads = MissingPayloadBuilder.generateObjectPayload(
        correctPayload,
        reqBodySchema
      )

      const invalidTypePayloads = InvalidPayloadBuilder.generateObjectPayload(
        correctPayload,
        reqBodySchema
      )

      const constraintViolationPayloads =
        ConstraintViolationPayloadBuilder.generateObjectPayload(
          correctPayload,
          reqBodySchema
        )

      generatedPayloads = [
        correctPayload,
        ...missingPayloads,
        ...invalidTypePayloads,
        ...constraintViolationPayloads,
      ]
    }

    return generatedPayloads
  }

  public static buildFuzzingPayloads = (
    apiSpec: OpenAPI.Document,
    useSpecDef: boolean
  ): AllPayloads => {
    const allPayloads: AllPayloads = {}

    if (apiSpec.paths) {
      // Iterating paths
      for (const [path, methods] of Object.entries(apiSpec.paths)) {
        if (this.hasParameter(path)) {
          consoleLogger.info(
            'Operation for endpoint that contains path paramater is not supported yet'
          )
          consoleLogger.info(`Not supported endpoint: ${path}`)
          continue
        }

        const pathPayloads: PathPayloads = {}

        // Iterating methods
        for (const [method, methodDetails] of Object.entries(methods)) {
          // Request Body
          const reqBodyPayloads = this.generatePayloadsForReqBody(
            methodDetails,
            method,
            path,
            useSpecDef
          )

          // Query
          const queryPayloads = this.generatePayloadsForQuery(
            methodDetails,
            method,
            path,
            useSpecDef
          )

          pathPayloads[method] = {
            reqBody: reqBodyPayloads,
            query: queryPayloads,
          }
        }

        allPayloads[path] = pathPayloads
      }

      consoleLogger.info('Building fuzzing payloads is completed')

      return allPayloads
    } else {
      throw new Error('Paths are not found')
    }
  }
}
