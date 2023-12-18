import { NumberRange, StringRange } from '../enums/openapi-data-types'
import { InputSpec } from '../types/common'

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
}
