import moment from 'moment'
import RandExp from 'randexp'

import {
  NumberRange,
  SchemaDataTypes,
  StringFormats,
  StringRange,
} from '../enums/openapi-data-types'
import { InputSpec, ObjectPayload } from '../types/common'

export class CorrectPayloadBuilder {
  private static generateStringPayload = (spec: InputSpec): string => {
    let payload = 'fuzz'

    if (spec[StringRange.MIN_LENGTH]) {
      payload = 'f'.repeat(spec[StringRange.MIN_LENGTH])
    }

    if (spec['pattern']) {
      payload = new RandExp(new RegExp(spec['pattern'])).gen()
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

  public static generateArrayPayload = (spec: InputSpec): Array<any> => {
    const payload: Array<any> = []

    const items = spec['items']
    if (items) {
      switch (items['type']) {
        case SchemaDataTypes.STRING: {
          payload.push(this.generateStringPayload(items))
          break
        }

        case SchemaDataTypes.NUMBER: {
          payload.push(this.generateNumberPayload(items))
          break
        }

        case SchemaDataTypes.INTEGER: {
          payload.push(this.generateIntegerPayload(items))
          break
        }

        case SchemaDataTypes.BOOLEAN: {
          payload.push(this.generateBooleanPayload())
          break
        }

        case SchemaDataTypes.ARRAY: {
          payload.push(this.generateArrayPayload(items))
          break
        }

        case SchemaDataTypes.OBJECT: {
          payload.push(this.generateObjectPayload(items))
          break
        }

        default:
          break
      }
    }

    return payload
  }

  public static generateObjectPayload = (spec: InputSpec): ObjectPayload => {
    const payload: ObjectPayload = {}

    const properties = spec['properties']
    if (properties) {
      for (const [prop, propSpec] of Object.entries(properties)) {
        switch ((propSpec as InputSpec)['type']) {
          case SchemaDataTypes.STRING: {
            payload[prop] = this.generateStringPayload(propSpec as InputSpec)
            break
          }

          case SchemaDataTypes.NUMBER: {
            payload[prop] = this.generateNumberPayload(propSpec as InputSpec)
            break
          }

          case SchemaDataTypes.INTEGER: {
            payload[prop] = this.generateIntegerPayload(propSpec as InputSpec)
            break
          }

          case SchemaDataTypes.BOOLEAN: {
            payload[prop] = this.generateBooleanPayload()
            break
          }

          case SchemaDataTypes.ARRAY: {
            payload[prop] = this.generateArrayPayload(propSpec as InputSpec)
            break
          }

          case SchemaDataTypes.OBJECT: {
            payload[prop] = this.generateObjectPayload(propSpec as InputSpec)
            break
          }

          default:
            break
        }
      }
    }

    return payload
  }
}
