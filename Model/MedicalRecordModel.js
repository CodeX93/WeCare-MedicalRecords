// MedicalRecordModel.js
class MedicalRecordModel {
  constructor(
    id,
    patientId,
    recordType,
    fileUrl,
    comments,
    content,
    medicines
  ) {
    this.id = id;
    this.patientId = patientId;
    this.recordType = recordType;
    this.fileUrl = fileUrl;
    this.comments = comments;
    this.content = content;
    this.medicines = medicines;
  }
}

export default MedicalRecordModel;
