import { SchemaDataTypes } from '../enums/openapi-data-types'
import { InputSpec, ObjectPayload } from '../types/common'

export class MissingPayloadBuilder {
  private static PRIMITIVE_TYPES: SchemaDataTypes[] = [
    SchemaDataTypes.STRING,
    SchemaDataTypes.NUMBER,
    SchemaDataTypes.INTEGER,
    SchemaDataTypes.BOOLEAN,
  ]

  private static generateObjectPayloadWithoutProp = (
    prop: string,
    correctPayload: ObjectPayload
  ): ObjectPayload => {
    const copy = structuredClone(correctPayload)
    delete copy[prop]

    return copy
  }

  private static generateObjectPayloadVariants = (
    prop: string,
    spec: InputSpec,
    correctPayload: ObjectPayload
  ): ObjectPayload[] => {
    const payloads: ObjectPayload[] = []

    const copy = structuredClone(correctPayload)
    delete copy[prop]
    payloads.push(copy)

    const nestedCopy = structuredClone(correctPayload[prop])
    const nestedPayloadVariants = this.generateObjectPayload(nestedCopy, spec)

    for (let i = 0; i < nestedPayloadVariants.length; i++) {
      const np = nestedPayloadVariants[i]

      const freshCopy = structuredClone(correctPayload)
      freshCopy[prop] = np
      payloads.push(freshCopy)
    }

    return payloads
  }

  public static generateObjectPayload = (
    correctPayload: ObjectPayload,
    payloadSpec: InputSpec
  ): ObjectPayload[] => {
    const totalPayloads: ObjectPayload[] = []

    const properties = payloadSpec['properties']
    if (properties) {
      for (const [prop, propSpec] of Object.entries(properties)) {
        if (this.PRIMITIVE_TYPES.includes((propSpec as InputSpec)['type'])) {
          totalPayloads.push(
            this.generateObjectPayloadWithoutProp(prop, correctPayload)
          )
          continue
        }

        if ((propSpec as InputSpec)['type'] === SchemaDataTypes.OBJECT) {
          totalPayloads.push(
            ...this.generateObjectPayloadVariants(
              prop,
              propSpec as InputSpec,
              correctPayload
            )
          )

          continue
        }

        // if ((propSpec as InputSpec)['type'] === SchemaDataTypes.ARRAY) {
        //   continue
        // }
      }
    }

    return totalPayloads
  }
}
