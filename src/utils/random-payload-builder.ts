import { SchemaDataTypes } from '../enums/openapi-data-types'
import { InputSpec, ObjectPayload } from '../types/common'

export class RandomPayloadBuilder {
  private static generateRandomValues = (): any[] => [null, undefined]

  public static generateObjectPayload = (
    correctPayload: ObjectPayload,
    payloadSpec: InputSpec
  ): ObjectPayload[] => {
    const totalPayloads: ObjectPayload[] = []

    const properties = payloadSpec['properties']
    if (properties !== undefined) {
      for (const [prop, propSpec] of Object.entries(properties)) {
        switch ((propSpec as InputSpec)['type']) {
          case SchemaDataTypes.STRING:
          case SchemaDataTypes.NUMBER:
          case SchemaDataTypes.INTEGER:
          case SchemaDataTypes.BOOLEAN: {
            const randomValues = this.generateRandomValues()
            for (let i = 0; i < randomValues.length; i++) {
              const v = randomValues[i]
              const copy = structuredClone(correctPayload)
              copy[prop] = v

              totalPayloads.push(copy)
            }

            break
          }

          default:
            break
        }
      }
    }

    return totalPayloads
  }
}
