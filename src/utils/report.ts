import fs from 'fs/promises'

import { uniqBy } from 'lodash'
import JSONbig from 'json-bigint'

import {
  AddReportData,
  PrettyReportStruct,
  ReportStruct,
} from '../types/common'

export class Report {
  public static readonly report: ReportStruct = {}

  public static addReportData = ({
    path,
    method,
    statusCode,
    payload,
    response,
  }: AddReportData) => {
    const newData = {
      payload,
      statusCode,
      response,
    }

    if (this.report[path] === undefined) {
      this.report[path] = {
        [method]: [newData],
      }
    } else {
      if (this.report[path][method] === undefined) {
        this.report[path] = {
          [method]: [newData],
        }
      } else {
        this.report[path][method] = [...this.report[path][method], newData]
      }
    }
  }

  public static get prettyReport(): PrettyReportStruct {
    const pretty: PrettyReportStruct = {}

    for (const [path, methods] of Object.entries(this.report)) {
      pretty[path] = {}

      for (const [method, payloads] of Object.entries(methods)) {
        pretty[path][method] = {}

        const uniqStatusCode = uniqBy(payloads, 'statusCode').map(
          (s) => s.statusCode
        )

        for (let i = 0; i < uniqStatusCode.length; i++) {
          const statusCode = uniqStatusCode[i]

          const relatedData = payloads
            .filter((p) => p.statusCode === statusCode)
            .map((p) => ({
              payload: p.payload,
              response: p.response,
            }))

          pretty[path][method][statusCode] = {
            numOfRequest: relatedData.length,
            data: relatedData,
          }
        }
      }
    }

    return pretty
  }

  public static writeReport = async () => {
    const report = this.prettyReport

    await fs.writeFile(
      'report.json',
      JSONbig.stringify(report, null, 2),
      'utf8'
    )
  }
}
