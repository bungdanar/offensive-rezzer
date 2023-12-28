import moment from 'moment'
import {
  NumberRange,
  SchemaDataTypes,
  StringFormats,
  StringRange,
} from '../enums/openapi-data-types'
import { InputSpec, ObjectPayload } from '../types/common'

export class ConstraintViolationPayloadBuilder {
  private static readonly STR_MAX_LENGTH = 65535
  private static readonly NUMBER_ADJUSTMENT = 1e6
  private static readonly STR_DATETIME_YEAR_ADJUSTMENT = [1e2, 1e3, 1e4, 1e5]

  private static generateStringPayloads = (
    spec: InputSpec,
    correctValue: string
  ): string[] => {
    const payloads = ['', 'f'.repeat(this.STR_MAX_LENGTH)]

    if (
      spec[StringRange.MIN_LENGTH] !== undefined &&
      spec[StringRange.MIN_LENGTH] - 1 > 0
    ) {
      payloads.push('f'.repeat(spec[StringRange.MIN_LENGTH] - 1))
    }

    if (spec[StringRange.MAX_LENGTH] !== undefined) {
      payloads.push('f'.repeat(spec[StringRange.MAX_LENGTH] + 100))
    }

    if (spec['format'] !== undefined) {
      if (spec['format'] === StringFormats.DATE) {
        for (let i = 0; i < this.STR_DATETIME_YEAR_ADJUSTMENT.length; i++) {
          const yearAdjustment = this.STR_DATETIME_YEAR_ADJUSTMENT[i]

          const pastMoment = moment(correctValue)
            .subtract(yearAdjustment, 'y')
            .format('YYYY-MM-DD')
          const futureMoment = moment(correctValue)
            .add(yearAdjustment, 'y')
            .format('YYYY-MM-DD')

          payloads.push(pastMoment, futureMoment)
        }
      }

      if (spec['format'] === StringFormats.DATETIME) {
        for (let i = 0; i < this.STR_DATETIME_YEAR_ADJUSTMENT.length; i++) {
          const yearAdjustment = this.STR_DATETIME_YEAR_ADJUSTMENT[i]

          const pastMoment = moment(correctValue)
            .subtract(yearAdjustment, 'y')
            .toISOString()
          const futureMoment = moment(correctValue)
            .add(yearAdjustment, 'y')
            .toISOString()

          payloads.push(pastMoment, futureMoment)
        }
      }
    }

    return payloads
  }

  private static generateNumberPayloads = (spec: InputSpec): number[] => {
    const payloads = [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER]

    if (spec[NumberRange.MINIMUM] !== undefined) {
      payloads.push(spec[NumberRange.MINIMUM] - this.NUMBER_ADJUSTMENT)
    }

    if (spec[NumberRange.MAXIMUM] !== undefined) {
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

  private static generateArrayOfObjectPayloadVariants = (
    prop: string,
    objSpec: InputSpec,
    correctPayload: ObjectPayload
  ): ObjectPayload[] => {
    const payloads: ObjectPayload[] = []

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
        case SchemaDataTypes.STRING: {
          const variants = this.generateStringPayloads(
            items,
            correctPayload[prop][0]
          )
          for (let i = 0; i < variants.length; i++) {
            const v = variants[i]

            const copy = structuredClone(correctPayload)
            copy[prop] = [v]

            payloads.push(copy)
          }

          break
        }

        case SchemaDataTypes.NUMBER:
        case SchemaDataTypes.INTEGER: {
          const variants = this.generateNumberPayloads(items)
          for (let i = 0; i < variants.length; i++) {
            const v = variants[i]

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
          case SchemaDataTypes.STRING: {
            const variants = this.generateStringPayloads(
              propSpec as InputSpec,
              correctPayload[prop]
            )
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
