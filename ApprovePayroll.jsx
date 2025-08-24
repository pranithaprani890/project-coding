import React, { useState, useEffect } from "react";
import BackToDashboard from "../../common/components/BackToDashboard";
import { getAllBatches, setStatus, downloadText } from "../../common/storage/payrollStore";

export default function ApprovePayroll() {
  const [submissions, setSubmissions] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [enteredPasscode, setEnteredPasscode] = useState("");
  const [pendingDecision, setPendingDecision] = useState(null);
  const [message, setMessage] = useState("");

  const APPROVER_PASSCODE = "1234"; // Change to real secure passcode later

  const refresh = () => {
    const all = getAllBatches();
    setSubmissions(all.filter((b) => b.status === "Submitted"));
  };

  useEffect(() => {
    refresh();
  }, []);

  const openPasscodeModal = (batchId, decision) => {
    setPendingDecision({ batchId, decision });
    setShowPasscodeModal(true);
    setEnteredPasscode("");
    setMessage("");
  };

  const confirmDecision = () => {
    if (enteredPasscode === APPROVER_PASSCODE) {
      const { batchId, decision } = pendingDecision;
      const meta = {
        approvedBy: "Approver User",
        approvedAt: new Date().toISOString(),
        remarks: remarks[batchId] || "",
      };
      setStatus(batchId, decision, meta);
      refresh();
      setMessage(`Payroll batch ${decision} successfully!`);
      setShowPasscodeModal(false);
    } else {
      setMessage("❌ Incorrect passcode. Try again.");
    }
  };

  const onRemarkChange = (id, value) => {
    setRemarks((prev) => ({ ...prev, [id]: value }));
  };

  const downloadSummary = (batch) => {
    const lines = [
      `Payroll Batch Summary — ${batch.id}`,
      `Status: ${batch.status}`,
      `Created: ${batch.createdAt ? new Date(batch.createdAt).toLocaleString() : "-"}`,
      `Payment Type: ${batch.instruction.paymentType}`,
      `Currency: ${batch.instruction.paymentCurrency}`,
      `Debit Account: ${batch.instruction.debitAccount}`,
      `Date: ${batch.instruction.date}`,
      "",
      "Payments:",
      ...batch.payments.map(
        (p, i) => `${i + 1}. ${p.payeeName} | ${p.amount} ${batch.instruction.paymentCurrency}`
      ),
    ];
    downloadText(`Payroll_${batch.id}_Summary.txt`, lines.join("\n"));
  };

  const calculateTotalAmount = (batch) => {
    return batch.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  };

  return (
    <div className="container my-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Approve Payroll</h2>
        <BackToDashboard />
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {submissions.length === 0 ? (
        <p>No payrolls awaiting approval.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered align-middle text-center">
            <thead className="table-light">
              <tr>
                <th>Batch ID</th>
                <th>Created</th>
                <th>Payments</th>
                <th>Total Amount</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((b) => (
                <tr key={b.id}>
                  <td>{b.id}</td>
                  <td>{b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}</td>
                  <td>{b.payments.length}</td>
                  <td>
                    {calculateTotalAmount(b)} {b.instruction.paymentCurrency}
                  </td>
                  <td style={{ minWidth: 220 }}>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Optional remarks"
                      value={remarks[b.id] || ""}
                      onChange={(e) => onRemarkChange(b.id, e.target.value)}
                    />
                  </td>
                  <td className="text-nowrap">
                    <button
                      className="btn btn-success btn-sm me-2"
                      onClick={() => openPasscodeModal(b.id, "Approved")}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-danger btn-sm me-2"
                      onClick={() => openPasscodeModal(b.id, "Rejected")}
                    >
                      Reject
                    </button>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => downloadSummary(b)}
                    >
                      Download Summary
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Passcode Modal */}
      {showPasscodeModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Enter Approver Passcode</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPasscodeModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter passcode"
                  value={enteredPasscode}
                  onChange={(e) => setEnteredPasscode(e.target.value)}
                />
                {message && <p className="text-danger mt-2">{message}</p>}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowPasscodeModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={confirmDecision}>
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}























use case story 																	
component																	
Scneario ( do all the story telling you want)	service functionname	input argument and data type	return type and data type	how will you know failure and success, http status codes	if we are using models what the values indicate	database function	type of thing you want to do in database, insert, update, select (single select or multiselect)	request processing function URI	how is input taken (path variable, parameter, body)	what will be the reponse.. With details  with http status codes	validation	error handling scenario	security implications if any	which component of react will call this	what will the component  do with what the server will send	positive scenarios	negative scenarios













| **Column**                               | **Value**                                                                                                                                                                                                                                                                                               |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use Case Story                           | User Story-5: As a User, I want to approve the payment, so that it can get processed.                                                                                                                                                                                                                   |
| Component                                | ApprovePayroll (React Component)                                                                                                                                                                                                                                                                        |
| Scenario                                 | User logs in → Sees list of payroll batches with status = "Submitted" → User can enter remarks → User chooses **Approve** or **Reject** → System asks for passcode → If passcode correct, update batch status and log approver details → Refresh table → Optionally, user can download payroll summary. |
| Service Function Name                    | setStatus                                                                                                                                                                                                                                                                                               |
| Input Argument & Data Type               | `batchId: string`, `decision: string ("Approved"/"Rejected")`, `meta: object { approvedBy: string, approvedAt: datetime, remarks: string }`                                                                                                                                                             |
| Return Type & Data Type                  | JSON `{ success: boolean, message: string, updatedBatch: object }`                                                                                                                                                                                                                                      |
| Success / Failure & HTTP Codes           | **200 OK**: Approval/Reject success, **400 Bad Request**: Invalid data, **401 Unauthorized**: Wrong passcode, **403 Forbidden**: Access restriction, **404 Not Found**: Batch doesn’t exist, **500 Internal Server Error**: DB/server error                                                             |
| Models & Meaning                         | Batch Model → `id`, `status`, `createdAt`, `payments[]`, `instruction{ paymentType, paymentCurrency, debitAccount, date }`. Payment Model → `payeeName`, `amount`. Status field indicates workflow stage.                                                                                               |
| Database Function                        | `UPDATE batch SET status=?, approvedBy=?, approvedAt=?, remarks=? WHERE id=?` ; `SELECT * FROM batch WHERE status="Submitted"` (multi-select for listing).                                                                                                                                              |
| Request Processing Function URI          | `GET /api/payroll/batches?status=Submitted` → list for approval; `PUT /api/payroll/{batchId}/status` → approve/reject.                                                                                                                                                                                  |
| Input Taken From                         | `batchId` → Path Variable; `decision` + `remarks` → Request Body (JSON).                                                                                                                                                                                                                                |
| Response                                 | On success: `{ "message": "Batch Approved Successfully", "batchId": "B123", "status": "Approved", "remarks": "processed" }` (HTTP 200). On error: `{ "error": "Invalid passcode" }` (HTTP 401).                                                                                                         |
| Validation                               | Ensure `batchId` exists, `decision` ∈ {Approved, Rejected}, remarks optional (<= 500 chars), passcode match required.                                                                                                                                                                                   |
| Error Handling Scenario                  | Invalid passcode, batch already processed, DB connection fail, unauthorized user, invalid input JSON.                                                                                                                                                                                                   |
| Security Implications                    | Passcode should not be hardcoded (move to secure vault/auth service). Role-based access required (only approvers allowed). Input sanitization for remarks to avoid XSS/SQL injection.                                                                                                                   |
| React Component Calling                  | `ApprovePayroll` component calls backend API via service `setStatus` when user confirms decision.                                                                                                                                                                                                       |
| What Component Does With Server Response | Updates UI table → Removes batch from pending list → Shows success/error message → Allows download of summary if needed.                                                                                                                                                                                |
| Positive Scenarios                       | User enters correct passcode → Batch approved/rejected → Confirmation shown → DB updated.                                                                                                                                                                                                               |
| Negative Scenarios                       | Wrong passcode → Error message; Batch not found → 404; User not authorized → 403; DB error → 500.                                                                                                                                                                                                       |


