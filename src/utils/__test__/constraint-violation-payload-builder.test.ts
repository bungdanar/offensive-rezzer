import moment from 'moment'
import { InputSpec, ObjectPayload } from '../../types/common'
import { ConstraintViolationPayloadBuilder } from '../constraint-violation-payload-builder'

const STR_MAX_LENGTH = 65535
const NUMBER_ADJUSTMENT = 1000000
const STR_DATETIME_YEAR_ADJUSTMENT = 100

const ANY_DATE = '1990-12-22'
const PAST_ANY_DATE = moment(ANY_DATE)
  .subtract(STR_DATETIME_YEAR_ADJUSTMENT, 'y')
  .format('YYYY-MM-DD')
const FUTURE_ANY_DATE = moment(ANY_DATE)
  .add(STR_DATETIME_YEAR_ADJUSTMENT, 'y')
  .format('YYYY-MM-DD')

const ANY_DATETIME = '1990-12-22 14:45:00'
const PAST_ANY_DATETIME = moment(ANY_DATETIME)
  .subtract(STR_DATETIME_YEAR_ADJUSTMENT, 'y')
  .toISOString()
const FUTURE_ANY_DATETIME = moment(ANY_DATETIME)
  .add(STR_DATETIME_YEAR_ADJUSTMENT, 'y')
  .toISOString()

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
      birthDate: {
        type: 'string',
        format: 'date',
      },
    },
  }

  const correctPayload: ObjectPayload = {
    name: 'danar',
    age: 33,
    birthDate: ANY_DATE,
  }

  const expected: ObjectPayload[] = [
    {
      name: '',
      age: 33,
      birthDate: ANY_DATE,
    },
    {
      name: 'f'.repeat(STR_MAX_LENGTH),
      age: 33,
      birthDate: ANY_DATE,
    },
    {
      name: 'f'.repeat(objectSchema['properties']['name']['minLength'] - 1),
      age: 33,
      birthDate: ANY_DATE,
    },
    {
      name: 'f'.repeat(objectSchema['properties']['name']['maxLength'] + 100),
      age: 33,
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: Number.MIN_SAFE_INTEGER,
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: Number.MAX_SAFE_INTEGER,
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT,
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT,
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: 33,
      birthDate: '',
    },
    {
      name: 'danar',
      age: 33,
      birthDate: 'f'.repeat(STR_MAX_LENGTH),
    },
    {
      name: 'danar',
      age: 33,
      birthDate: PAST_ANY_DATE,
    },
    {
      name: 'danar',
      age: 33,
      birthDate: FUTURE_ANY_DATE,
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
            minimum: 0,
            maximum: 10,
          },
          birthDate: {
            type: 'string',
            format: 'date-time',
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
      birthDate: ANY_DATETIME,
    },
  }

  const expected: ObjectPayload[] = [
    {
      name: '',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'f'.repeat(STR_MAX_LENGTH),
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'f'.repeat(objectSchema['properties']['name']['minLength'] - 1),
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'f'.repeat(objectSchema['properties']['name']['maxLength'] + 100),
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: Number.MIN_SAFE_INTEGER,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: Number.MAX_SAFE_INTEGER,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: '',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'f'.repeat(STR_MAX_LENGTH),
        age: 1,
        birthDate: ANY_DATETIME,
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
        birthDate: ANY_DATETIME,
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
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: Number.MIN_SAFE_INTEGER,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: Number.MAX_SAFE_INTEGER,
        birthDate: ANY_DATETIME,
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
        birthDate: ANY_DATETIME,
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
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: '',
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: 'f'.repeat(STR_MAX_LENGTH),
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: PAST_ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: FUTURE_ANY_DATETIME,
      },
    },
  ]

  const result = ConstraintViolationPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})

