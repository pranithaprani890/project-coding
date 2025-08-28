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
