import { SchemaDataTypes } from '../enums/openapi-data-types'
import { InputSpec, ObjectPayload } from '../types/common'

export class InvalidPayloadBuilder {
  public static getInvalidValueForPrimitive = () => {
    return {
      fuzz: 'fuzz',
    }
  }

  public static getInvalidValueForComplex = () => 'fuzz'

  private static generateObjectPayloadVariants = (
    prop: string,
    spec: InputSpec,
    correctPayload: ObjectPayload
  ): ObjectPayload[] => {
    const payloads: ObjectPayload[] = []

    // Assign primitive value
    const copyWithPrimitive = structuredClone(correctPayload)
    copyWithPrimitive[prop] = this.getInvalidValueForComplex()
    payloads.push(copyWithPrimitive)

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

    // Assign primitive value
    const copy = structuredClone(correctPayload)
    copy[prop] = this.getInvalidValueForComplex()

    // Assign array of primitive value
    const copy2 = structuredClone(correctPayload)
    copy2[prop] = [this.getInvalidValueForComplex()]

    payloads.push(copy, copy2)

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
          // Assign primitive value
          const copy = structuredClone(correctPayload)
          copy[prop] = this.getInvalidValueForComplex()

          // Assign complex value to array element
          const copy2 = structuredClone(correctPayload)
          copy2[prop] = [this.getInvalidValueForPrimitive()]

          payloads.push(copy, copy2)

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
          // Assign primitive value
          const copy = structuredClone(correctPayload)
          copy[prop] = this.getInvalidValueForComplex()

          payloads.push(copy)

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
            // Assign complex value
            const copy = structuredClone(correctPayload)
            copy[prop] = this.getInvalidValueForPrimitive()

            totalPayloads.push(copy)

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
