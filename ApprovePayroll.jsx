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
























import React, { useState, useEffect } from "react";
import BackToDashboard from "../../common/components/BackToDashboard";
import { getAllBatches, setStatus, downloadText } from "../../common/storage/payrollStore";

export default function ApprovePayroll() {
  // State variables
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState("");
  const [action, setAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // pagination state

  const SECRET = "1234";
  const rowsPerPage = 10; // 10 rows per page

  useEffect(() => {
    const all = getAllBatches();
    setBatches(all.filter((b) => b.status === "Submitted"));
  }, []);

  const getTotal = (batch) =>
    batch.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openModal = (act) => {
    if (selected.length === 0) {
      setMessage("Please select at least one batch.");
      return;
    }
    setAction(act);
    setPasscode("");
    setRejectReason("");
    setMessage("");
    setShowModal(true);
  };

  const confirmAction = () => {
    if (passcode !== SECRET) {
      setMessage("Wrong passcode!");
      return;
    }

    if (action === "Rejected" && !rejectReason.trim()) {
      setMessage("Please enter a rejection reason.");
      return;
    }

    selected.forEach((id) => {
      const meta = {
        approvedBy: "Approver User",
        approvedAt: new Date().toISOString(),
        remarks: action === "Rejected" ? rejectReason : remarks[id] || "",
      };
      setStatus(id, action, meta);
    });

    const all = getAllBatches();
    setBatches(all.filter((b) => b.status === "Submitted"));

    setSelected([]);
    setMessage(`Batches ${action}!`);
    setShowModal(false);
  };

  const downloadBatch = (batch) => {
    const text = [
      `Payroll Batch — ${batch.id}`,
      `Status: ${batch.status}`,
      `Payments: ${batch.payments.length}`,
      `Total: ${getTotal(batch)} ${batch.instruction.paymentCurrency}`,
    ];
    downloadText(`Batch_${batch.id}.txt`, text.join("\n"));
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = batches.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(batches.length / rowsPerPage);

  return (
    <div className="container my-4">
      <h2>Approve Payroll</h2>
      <BackToDashboard />

      {message && <div className="alert alert-info mt-2">{message}</div>}

      {batches.length === 0 ? (
        <p>No payrolls waiting for approval.</p>
      ) : (
        <>
          <div className="mb-2 d-flex justify-content-end">
            <button
              className="btn btn-success me-2"
              onClick={() => openModal("Approved")}
            >
              Approve Selected
            </button>
            <button
              className="btn btn-danger"
              onClick={() => openModal("Rejected")}
            >
              Reject Selected
            </button>
          </div>

          {/* Scrollable Table with Sticky Header */}
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table className="table table-bordered text-center">
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#f8f9fa",
                  zIndex: 2,
                }}
              >
                <tr>
                  <th>Select</th>
                  <th>ID</th>
                  <th>Created</th>
                  <th>Payments</th>
                  <th>Total Amount</th>
                  <th>Remarks</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((b) => (
                  <tr
                    key={b.id}
                    className={selected.includes(b.id) ? "table-active" : ""}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(b.id)}
                        onChange={() => toggleSelect(b.id)}
                      />
                    </td>
                    <td>{b.id}</td>
                    <td>
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    <td>{b.payments.length}</td>
                    <td>
                      {getTotal(b)} {b.instruction.paymentCurrency}
                    </td>
                    <td>
                      <input
                        type="text"
                        value={remarks[b.id] || ""}
                        onChange={(e) =>
                          setRemarks({ ...remarks, [b.id]: e.target.value })
                        }
                        className="form-control form-control-sm"
                        placeholder="Remarks"
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => downloadBatch(b)}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="d-flex justify-content-center mt-3">
            <button
              className="btn btn-secondary me-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <span className="align-self-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary ms-2"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Popup Modal */}
      {showModal && (
        <div className="modal show d-block">
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Enter Passcode</h5>
              <input
                type="password"
                className="form-control my-2"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />

              {action === "Rejected" && (
                <>
                  <h6>Reason for Rejection</h6>
                  <textarea
                    className="form-control my-2"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </>
              )}

              {message && <p className="text-danger">{message}</p>}

              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={confirmAction}>
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




























  import React, { useState, useEffect } from "react";
import { getAllBatches, setStatus, downloadText } from "../../common/storage/payrollStore";

export default function ApprovePayroll() {
  // State variables
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState("");
  const [action, setAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // pagination state

  const SECRET = "1234";
  const rowsPerPage = 8; // ✅ Show only 6 rows per page

  useEffect(() => {
    const all = getAllBatches();
    setBatches(all.filter((b) => b.status === "Submitted"));
  }, []);

  const getTotal = (batch) =>
    batch.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openModal = (act) => {
    if (selected.length === 0) {
      setMessage("Please select at least one batch.");
      return;
    }
    setAction(act);
    setPasscode("");
    setRejectReason("");
    setMessage("");
    setShowModal(true);
  };

  const confirmAction = () => {
    if (passcode !== SECRET) {
      setMessage("Wrong passcode!");
      return;
    }

    if (action === "Rejected" && !rejectReason.trim()) {
      setMessage("Please enter a rejection reason.");
      return;
    }

    selected.forEach((id) => {
      const meta = {
        approvedBy: "Approver User",
        approvedAt: new Date().toISOString(),
        remarks: action === "Rejected" ? rejectReason : remarks[id] || "",
      };
      setStatus(id, action, meta);
    });

    const all = getAllBatches();
    setBatches(all.filter((b) => b.status === "Submitted"));

    setSelected([]);
    setMessage(`Batches ${action}!`);
    setShowModal(false);
  };

  const downloadBatch = (batch) => {
    const text = [
      `Payroll Batch — ${batch.id}`,
      `Status: ${batch.status}`,
      `Payments: ${batch.payments.length}`,
      `Total: ${getTotal(batch)} ${batch.instruction.paymentCurrency}`,
    ];
    downloadText(`Batch_${batch.id}.txt`, text.join("\n"));
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = batches.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(batches.length / rowsPerPage);

  return (
    <div className="container my-4">
      {/* Heading + Back button on same line */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Approve Payroll</h2>
        <button
          className="btn btn-primary"
          onClick={() => (window.location.href = "/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {batches.length === 0 ? (
        <p>No payrolls waiting for approval.</p>
      ) : (
        <>
          {/* Approve/Reject buttons */}
          <div className="mb-2 d-flex justify-content-end">
            <button
              className="btn btn-success me-2"
              onClick={() => openModal("Approved")}
            >
              Approve Selected
            </button>
            <button
              className="btn btn-danger"
              onClick={() => openModal("Rejected")}
            >
              Reject Selected
            </button>
          </div>

          {/* ✅ Normal Table (no scrolling) */}
          <table className="table table-bordered text-center mb-0">
            <thead style={{ backgroundColor: "#f8f9fa" }}>
              <tr>
                <th>Select</th>
                <th>ID</th>
                <th>Created</th>
                <th>Payments</th>
                <th>Total Amount</th>
                <th>Remarks</th>
                <th>Download</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.map((b) => (
                <tr
                  key={b.id}
                  className={selected.includes(b.id) ? "table-active" : ""}
                >
                  <td>
                    <input
                      type="checkbox"
                      checked={selected.includes(b.id)}
                      onChange={() => toggleSelect(b.id)}
                    />
                  </td>
                  <td>{b.id}</td>
                  <td>
                    {b.createdAt ? new Date(b.createdAt).toLocaleString() : "-"}
                  </td>
                  <td>{b.payments.length}</td>
                  <td>
                    {getTotal(b)} {b.instruction.paymentCurrency}
                  </td>
                  <td>
                    <input
                      type="text"
                      value={remarks[b.id] || ""}
                      onChange={(e) =>
                        setRemarks({ ...remarks, [b.id]: e.target.value })
                      }
                      className="form-control form-control-sm"
                      placeholder="Remarks"
                    />
                  </td>
                  <td>
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => downloadBatch(b)}
                    >
                      Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="d-flex justify-content-center mt-3">
            <button
              className="btn btn-secondary me-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <span className="align-self-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary ms-2"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Popup Modal */}
      {showModal && (
        <div className="modal show d-block">
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Enter Passcode</h5>
              <input
                type="password"
                className="form-control my-2"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />

              {action === "Rejected" && (
                <>
                  <h6>Reason for Rejection</h6>
                  <textarea
                    className="form-control my-2"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </>
              )}

              {message && <p className="text-danger">{message}</p>}

              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={confirmAction}>
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
-------------------------------------------------------------
























1. Extend PayrollBatch
// backend/src/main/java/com/example/payroll/model/PayrollBatch.java
package com.example.payroll.model;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "payroll_batches")
public class PayrollBatch {

    @Id
    private Long id;

    @Embedded
    private Instruction instruction;

    @ElementCollection
    @CollectionTable(name = "payments", joinColumns = @JoinColumn(name = "batch_id"))
    private List<Payment> payments;

    private String status;
    private String createdAt;
    private String updatedAt;

    // --- Approval Fields ---
    private String approvedBy;
    private String approvedAt;
    private String remarks;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Instruction getInstruction() { return instruction; }
    public void setInstruction(Instruction instruction) { this.instruction = instruction; }

    public List<Payment> getPayments() { return payments; }
    public void setPayments(List<Payment> payments) { this.payments = payments; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getApprovedAt() { return approvedAt; }
    public void setApprovedAt(String approvedAt) { this.approvedAt = approvedAt; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }
}

2. ApprovalLog Model
// backend/src/main/java/com/example/approval/model/ApprovalLog.java
package com.example.approval.model;

import jakarta.persistence.*;

@Entity
@Table(name = "approval_logs")
public class ApprovalLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long batchId;
    private String action;      // Approved / Rejected
    private String remarks;
    private String approvedBy;
    private String approvedAt;

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getApprovedAt() { return approvedAt; }
    public void setApprovedAt(String approvedAt) { this.approvedAt = approvedAt; }
}

3. ApprovalLogRepository
// backend/src/main/java/com/example/approval/repo/ApprovalLogRepository.java
package com.example.approval.repo;

import com.example.approval.model.ApprovalLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApprovalLogRepository extends JpaRepository<ApprovalLog, Long> {
    List<ApprovalLog> findByBatchId(Long batchId);
}

4. ApprovalService
// backend/src/main/java/com/example/approval/service/ApprovalService.java
package com.example.approval.service;

import com.example.approval.model.ApprovalLog;
import com.example.approval.repo.ApprovalLogRepository;
import com.example.payroll.model.PayrollBatch;
import com.example.payroll.repository.PayrollBatchRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class ApprovalService {
    private final PayrollBatchRepository payrollRepo;
    private final ApprovalLogRepository logRepo;

    public ApprovalService(PayrollBatchRepository payrollRepo, ApprovalLogRepository logRepo) {
        this.payrollRepo = payrollRepo;
        this.logRepo = logRepo;
    }

    public PayrollBatch approveOrReject(Long batchId, String action, String remarks, String approver) {
        PayrollBatch batch = payrollRepo.findById(batchId).orElseThrow();

        batch.setStatus(action);
        batch.setApprovedBy(approver);
        batch.setApprovedAt(Instant.now().toString());
        batch.setRemarks(remarks);
        payrollRepo.save(batch);

        ApprovalLog log = new ApprovalLog();
        log.setBatchId(batchId);
        log.setAction(action);
        log.setRemarks(remarks);
        log.setApprovedBy(approver);
        log.setApprovedAt(Instant.now().toString());
        logRepo.save(log);

        return batch;
    }

    public List<ApprovalLog> getLogsForBatch(Long batchId) {
        return logRepo.findByBatchId(batchId);
    }
}

5. ApprovalController
// backend/src/main/java/com/example/approval/controller/ApprovalController.java
package com.example.approval.controller;

import com.example.approval.model.ApprovalLog;
import com.example.approval.service.ApprovalService;
import com.example.payroll.model.PayrollBatch;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/approval")
@CrossOrigin(origins = "http://localhost:3000")
public class ApprovalController {
    private final ApprovalService service;

    public ApprovalController(ApprovalService service) {
        this.service = service;
    }

    @PostMapping("/{id}")
    public PayrollBatch approveOrReject(
            @PathVariable Long id,
            @RequestBody Map<String, String> request
    ) {
        String action = request.get("action");     // "Approved" / "Rejected"
        String remarks = request.get("remarks");
        String approver = request.getOrDefault("approver", "Approver User");

        return service.approveOrReject(id, action, remarks, approver);
    }

    @GetMapping("/{id}/logs")
    public List<ApprovalLog> getLogs(@PathVariable Long id) {
        return service.getLogsForBatch(id);
    }
}

🔹 Frontend (React)

Save this as src/pages/ApprovalPage.jsx (or replace your current ApprovePayroll.jsx).

import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ApprovalPage() {
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState("");
  const [action, setAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const SECRET = "1234";
  const rowsPerPage = 10;

  useEffect(() => {
    fetchBatches();
  }, []);

  const fetchBatches = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/payroll/batch");
      setBatches(res.data.filter((b) => b.status === "Submitted"));
    } catch (err) {
      console.error(err);
    }
  };

  const getTotal = (batch) =>
    batch.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openModal = (act) => {
    if (selected.length === 0) {
      setMessage("Please select at least one batch.");
      return;
    }
    setAction(act);
    setPasscode("");
    setRejectReason("");
    setMessage("");
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (passcode !== SECRET) {
      setMessage("Wrong passcode!");
      return;
    }

    if (action === "Rejected" && !rejectReason.trim()) {
      setMessage("Please enter a rejection reason.");
      return;
    }

    try {
      for (const id of selected) {
        await axios.post(`http://localhost:8080/api/approval/${id}`, {
          action,
          remarks: action === "Rejected" ? rejectReason : remarks[id] || "",
          approver: "Approver User",
        });
      }
      await fetchBatches();
      setSelected([]);
      setMessage(`Batches ${action}!`);
      setShowModal(false);
    } catch (err) {
      console.error(err);
      setMessage("Error while updating batches.");
    }
  };

  const downloadBatch = (batch) => {
    const text = [
      `Payroll Batch — ${batch.id}`,
      `Status: ${batch.status}`,
      `Payments: ${batch.payments.length}`,
      `Total: ${getTotal(batch)} ${batch.instruction.paymentCurrency}`,
    ];
    const blob = new Blob([text.join("\n")], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Batch_${batch.id}.txt`;
    link.click();
  };

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = batches.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(batches.length / rowsPerPage);

  return (
    <div className="container my-4">
      {/* Heading + Back button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Approve Payroll</h2>
        <button
          className="btn btn-primary"
          onClick={() => (window.location.href = "/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {batches.length === 0 ? (
        <p>No payrolls waiting for approval.</p>
      ) : (
        <>
          <div className="mb-2 d-flex justify-content-end">
            <button
              className="btn btn-success me-2"
              onClick={() => openModal("Approved")}
            >
              Approve Selected
            </button>
            <button
              className="btn btn-danger"
              onClick={() => openModal("Rejected")}
            >
              Reject Selected
            </button>
          </div>

          {/* Table */}
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table className="table table-bordered text-center mb-0">
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#f8f9fa",
                  zIndex: 2,
                }}
              >
                <tr>
                  <th>Select</th>
                  <th>ID</th>
                  <th>Created</th>
                  <th>Payments</th>
                  <th>Total Amount</th>
                  <th>Remarks</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((b) => (
                  <tr
                    key={b.id}
                    className={selected.includes(b.id) ? "table-active" : ""}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(b.id)}
                        onChange={() => toggleSelect(b.id)}
                      />
                    </td>
                    <td>{b.id}</td>
                    <td>
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    <td>{b.payments.length}</td>
                    <td>
                      {getTotal(b)} {b.instruction.paymentCurrency}
                    </td>
                    <td>
                      <input
                        type="text"
                        value={remarks[b.id] || ""}
                        onChange={(e) =>
                          setRemarks({ ...remarks, [b.id]: e.target.value })
                        }
                        className="form-control form-control-sm"
                        placeholder="Remarks"
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => downloadBatch(b)}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-3">
            <button
              className="btn btn-secondary me-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <span className="align-self-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary ms-2"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block">
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Enter Passcode</h5>
              <input
                type="password"
                className="form-control my-2"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />

              {action === "Rejected" && (
                <>
                  <h6>Reason for Rejection</h6>
                  <textarea
                    className="form-control my-2"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </>
              )}

              {message && <p className="text-danger">{message}</p>}

              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={confirmAction}>
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
=------------------------
package com.example.approval.model;

import jakarta.persistence.*;

@Entity
@Table(name = "approval_logs")
public class ApprovalLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long batchId;
    private String action;       // Approved / Rejected
    private String remarks;
    private String approvedBy;
    private String approvedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getBatchId() { return batchId; }
    public void setBatchId(Long batchId) { this.batchId = batchId; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public String getApprovedBy() { return approvedBy; }
    public void setApprovedBy(String approvedBy) { this.approvedBy = approvedBy; }

    public String getApprovedAt() { return approvedAt; }
    public void setApprovedAt(String approvedAt) { this.approvedAt = approvedAt; }
}
approval/repo/ApprovalLogRepository.java
java
Copy code
package com.example.approval.repo;

import com.example.approval.model.ApprovalLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ApprovalLogRepository extends JpaRepository<ApprovalLog, Long> {
    List<ApprovalLog> findByBatchId(Long batchId);
}
approval/service/ApprovalService.java
java
Copy code
package com.example.approval.service;

import com.example.approval.model.ApprovalLog;
import com.example.approval.repo.ApprovalLogRepository;
import com.example.payroll.model.PayrollBatch;
import com.example.payroll.repository.PayrollBatchRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ApprovalService {

    private final ApprovalLogRepository approvalRepo;
    private final PayrollBatchRepository batchRepo;

    public ApprovalService(ApprovalLogRepository approvalRepo, PayrollBatchRepository batchRepo) {
        this.approvalRepo = approvalRepo;
        this.batchRepo = batchRepo;
    }

    public PayrollBatch approveOrReject(Long batchId, String action, String remarks, String approvedBy, String approvedAt) {
        PayrollBatch batch = batchRepo.findById(batchId)
                .orElseThrow(() -> new RuntimeException("Batch not found"));

        // Update batch status
        batch.setStatus(action);
        batch.setUpdatedAt(approvedAt);
        batchRepo.save(batch);

        // Log approval action
        ApprovalLog log = new ApprovalLog();
        log.setBatchId(batchId);
        log.setAction(action);
        log.setRemarks(remarks);
        log.setApprovedBy(approvedBy);
        log.setApprovedAt(approvedAt);
        approvalRepo.save(log);

        return batch;
    }

    public List<ApprovalLog> getLogsForBatch(Long batchId) {
        return approvalRepo.findByBatchId(batchId);
    }
}
approval/controller/ApprovalController.java
java
Copy code
package com.example.approval.controller;

import com.example.approval.model.ApprovalLog;
import com.example.approval.service.ApprovalService;
import com.example.payroll.model.PayrollBatch;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/approval")
@CrossOrigin(origins = "http://localhost:3000")
public class ApprovalController {

    private final ApprovalService service;

    public ApprovalController(ApprovalService service) {
        this.service = service;
    }

    @PostMapping("/batch/{id}/action")
    public PayrollBatch approveOrReject(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String action = body.get("action"); // Approved / Rejected
        String remarks = body.getOrDefault("remarks", "");
        String approvedBy = body.getOrDefault("approvedBy", "Approver");
        String approvedAt = body.getOrDefault("approvedAt", String.valueOf(System.currentTimeMillis()));

        return service.approveOrReject(id, action, remarks, approvedBy, approvedAt);
    }

    @GetMapping("/batch/{id}/logs")
    public List<ApprovalLog> getLogs(@PathVariable Long id) {
        return service.getLogsForBatch(id);
    }
}









      import React, { useState, useEffect } from "react";
import axios from "axios";

export default function ApprovePayroll() {
  // State variables
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState("");
  const [currentBatchId, setCurrentBatchId] = useState(null);

  const BASE_URL = "http://localhost:8080/api";

  // Fetch only submitted batches
  const fetchBatches = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/manage-payroll/batch`);
      setBatches(res.data.filter((b) => b.status === "Submitted"));
    } catch (err) {
      console.error("Error fetching batches", err);
    }
  };

  useEffect(() => {
    fetchBatches();
  }, []);

  // Handle checkbox selection
  const handleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Handle remarks input
  const handleRemarkChange = (id, value) => {
    setRemarks((prev) => ({ ...prev, [id]: value }));
  };

  // Open modal before confirm
  const openModal = (batchId, act) => {
    setCurrentBatchId(batchId);
    setAction(act);
    setShowModal(true);
  };

  // Confirm approve/reject
  const confirmAction = async () => {
    try {
      await axios.post(`${BASE_URL}/approval/batch/${currentBatchId}/action`, {
        action,
        remarks: remarks[currentBatchId] || "",
        approvedBy: "Approver User",
        approvedAt: new Date().toISOString(),
      });
      setShowModal(false);
      fetchBatches();
    } catch (err) {
      console.error("Error updating status", err);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Approve Payroll</h2>

      <table className="w-full border border-gray-300 rounded-lg">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">Select</th>
            <th className="p-2">Batch ID</th>
            <th className="p-2">Batch Name</th>
            <th className="p-2">Status</th>
            <th className="p-2">Remarks</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {batches.slice(0, 6).map((batch) => (
            <tr key={batch.id} className="border-t">
              <td className="p-2 text-center">
                <input
                  type="checkbox"
                  checked={selected.includes(batch.id)}
                  onChange={() => handleSelect(batch.id)}
                />
              </td>
              <td className="p-2">{batch.id}</td>
              <td className="p-2">{batch.name}</td>
              <td className="p-2">{batch.status}</td>
              <td className="p-2">
                <input
                  type="text"
                  value={remarks[batch.id] || ""}
                  onChange={(e) =>
                    handleRemarkChange(batch.id, e.target.value)
                  }
                  className="border rounded p-1 w-full"
                  placeholder="Enter remarks"
                />
              </td>
              <td className="p-2">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded mr-2"
                  onClick={() => openModal(batch.id, "Approved")}
                >
                  Approve
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded"
                  onClick={() => openModal(batch.id, "Rejected")}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Confirm Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-semibold mb-4">
              Confirm {action} for Batch {currentBatchId}?
            </h3>
            <div className="flex justify-end">
              <button
                className="px-4 py-2 mr-2 rounded bg-gray-300"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className={`px-4 py-2 rounded ${
                  action === "Approved" ? "bg-green-500 text-white" : "bg-red-500 text-white"
                }`}
                onClick={confirmAction}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


----------------
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const BASE_MANAGE_URL = "http://localhost:8080/api/manage-payroll";
const BASE_APPROVAL_URL = "http://localhost:8080/api/approval";

export default function ApprovePayroll() {
  const [batches, setBatches] = useState([]);
  const [selected, setSelected] = useState([]);
  const [remarks, setRemarks] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [passcode, setPasscode] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [message, setMessage] = useState("");
  const [action, setAction] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const SECRET = "1234";
  const rowsPerPage = 10;

  // Load only Submitted batches
  const refresh = async () => {
    try {
      const res = await axios.get(`${BASE_MANAGE_URL}/batch`);
      setBatches(res.data.filter((b) => b.status === "Submitted"));
    } catch (err) {
      console.error("Error fetching batches:", err);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const getTotal = (batch) =>
    batch.payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const openModal = (act) => {
    if (selected.length === 0) {
      setMessage("Please select at least one batch.");
      return;
    }
    setAction(act);
    setPasscode("");
    setRejectReason("");
    setMessage("");
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (passcode !== SECRET) {
      setMessage("Wrong passcode!");
      return;
    }

    if (action === "Rejected" && !rejectReason.trim()) {
      setMessage("Please enter a rejection reason.");
      return;
    }

    try {
      for (const id of selected) {
        await axios.post(`${BASE_APPROVAL_URL}/batch/${id}/action`, {
          action,
          remarks: action === "Rejected" ? rejectReason : remarks[id] || "",
          approvedBy: "Approver User",
          approvedAt: new Date().toISOString(),
        });
      }
      setMessage(`Batches ${action}!`);
      setShowModal(false);
      setSelected([]);
      refresh();
    } catch (err) {
      console.error("Error approving/rejecting batches:", err);
      setMessage("Error processing action.");
    }
  };

  const downloadBatch = (batch) => {
    const text = [
      `Payroll Batch — ${batch.id}`,
      `Status: ${batch.status}`,
      `Payments: ${batch.payments.length}`,
      `Total: ${getTotal(batch)} ${batch.instruction.paymentCurrency}`,
    ];
    const blob = new Blob([text.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Batch_${batch.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Pagination logic
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = batches.slice(indexOfFirstRow, indexOfLastRow);
  const totalPages = Math.ceil(batches.length / rowsPerPage);

  return (
    <div className="container my-4">
      {/* Heading + Back button */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2 className="mb-0">Approve Payroll</h2>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>

      {message && <div className="alert alert-info">{message}</div>}

      {batches.length === 0 ? (
        <p>No payrolls waiting for approval.</p>
      ) : (
        <>
          {/* Approve/Reject buttons */}
          <div className="mb-2 d-flex justify-content-end">
            <button
              className="btn btn-success me-2"
              onClick={() => openModal("Approved")}
            >
              Approve Selected
            </button>
            <button
              className="btn btn-danger"
              onClick={() => openModal("Rejected")}
            >
              Reject Selected
            </button>
          </div>

          {/* Scrollable Table */}
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <table className="table table-bordered text-center mb-0">
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "#f8f9fa",
                  zIndex: 2,
                }}
              >
                <tr>
                  <th>Select</th>
                  <th>ID</th>
                  <th>Created</th>
                  <th>Payments</th>
                  <th>Total Amount</th>
                  <th>Remarks</th>
                  <th>Download</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.map((b) => (
                  <tr
                    key={b.id}
                    className={selected.includes(b.id) ? "table-active" : ""}
                  >
                    <td>
                      <input
                        type="checkbox"
                        checked={selected.includes(b.id)}
                        onChange={() => toggleSelect(b.id)}
                      />
                    </td>
                    <td>{b.id}</td>
                    <td>
                      {b.createdAt
                        ? new Date(b.createdAt).toLocaleString()
                        : "-"}
                    </td>
                    <td>{b.payments.length}</td>
                    <td>
                      {getTotal(b)} {b.instruction.paymentCurrency}
                    </td>
                    <td>
                      <input
                        type="text"
                        value={remarks[b.id] || ""}
                        onChange={(e) =>
                          setRemarks({ ...remarks, [b.id]: e.target.value })
                        }
                        className="form-control form-control-sm"
                        placeholder="Remarks"
                      />
                    </td>
                    <td>
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() => downloadBatch(b)}
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-center mt-3">
            <button
              className="btn btn-secondary me-2"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <span className="align-self-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="btn btn-secondary ms-2"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal show d-block">
          <div className="modal-dialog">
            <div className="modal-content p-3">
              <h5>Enter Passcode</h5>
              <input
                type="password"
                className="form-control my-2"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
              />

              {action === "Rejected" && (
                <>
                  <h6>Reason for Rejection</h6>
                  <textarea
                    className="form-control my-2"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                </>
              )}

              {message && <p className="text-danger">{message}</p>}

              <div className="d-flex justify-content-end">
                <button
                  className="btn btn-secondary me-2"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={confirmAction}>
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
