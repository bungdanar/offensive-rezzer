# OffensiveRezzer

OffensiveRezzer is a black-box fuzzing tool for Web API.

Currently, OffensiveRezzer is still in the early prototype stage and is still being actively developed. 
In this initial version, OffensiveRezzer still has some limitations. 
If you need a mature fuzzing tool, you can try several other fuzzing tools such as [EvoMaster](https://github.com/EMResearch/EvoMaster), [Restler](https://github.com/microsoft/restler-fuzzer), 
[RestTestGen](https://github.com/SeUniVr/RestTestGen), [Schemathesis](https://github.com/schemathesis/schemathesis), and [Tcases](https://github.com/Cornutum/tcases).

## Current Features

- Supports REST architecture.
- Supports reading specifications in OpenAPI v3 format.
- Perform fuzzing scenarios using the GET, POST, PUT, PATCH, and DELETE methods.
- Generate fuzzing payloads (missing required, invalid type, and constraint violation) for the `request body`, `query parameters` and `path parameters`.
- Supports authentication in fuzzing scenarios, both in headers and cookies.

## Todo (in order of priority)
- [x] Supports fuzzing scenarios for endpoints **that contain** path parameters.
- [x] Supports fuzzing scenarios for endpoint inter-dependencies. For example, to perform effective fuzzing on endpoints that require path parameters, such as endpoints to update individual resources, OffensiveRezzer will try to create a new resource first and then perform fuzzing based on the identifier obtained from the new resource.
- [x] Supports creating fuzzing payloads for path parameters.
- [x] Supports authentication in fuzzing scenarios, both in headers and cookies.
- [ ] Supports fuzzing scenarios using payload examples in the specification.
- [ ] Supports automatic creation of unit test scripts based on fuzzing results so that fuzzing scenarios can be replicated or replayed. The resulting unit tests will then be written in various formats that can be selected, such as JUnit (Java), Jest (JavaScript), and XUnit (C#).
- [ ] Supports fuzzing scenarios for SQL Injection and Stored XSS.
- [ ] Supports fuzzing scenarios for other communication architectures such as GraphQL and RPC.
- [ ] Rewrite the tool using a high-performance language such as Java or Go.
- [ ] And more...

## How to Run (Locally)
1. Install [NodeJs](https://nodejs.org) version 20.9 or higher. You can also install NodeJs using [nvm](https://github.com/nvm-sh/nvm) or [nvm for Windows](https://github.com/coreybutler/nvm-windows) if you already have NodeJs in a different version.
2. Clone this repository.
3. Run command `npm install`.
4. Create a `.env` file, then copy and paste the contents of the `.env.example` file into the `.env` file. `MAX_ITER` is a variable that must be defined with an integer value where `MAX_ITER` indicates how many fuzzing iterations will be performed. `TARGET_URL` is an optional variable that, if defined, the `TARGET_URL` value will replace the server URL in the OpenAPI specification file.
5. In the project root directory, create a new directory with the name `api-spec`, then place the OpenAPI specification for the application that will be the fuzzing target into the `api-spec` directory with the file name `openapi.json`.
6. Run command `npm start` to perform fuzzing.

## How to Run (Docker)
1. Clone this repository.
2. Create a `.env` file, then copy and paste the contents of the `.env.example` file into the `.env` file. `MAX_ITER` is a variable that must be defined with an integer value where `MAX_ITER` indicates how many fuzzing iterations will be performed. `TARGET_URL` is an optional variable that, if defined, the `TARGET_URL` value will replace the server URL in the OpenAPI specification file.
3. In the project root directory, create a new directory with the name `api-spec`, then place the OpenAPI specification for the application that will be the fuzzing target into the `api-spec` directory with the file name `openapi.json`.
4. Run command `docker compose build` to create OffensiveRezzer image.
5. Run command `docker compose up` to perform fuzzing.

## Authentication
OffensiveRezzer supports the use of authentication during the fuzzing process. The authentication types supported by OffensiveRezzer are tokens and cookies. The authentication configuration in OffensiveRezzer is inspired by the authentication configuration in [EvoMaster](https://github.com/EMResearch/EvoMaster/blob/master/docs/auth.md).
1. Create a file with the name `auth.json` in the root directory of the OffensiveRezzer project. Copy all content from the `auth.example.json` file to the `auth.json` file.
2. `fullEndpoint`: Enter the endpoint URL used to obtain credentials. You must write down the login URL in full, for example http://localhost:5000/api/login.
3. `method`: Enter the HTTP method used on the login endpoint, for example `POST`.
4. `contentType`: Enter the content type used on the login endpoint, for example `application/json`.
5. `expectCookies`: Fill with a `boolean` value. If the application uses cookie-based authentication, fill it with the value `true`, otherwise `false`.
6. `payload`: The credential payload used for the login process.
7. `token`: Configuration related to token-based authentication, consisting of `headerPrefix`, `extractFromField`, and `httpHeaderName`. `headerPrefix` is a token prefix used in headers, for example `Bearer `. `httpHeaderName` is the name of the header used to send tokens, for example `Authorization`. `extractFromField` is the field name of the token when the authentication process is successful. For example, when the authentication process is successful, the response data received is:
   ```
   {
      "token": "12345"
   }
   ```
   To get the token value, please fill in `extractFromField` with the value `/token`. Another example, if the response data received is:
   ```
   {
       "data": {
           "token": "12345"
       }
   }
   ```
   then the input value for `extractFromField` is `/data/token`.
8. The following is an complete example of the auth.json file.
   ```
   {
        "fullEndpoint": "http://localhost:5000/api/login",
        "method": "POST",
        "contentType": "application/json",
        "expectCookies": false,
        "payload": {
          "username": "admin",
          "password": "12345",
          "usernameField": "username",
          "passwordField": "password"
        },
        "token": {
          "headerPrefix": "Bearer ",
          "extractFromField": "/token",
          "httpHeaderName": "Authorization"
        }
   }
   ```

## Output
- OffensiveRezzer will generate a report in the `output/report.json` directory after performing a fuzzing session. The resulting report contains information on each endpoint followed by various status codes found on that endpoint, payload/param information sent to the endpoint, and the response received from the server.
- If an unexpected error occurs when running OffensiveRezzer, the error will be logged in the `output/error.log` directory. Please report the error by creating an issue in this repository.
