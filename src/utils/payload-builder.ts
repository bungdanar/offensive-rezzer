import moment from 'moment'

import {
  NumberRange,
  StringFormats,
  StringRange,
} from '../enums/openapi-data-types'

type InputSpec = {
  [key: string]: any
}

export class CorrectPayloadBuilder {
  private static generateStringPayload = (spec: InputSpec): string => {
    let payload = 'fuzz'

    if (spec[StringRange.MIN_LENGTH]) {
      payload = 'f'.repeat(spec[StringRange.MIN_LENGTH])
    }

    if (spec['pattern']) {
      // TODOS
      // payload = ''
    }

    if (spec['format']) {
      if (spec['format'] === StringFormats.DATE) {
        payload = moment().format('YYYY-MM-DD')
      }

      if (spec['format'] === StringFormats.DATETIME) {
        payload = moment().toISOString()
      }
    }

    return payload
  }

  private static generateNumberPayload = (spec: InputSpec): number => {
    let payload = 4

    if (spec[NumberRange.MINIMUM]) {
      payload = spec[NumberRange.MINIMUM]
    }

    return payload
  }

  private static generateIntegerPayload = (spec: InputSpec): number => {
    let payload = 4

    if (spec[NumberRange.MINIMUM]) {
      payload = spec[NumberRange.MINIMUM]
    }

    return payload
  }

  private static generateBooleanPayload = (): boolean => {
    const payload = Math.random() >= 0.5 ? 1 : 0
    return Boolean(payload)
  }
}
