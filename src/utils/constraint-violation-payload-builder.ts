import {
  NumberRange,
  SchemaDataTypes,
  StringRange,
} from '../enums/openapi-data-types'
import { InputSpec, ObjectPayload } from '../types/common'

export class ConstraintViolationPayloadBuilder {
  private static readonly STR_MAX_LENGTH = 65535
  private static readonly NUMBER_ADJUSTMENT = 1000000

  private static generateStringPayloads = (spec: InputSpec): string[] => {
    const payloads = ['', 'f'.repeat(this.STR_MAX_LENGTH)]

    if (spec[StringRange.MIN_LENGTH] && spec[StringRange.MIN_LENGTH] - 1 > 0) {
      payloads.push('f'.repeat(spec[StringRange.MIN_LENGTH] - 1))
    }

    if (spec[StringRange.MAX_LENGTH]) {
      payloads.push('f'.repeat(spec[StringRange.MAX_LENGTH] + 100))
    }

    return payloads
  }

  private static generateNumberPayloads = (spec: InputSpec): number[] => {
    const payloads = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]

    if (spec[NumberRange.MINIMUM]) {
      payloads.push(spec[NumberRange.MINIMUM] - this.NUMBER_ADJUSTMENT)
    }

    if (spec[NumberRange.MAXIMUM]) {
      payloads.push(spec[NumberRange.MAXIMUM] + this.NUMBER_ADJUSTMENT)
    }

    return payloads
  }

  private static generateObjectPayloadVariants = (
    prop: string,
    spec: InputSpec,
    correctPayload: ObjectPayload
  ): ObjectPayload[] => {
    const payloads: ObjectPayload[] = []

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
        switch ((propSpec as InputSpec)['type']) {
          case SchemaDataTypes.STRING: {
            const variants = this.generateStringPayloads(propSpec as InputSpec)
            for (let i = 0; i < variants.length; i++) {
              const v = variants[i]

              const copy = structuredClone(correctPayload)
              copy[prop] = v

              totalPayloads.push(copy)
            }

            break
          }

          case SchemaDataTypes.NUMBER:
          case SchemaDataTypes.INTEGER: {
            const variants = this.generateNumberPayloads(propSpec as InputSpec)
            for (let i = 0; i < variants.length; i++) {
              const v = variants[i]

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

          default:
            break
        }
      }
    }

    return totalPayloads
  }
}
