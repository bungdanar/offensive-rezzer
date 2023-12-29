import moment from 'moment'
import { InputSpec, ObjectPayload } from '../../types/common'
import { ConstraintViolationPayloadBuilder } from '../constraint-violation-payload-builder'

const STR_MAX_LENGTH = 65535
const NUMBER_ADJUSTMENT = [1e6, 1e7, 1e8, 1e9]
const STR_DATETIME_YEAR_ADJUSTMENT = [1e2, 1e3, 1e4, 1e5]

const ANY_DATE = '1990-12-22'
const ANY_DATE_ADJUSTMENTS: string[] = []
for (let i = 0; i < STR_DATETIME_YEAR_ADJUSTMENT.length; i++) {
  const yearAdjustment = STR_DATETIME_YEAR_ADJUSTMENT[i]

  const past = moment(ANY_DATE)
    .subtract(yearAdjustment, 'y')
    .format('YYYY-MM-DD')
  const future = moment(ANY_DATE).add(yearAdjustment, 'y').format('YYYY-MM-DD')

  ANY_DATE_ADJUSTMENTS.push(past, future)
}

const ANY_DATETIME = '1990-12-22 14:45:00'
const ANY_DATETIME_ADJUSTMENTS: string[] = []
for (let i = 0; i < STR_DATETIME_YEAR_ADJUSTMENT.length; i++) {
  const yearAdjustment = STR_DATETIME_YEAR_ADJUSTMENT[i]

  const past = moment(ANY_DATETIME).subtract(yearAdjustment, 'y').toISOString()
  const future = moment(ANY_DATETIME).add(yearAdjustment, 'y').toISOString()

  ANY_DATETIME_ADJUSTMENTS.push(past, future)
}

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
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[0],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[1],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[2],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[3],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[0],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[1],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[2],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[3],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: 33 - NUMBER_ADJUSTMENT[0],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: 33 + NUMBER_ADJUSTMENT[0],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: 33 - NUMBER_ADJUSTMENT[1],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: 33 + NUMBER_ADJUSTMENT[1],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: 33 - NUMBER_ADJUSTMENT[2],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: 33 + NUMBER_ADJUSTMENT[2],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: 33 - NUMBER_ADJUSTMENT[3],
      birthDate: ANY_DATE,
    },
    {
      name: 'danar',
      age: 33 + NUMBER_ADJUSTMENT[3],
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
      birthDate: ANY_DATE_ADJUSTMENTS[0],
    },
    {
      name: 'danar',
      age: 33,
      birthDate: ANY_DATE_ADJUSTMENTS[1],
    },
    {
      name: 'danar',
      age: 33,
      birthDate: ANY_DATE_ADJUSTMENTS[2],
    },
    {
      name: 'danar',
      age: 33,
      birthDate: ANY_DATE_ADJUSTMENTS[3],
    },
    {
      name: 'danar',
      age: 33,
      birthDate: ANY_DATE_ADJUSTMENTS[4],
    },
    {
      name: 'danar',
      age: 33,
      birthDate: ANY_DATE_ADJUSTMENTS[5],
    },
    {
      name: 'danar',
      age: 33,
      birthDate: ANY_DATE_ADJUSTMENTS[6],
    },
    {
      name: 'danar',
      age: 33,
      birthDate: ANY_DATE_ADJUSTMENTS[7],
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
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[0],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[1],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[2],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[3],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[0],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[1],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[2],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[3],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33 - NUMBER_ADJUSTMENT[0],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33 + NUMBER_ADJUSTMENT[0],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33 - NUMBER_ADJUSTMENT[1],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33 + NUMBER_ADJUSTMENT[1],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33 - NUMBER_ADJUSTMENT[2],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33 + NUMBER_ADJUSTMENT[2],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33 - NUMBER_ADJUSTMENT[3],
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33 + NUMBER_ADJUSTMENT[3],
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
          ] - NUMBER_ADJUSTMENT[0],
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
          ] - NUMBER_ADJUSTMENT[1],
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
          ] - NUMBER_ADJUSTMENT[2],
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
          ] - NUMBER_ADJUSTMENT[3],
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
          ] + NUMBER_ADJUSTMENT[0],
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
          ] + NUMBER_ADJUSTMENT[1],
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
          ] + NUMBER_ADJUSTMENT[2],
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
          ] + NUMBER_ADJUSTMENT[3],
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1 - NUMBER_ADJUSTMENT[0],
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1 + NUMBER_ADJUSTMENT[0],
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1 - NUMBER_ADJUSTMENT[1],
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1 + NUMBER_ADJUSTMENT[1],
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1 - NUMBER_ADJUSTMENT[2],
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1 + NUMBER_ADJUSTMENT[2],
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1 - NUMBER_ADJUSTMENT[3],
        birthDate: ANY_DATETIME,
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1 + NUMBER_ADJUSTMENT[3],
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
        birthDate: ANY_DATETIME_ADJUSTMENTS[0],
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME_ADJUSTMENTS[1],
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME_ADJUSTMENTS[2],
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME_ADJUSTMENTS[3],
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME_ADJUSTMENTS[4],
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME_ADJUSTMENTS[5],
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME_ADJUSTMENTS[6],
      },
    },
    {
      name: 'danar',
      age: 33,
      monster: {
        name: 'charmender',
        age: 1,
        birthDate: ANY_DATETIME_ADJUSTMENTS[7],
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
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[0],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[1],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[2],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[3],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[0],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[1],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[2],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[3],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33 - NUMBER_ADJUSTMENT[0],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33 + NUMBER_ADJUSTMENT[0],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33 - NUMBER_ADJUSTMENT[1],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33 + NUMBER_ADJUSTMENT[1],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33 - NUMBER_ADJUSTMENT[2],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33 + NUMBER_ADJUSTMENT[2],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33 - NUMBER_ADJUSTMENT[3],
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33 + NUMBER_ADJUSTMENT[3],
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
          NUMBER_ADJUSTMENT[0],
      ],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [
        objectSchema['properties']['levels']['items']['minimum'] -
          NUMBER_ADJUSTMENT[1],
      ],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [
        objectSchema['properties']['levels']['items']['minimum'] -
          NUMBER_ADJUSTMENT[2],
      ],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [
        objectSchema['properties']['levels']['items']['minimum'] -
          NUMBER_ADJUSTMENT[3],
      ],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [
        objectSchema['properties']['levels']['items']['maximum'] +
          NUMBER_ADJUSTMENT[0],
      ],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [
        objectSchema['properties']['levels']['items']['maximum'] +
          NUMBER_ADJUSTMENT[1],
      ],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [
        objectSchema['properties']['levels']['items']['maximum'] +
          NUMBER_ADJUSTMENT[2],
      ],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [
        objectSchema['properties']['levels']['items']['maximum'] +
          NUMBER_ADJUSTMENT[3],
      ],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20 - NUMBER_ADJUSTMENT[0]],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20 + NUMBER_ADJUSTMENT[0]],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20 - NUMBER_ADJUSTMENT[1]],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20 + NUMBER_ADJUSTMENT[1]],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20 - NUMBER_ADJUSTMENT[2]],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20 + NUMBER_ADJUSTMENT[2]],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20 - NUMBER_ADJUSTMENT[3]],
      matchDates: [ANY_DATE],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20 + NUMBER_ADJUSTMENT[3]],
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
      matchDates: [ANY_DATE_ADJUSTMENTS[0]],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE_ADJUSTMENTS[1]],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE_ADJUSTMENTS[2]],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE_ADJUSTMENTS[3]],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE_ADJUSTMENTS[4]],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE_ADJUSTMENTS[5]],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE_ADJUSTMENTS[6]],
    },
    {
      name: 'danar',
      age: 33,
      monsters: ['charmender'],
      levels: [20],
      matchDates: [ANY_DATE_ADJUSTMENTS[7]],
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
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[0],
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
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[1],
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
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[2],
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
      age: objectSchema['properties']['age']['minimum'] - NUMBER_ADJUSTMENT[3],
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
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[0],
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
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[1],
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
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[2],
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
      age: objectSchema['properties']['age']['maximum'] + NUMBER_ADJUSTMENT[3],
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
      age: 33 - NUMBER_ADJUSTMENT[0],
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
      age: 33 + NUMBER_ADJUSTMENT[0],
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
      age: 33 - NUMBER_ADJUSTMENT[1],
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
      age: 33 + NUMBER_ADJUSTMENT[1],
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
      age: 33 - NUMBER_ADJUSTMENT[2],
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
      age: 33 + NUMBER_ADJUSTMENT[2],
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
      age: 33 - NUMBER_ADJUSTMENT[3],
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
      age: 33 + NUMBER_ADJUSTMENT[3],
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
            ]['minimum'] - NUMBER_ADJUSTMENT[0],
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
            ]['minimum'] - NUMBER_ADJUSTMENT[1],
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
            ]['minimum'] - NUMBER_ADJUSTMENT[2],
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
            ]['minimum'] - NUMBER_ADJUSTMENT[3],
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
            ]['maximum'] + NUMBER_ADJUSTMENT[0],
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
            ]['maximum'] + NUMBER_ADJUSTMENT[1],
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
            ]['maximum'] + NUMBER_ADJUSTMENT[2],
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
            ]['maximum'] + NUMBER_ADJUSTMENT[3],
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
          age: 1 - NUMBER_ADJUSTMENT[0],
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
          age: 1 + NUMBER_ADJUSTMENT[0],
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
          age: 1 - NUMBER_ADJUSTMENT[1],
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
          age: 1 + NUMBER_ADJUSTMENT[1],
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
          age: 1 - NUMBER_ADJUSTMENT[2],
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
          age: 1 + NUMBER_ADJUSTMENT[2],
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
          age: 1 - NUMBER_ADJUSTMENT[3],
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
          age: 1 + NUMBER_ADJUSTMENT[3],
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
          schedule: ANY_DATETIME_ADJUSTMENTS[0],
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
          schedule: ANY_DATETIME_ADJUSTMENTS[1],
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
          schedule: ANY_DATETIME_ADJUSTMENTS[2],
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
          schedule: ANY_DATETIME_ADJUSTMENTS[3],
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
          schedule: ANY_DATETIME_ADJUSTMENTS[4],
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
          schedule: ANY_DATETIME_ADJUSTMENTS[5],
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
          schedule: ANY_DATETIME_ADJUSTMENTS[6],
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
          schedule: ANY_DATETIME_ADJUSTMENTS[7],
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
