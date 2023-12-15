import OpenApiParser from '@readme/openapi-parser'

const app = async () => {
  try {
    const apiSpec = await OpenApiParser.validate('openapi.example.json')
    console.log(
      `API name: ${apiSpec.info.title}, Version: ${apiSpec.info.version}`
    )
  } catch (error) {
    console.error(error)
  }
}

app()
