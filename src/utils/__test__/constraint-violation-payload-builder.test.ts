import { InputSpec, ObjectPayload } from '../../types/common'
import { ConstraintViolationPayloadBuilder } from '../constraint-violation-payload-builder'

const STR_MAX_LENGTH = 65535
const NUMBER_ADJUSTMENT = 1000000

it('returns constraint-violation payload variants for simple object', () => {
  const objectSchema: InputSpec = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 5,
        maxLength: 50,
      },
      age: {
        type: 'integer',
        minimum: 10,
        maximum: 60,
      },
    },
  }

  const correctPayload: ObjectPayload = {
    name: 'danar',
    age: 33,
  }

  const expected: ObjectPayload[] = [
    {
      name: '',
      age: 33,
    },
    {
      name: 'f'.repeat(STR_MAX_LENGTH),
      age: 33,
    },
    {
      name: 'f'.repeat(objectSchema['properties']['name']['minLength'] - 1),
      age: 33,
    },
    {
      name: 'f'.repeat(objectSchema['properties']['name']['maxLength'] + 100),
      age: 33,
    },
    {
      name: 'danar',
      age: Number.MIN_SAFE_INTEGER,
    },
    {
      name: 'danar',
      age: Number.MAX_SAFE_INTEGER,
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT,
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT,
    },
  ]

  const result = ConstraintViolationPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})

it('returns constraint-violation payload variants for nested object', () => {
  const objectSchema: InputSpec = {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        minLength: 5,
        maxLength: 50,
      },
      age: {
        type: 'integer',
        minimum: 10,
        maximum: 60,
      },
      monster: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            minLength: 5,
            maxLength: 50,
          },
          age: {
            type: 'integer',
            minimum: 1,
            maximum: 10,
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

  const expected: ObjectPayload[] = [
    {
      name: '',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'f'.repeat(STR_MAX_LENGTH),
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'f'.repeat(objectSchema['properties']['name']['minLength'] - 1),
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'f'.repeat(objectSchema['properties']['name']['maxLength'] + 100),
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'danar',
      age: Number.MIN_SAFE_INTEGER,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'danar',
      age: Number.MAX_SAFE_INTEGER,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT,
      monster: {
        name: 'charmender',
        age: 1,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: '',
        age: 1,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'f'.repeat(STR_MAX_LENGTH),
        age: 1,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'f'.repeat(
          objectSchema['properties']['monster']['properties']['name'][
            'minLength'
          ] - 1
        ),
        age: 1,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'f'.repeat(
          objectSchema['properties']['monster']['properties']['name'][
            'maxLength'
          ] + 100
        ),
        age: 1,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: Number.MIN_SAFE_INTEGER,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: Number.MAX_SAFE_INTEGER,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age:
          objectSchema['properties']['monster']['properties']['age'][
            'minimum'
          ] - NUMBER_ADJUSTMENT,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age:
          objectSchema['properties']['monster']['properties']['age'][
            'maximum'
          ] + NUMBER_ADJUSTMENT,
      },
    },
  ]

  const result = ConstraintViolationPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})
