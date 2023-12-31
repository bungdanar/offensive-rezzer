import { AddReportData, ReportStruct } from '../types/common'

export class Report {
  public static readonly report: ReportStruct = {}

  public static addReportData = ({
    path,
    method,
    statusCode,
    payload,
  }: AddReportData) => {
    const newData = {
      payload,
      statusCode,
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
}
