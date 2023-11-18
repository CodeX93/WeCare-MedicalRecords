export default class MedicalRecord {
  constructor(id, RecordTitle, RecordFile, Result, _date, PatientId) {
    this.id = id;
    this.RecordTitle = RecordTitle;
    this.RecordFile = RecordFile;
    this.Result = Result;
    this.Date = _date;
    this.PatientId = PatientId;
    this.Timestamp = Timestamp;
  }
}
