import { InputSpec, ObjectPayload } from '../../types/common'
import { InvalidPayloadBuilder } from '../invalid-payload-builder'

it('returns invalid-type payload variants for simple object', () => {
  const objectSchema: InputSpec = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'integer',
      },
    },
  }

  const correctPayload: ObjectPayload = {
    name: 'danar',
    age: 33,
  }

  const INVALID_VALUE_FOR_PRIMITIVE =
    InvalidPayloadBuilder.getInvalidValueForPrimitive()

  const expected: ObjectPayload[] = [
    {
      name: INVALID_VALUE_FOR_PRIMITIVE,
      age: 33,
    },
    {
      name: 'danar',
      age: INVALID_VALUE_FOR_PRIMITIVE,
    },
  ]

  const result = InvalidPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})

it('returns invalid-type payload variants for nested object', () => {
  const objectSchema: InputSpec = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'integer',
      },
      monster: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
          },
          age: {
            type: 'integer',
          },
        },
      },
    },
  }

  const correctPayload: ObjectPayload = {
    name: 'danar',
    age: 33,
    monster: {
      name: 'charmender',
      age: 1,
    },
  }

  const INVALID_VALUE_FOR_PRIMITIVE =
    InvalidPayloadBuilder.getInvalidValueForPrimitive()
  const INVALID_VALUE_FOR_COMPLEX =
    InvalidPayloadBuilder.getInvalidValueForComplex()

  const expected: ObjectPayload[] = [
    {
      name: INVALID_VALUE_FOR_PRIMITIVE,
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'danar',
      age: INVALID_VALUE_FOR_PRIMITIVE,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: INVALID_VALUE_FOR_COMPLEX,
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: INVALID_VALUE_FOR_PRIMITIVE,
        age: 1,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: INVALID_VALUE_FOR_PRIMITIVE,
      },
    },
  ]

  const result = InvalidPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})

it('returns invalid-type payload variants for object with nested simple array', () => {
  const objectSchema: InputSpec = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
      },
      age: {
        type: 'integer',
      },
      tags: {
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  }

  const correctPayload: ObjectPayload = {
    name: 'danar',
    age: 33,
    tags: ['beginner'],
  }

  const INVALID_VALUE_FOR_PRIMITIVE =
    InvalidPayloadBuilder.getInvalidValueForPrimitive()
  const INVALID_VALUE_FOR_COMPLEX =
    InvalidPayloadBuilder.getInvalidValueForComplex()

  const expected: ObjectPayload[] = [
    {
      name: INVALID_VALUE_FOR_PRIMITIVE,
      age: 33,
      tags: ['beginner'],
    },
    {
      name: 'danar',
      age: INVALID_VALUE_FOR_PRIMITIVE,
      tags: ['beginner'],
    },
    {
      name: 'danar',
      age: 33,
      tags: INVALID_VALUE_FOR_COMPLEX,
    },
    {
      name: 'danar',
      age: 33,
      tags: [INVALID_VALUE_FOR_PRIMITIVE],
    },
  ]

  const result = InvalidPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})
