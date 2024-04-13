import crypto from 'crypto'

import { SchemaDataTypes } from '../enums/openapi-data-types'
import { InputSpec, ObjectPayload } from '../types/common'

export class RandomPayloadBuilder {
  public static generateRandomValues = (): any[] => [
    null,
    undefined,
    crypto.randomUUID(),
  ]

  private static generateObjectPayloadVariants = (
    prop: string,
    spec: InputSpec,
    correctPayload: ObjectPayload
  ): ObjectPayload[] => {
    const payloads: ObjectPayload[] = []

    const randomValues = this.generateRandomValues()
    for (let i = 0; i < randomValues.length; i++) {
      const v = randomValues[i]
      const copy = structuredClone(correctPayload)
      copy[prop] = v

      payloads.push(copy)
    }

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

    const randomValues = this.generateRandomValues()
    for (let i = 0; i < randomValues.length; i++) {
      const v = randomValues[i]
      const copy = structuredClone(correctPayload)
      copy[prop] = v

      payloads.push(copy)
    }

    for (let i = 0; i < randomValues.length; i++) {
      const v = randomValues[i]
      const copy = structuredClone(correctPayload)
      copy[prop] = [v]

      payloads.push(copy)
    }

    const nestedCopy = structuredClone(correctPayload[prop])
    if (nestedCopy[0] !== undefined) {
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
    if (items !== undefined) {
      switch (items['type']) {
        case SchemaDataTypes.STRING:
        case SchemaDataTypes.NUMBER:
        case SchemaDataTypes.INTEGER:
        case SchemaDataTypes.BOOLEAN: {
          const randomValues = this.generateRandomValues()
          for (let i = 0; i < randomValues.length; i++) {
            const v = randomValues[i]
            const copy = structuredClone(correctPayload)
            copy[prop] = v

            payloads.push(copy)
          }

          for (let i = 0; i < randomValues.length; i++) {
            const v = randomValues[i]
            const copy = structuredClone(correctPayload)
            copy[prop] = [v]

            payloads.push(copy)
          }

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

        case SchemaDataTypes.ARRAY: {
          const randomValues = this.generateRandomValues()
          for (let i = 0; i < randomValues.length; i++) {
            const v = randomValues[i]
            const copy = structuredClone(correctPayload)
            copy[prop] = v

            payloads.push(copy)
          }

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

          case SchemaDataTypes.OBJECT: {
            totalPayloads.push(
              ...this.generateObjectPayloadVariants(
                prop,
                propSpec as InputSpec,
                correctPayload
              )
            )
            break
          }

          case SchemaDataTypes.ARRAY: {
            totalPayloads.push(
              ...this.generateArrayPayload(
                prop,
                propSpec as InputSpec,
                correctPayload
              )
            )
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
