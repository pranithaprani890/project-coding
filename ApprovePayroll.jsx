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