it('returns constraint-violation payload variants for object with nested simple array', () => {
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
      monsters: {
        type: 'array',
        items: {
          type: 'string',
          minLength: 5,
          maxLength: 50,
        },
      },
      levels: {
        type: 'array',
        items: {
          type: 'integer',
          minimum: 0,
          maximum: 99,
        },
      },
      matchDates: {
        type: 'array',
        items: {
          type: 'string',
          format: 'date',
        },
      },
    },
  }

  const correctPayload: ObjectPayload = {
    name: 'danar',
    age: 33,
    monsters: ['charmender'],
    levels: [20],
    matchDates: [ANY_DATE],
  }

  const expected: ObjectPayload[] = [
    {
      name: '',
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'f'.repeat(STR_MAX_LENGTH),
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'f'.repeat(objectSchema['properties']['name']['minLength'] - 1),
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'f'.repeat(objectSchema['properties']['name']['maxLength'] + 100),
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: Number.MIN_SAFE_INTEGER,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: Number.MAX_SAFE_INTEGER,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [''],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['f'.repeat(STR_MAX_LENGTH)],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        'f'.repeat(
          objectSchema['properties']['monsters']['items']['minLength'] - 1
        ),
      ],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        'f'.repeat(
          objectSchema['properties']['monsters']['items']['maxLength'] + 100
        ),
      ],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [Number.MIN_SAFE_INTEGER],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [Number.MAX_SAFE_INTEGER],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [
        objectSchema['properties']['levels']['items']['minimum'] -
          NUMBER_ADJUSTMENT,
      ],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [
        objectSchema['properties']['levels']['items']['maximum'] +
          NUMBER_ADJUSTMENT,
      ],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [''],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: ['f'.repeat(STR_MAX_LENGTH)],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [PAST_ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [FUTURE_ANY_DATE],
    },
  ]

  const result = ConstraintViolationPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})

it('returns constraint-violation payload variants for object with nested array of object', () => {
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
      monsters: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              minLength: 5,
              maxLength: 50,
            },
            age: {
              type: 'integer',
              minimum: 0,
              maximum: 10,
            },
          },
        },
      },
      matchs: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            schedule: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
      },
    },
  }

  const correctPayload: ObjectPayload = {
    name: 'danar',
    age: 33,
    monsters: [
      {
        name: 'charmender',
        age: 1,
      },
    ],
    matchs: [
      {
        schedule: ANY_DATETIME,
      },
    ],
  }

  const expected: ObjectPayload[] = [
    {
      name: '',
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'f'.repeat(STR_MAX_LENGTH),
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'f'.repeat(objectSchema['properties']['name']['minLength'] - 1),
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'f'.repeat(objectSchema['properties']['name']['maxLength'] + 100),
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: Number.MIN_SAFE_INTEGER,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: Number.MAX_SAFE_INTEGER,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: '',
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'f'.repeat(STR_MAX_LENGTH),
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'f'.repeat(
            objectSchema['properties']['monsters']['items']['properties'][
              'name'
            ]['minLength'] - 1
          ),
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'f'.repeat(
            objectSchema['properties']['monsters']['items']['properties'][
              'name'
            ]['maxLength'] + 100
          ),
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: Number.MIN_SAFE_INTEGER,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: Number.MAX_SAFE_INTEGER,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age:
            objectSchema['properties']['monsters']['items']['properties'][
              'age'
            ]['minimum'] - NUMBER_ADJUSTMENT,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age:
            objectSchema['properties']['monsters']['items']['properties'][
              'age'
            ]['maximum'] + NUMBER_ADJUSTMENT,
        },
      ],
      matchs: [
        {
          schedule: ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: '',
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: 'f'.repeat(STR_MAX_LENGTH),
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: PAST_ANY_DATETIME,
        },
      ],
    },
    {
      name: 'danar',
      age: 33,
      monsters: [
        {
          name: 'charmender',
          age: 1,
        },
      ],
      matchs: [
        {
          schedule: FUTURE_ANY_DATETIME,
        },
      ],
    },
  ]

  const result = ConstraintViolationPayloadBuilder.generateObjectPayload(
    correctPayload,
    objectSchema
  )

  expect(result).toEqual(expected)
})
