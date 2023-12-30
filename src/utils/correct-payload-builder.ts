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
  private static generateStringPayload = (
    spec: InputSpec,
    useSpecDef: boolean
  ): string => {
    let payload = 'fuzz'

    if (useSpecDef) {
      if (spec[StringRange.MIN_LENGTH] !== undefined) {
        payload = 'f'.repeat(spec[StringRange.MIN_LENGTH])
      }
    }

    if (spec['pattern'] !== undefined) {
      payload = new RandExp(new RegExp(spec['pattern'])).gen()
    }

    if (spec['format'] !== undefined) {
      if (spec['format'] === StringFormats.DATE) {
        payload = moment().format('YYYY-MM-DD')
      }

      if (spec['format'] === StringFormats.DATETIME) {
        payload = moment().toISOString()
      }
    }

    return payload
  }

  private static generateNumberPayload = (
    spec: InputSpec,
    useSpecDef: boolean
  ): number => {
    let payload = 1

    if (useSpecDef) {
      if (spec[NumberRange.MINIMUM] !== undefined) {
        payload = spec[NumberRange.MINIMUM]
      }
    }

    return payload
  }

  private static generateIntegerPayload = (
    spec: InputSpec,
    useSpecDef: boolean
  ): number => {
    let payload = 1

    if (useSpecDef) {
      if (spec[NumberRange.MINIMUM] !== undefined) {
        payload = spec[NumberRange.MINIMUM]
      }
    }

    return payload
  }

  private static generateBooleanPayload = (): boolean => {
    const payload = Math.random() >= 0.5 ? 1 : 0
    return Boolean(payload)
  }

  public static generateArrayPayload = (
    spec: InputSpec,
    useSpecDef: boolean
  ): Array<any> => {
    const payload: Array<any> = []

    const items = spec['items']
    if (items !== undefined) {
      switch (items['type']) {
        case SchemaDataTypes.STRING: {
          payload.push(this.generateStringPayload(items, useSpecDef))
          break
        }

        case SchemaDataTypes.NUMBER: {
          payload.push(this.generateNumberPayload(items, useSpecDef))
          break
        }

        case SchemaDataTypes.INTEGER: {
          payload.push(this.generateIntegerPayload(items, useSpecDef))
          break
        }

        case SchemaDataTypes.BOOLEAN: {
          payload.push(this.generateBooleanPayload())
          break
        }

        case SchemaDataTypes.ARRAY: {
          payload.push(this.generateArrayPayload(items, useSpecDef))
          break
        }

        case SchemaDataTypes.OBJECT: {
          payload.push(this.generateObjectPayload(items, useSpecDef))
          break
        }

        default:
          break
      }
    }

    return payload
  }

  public static generateObjectPayload = (
    spec: InputSpec,
    useSpecDef: boolean
  ): ObjectPayload => {
    const payload: ObjectPayload = {}

    const properties = spec['properties']
    if (properties !== undefined) {
      for (const [prop, propSpec] of Object.entries(properties)) {
        switch ((propSpec as InputSpec)['type']) {
          case SchemaDataTypes.STRING: {
            payload[prop] = this.generateStringPayload(
              propSpec as InputSpec,
              useSpecDef
            )
            break
          }

          case SchemaDataTypes.NUMBER: {
            payload[prop] = this.generateNumberPayload(
              propSpec as InputSpec,
              useSpecDef
            )
            break
          }

          case SchemaDataTypes.INTEGER: {
            payload[prop] = this.generateIntegerPayload(
              propSpec as InputSpec,
              useSpecDef
            )
            break
          }

          case SchemaDataTypes.BOOLEAN: {
            payload[prop] = this.generateBooleanPayload()
            break
          }

          case SchemaDataTypes.ARRAY: {
            payload[prop] = this.generateArrayPayload(
              propSpec as InputSpec,
              useSpecDef
            )
            break
          }

          case SchemaDataTypes.OBJECT: {
            payload[prop] = this.generateObjectPayload(
              propSpec as InputSpec,
              useSpecDef
            )
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
