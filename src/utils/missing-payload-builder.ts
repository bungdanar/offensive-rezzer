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

    payloads.push(this.generateObjectPayloadWithoutProp(prop, correctPayload))

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

  private static generateArrayOfObjectPayloadVariants = (
    prop: string,
    objSpec: InputSpec,
    correctPayload: ObjectPayload
  ): ObjectPayload[] => {
    const payloads: ObjectPayload[] = []

    payloads.push(this.generateObjectPayloadWithoutProp(prop, correctPayload))

    const copy = structuredClone(correctPayload)
    copy[prop] = []
    payloads.push(copy)

    const nestedCopy = structuredClone(correctPayload[prop])
    if (nestedCopy[0]) {
      const nestedObjVariants = this.generateObjectPayload(
        nestedCopy[0],
        objSpec
      )

      for (let i = 0; i < nestedObjVariants.length; i++) {
        const nObj = nestedObjVariants[i]

        const freshCopy = structuredClone(correctPayload)
        freshCopy[prop] = [nObj]
        payloads.push(freshCopy)
      }
    }

    return payloads
  }

  public static generateArrayPayload = (
    prop: string,
    spec: InputSpec,
    correctPayload: ObjectPayload
  ): ObjectPayload[] => {
    const payloads: ObjectPayload[] = []

    const items = spec['items']
    if (items) {
      switch (items['type']) {
        case SchemaDataTypes.STRING:
        case SchemaDataTypes.NUMBER:
        case SchemaDataTypes.INTEGER:
        case SchemaDataTypes.BOOLEAN:
        case SchemaDataTypes.ARRAY: {
          payloads.push(
            this.generateObjectPayloadWithoutProp(prop, correctPayload)
          )

          const copy = structuredClone(correctPayload)
          copy[prop] = []
          payloads.push(copy)

          break
        }

        case SchemaDataTypes.OBJECT: {
          payloads.push(
            ...this.generateArrayOfObjectPayloadVariants(
              prop,
              items,
              correctPayload
            )
          )
          break
        }

        default:
          break
      }
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

        if ((propSpec as InputSpec)['type'] === SchemaDataTypes.ARRAY) {
          totalPayloads.push(
            ...this.generateArrayPayload(
              prop,
              propSpec as InputSpec,
              correctPayload
            )
          )
          continue
        }
      }
    }

    return totalPayloads
  }
}
