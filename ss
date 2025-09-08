@Transactional
public ApprovalLog approveOrReject(Long batchId, String action, String remarks, String approvedBy) {
    PayrollBatch batch = payrollRepo.findById(batchId)
            .orElseThrow(() -> new RuntimeException("Batch not found"));

    // Normalize and set status
    String normalized = (action == null) ? "" : action.trim().toLowerCase();

    // ✅ Step 1: If trying to approve, check balance first
    if (normalized.equals("approved") || normalized.equals("approve") || normalized.equals("accept")) {
        // Calculate batch total
        BigDecimal batchTotal = BigDecimal.ZERO;
        if (batch.getPayments() != null) {
            for (var p : batch.getPayments()) {
                if (p.getAmount() != null) {
                    batchTotal = batchTotal.add(p.getAmount());
                }
            }
        }

        // Get account balance
        BigDecimal availableBalance = accountBalanceService.getAvailableBalance(batch.getDebitAccountId());

        // ✅ Reject if not enough balance
        if (availableBalance.compareTo(batchTotal) < 0) {
            normalized = "rejected";
            remarks = (remarks == null ? "" : remarks) + " [Auto-rejected: Insufficient balance]";
            log.warn("Batch {} auto-rejected due to insufficient balance. Required={}, Available={}", 
                     batchId, batchTotal, availableBalance);
        }
    }

    // ✅ Step 2: Save batch status
    batch.setStatus(normalized);
    batch.setUpdatedAt(LocalDateTime.now().toString());
    payrollRepo.save(batch);
    log.info("Batch {} status set to {}", batchId, normalized);

    // ✅ Step 3: Save approval log
    ApprovalLog logEntry = new ApprovalLog();
    logEntry.setBatchId(batchId);
    logEntry.setAction(normalized);
    logEntry.setRemarks(remarks);
    logEntry.setApprovedBy(approvedBy);
    logEntry.setApprovedAt(LocalDateTime.now());
    ApprovalLog savedlog = logRepo.save(logEntry);

    // ✅ Step 4: If approved, then proceed with transactions + balance impact
    if (normalized.equals("approved") || normalized.equals("approve") || normalized.equals("accept")) {
        log.info("Processing approval effects for batch {}", batchId);
        transactionService.generateFromBatch(batchId);
        try {
            accountBalanceService.applyBatchApprovalImpact(batchId);
            log.info("Account balance impact applied for batch {}", batchId);
        } catch (Exception ex) {
            log.error("Error applying balance impact for batch {}: {}", batchId, ex.getMessage(), ex);
            throw ex; // rollback
        }
    } else {
        log.info("Batch {} not approved, skipping transaction generation & balance update", batchId);
    }

    return savedlog;
}




















-------------------
@Transactional
public ApprovalLog approveOrReject(Long batchId, String action, String remarks, String approvedBy) {
    PayrollBatch batch = payrollRepo.findById(batchId)
            .orElseThrow(() -> new RuntimeException("Batch not found"));

    String normalized = action == null ? "" : action.trim();
    String lower = normalized.toLowerCase();
    boolean isApprove = lower.equals("approved") || lower.equals("approve") || lower.equals("accept");

    if (isApprove) {
        // ✅ Step 1: calculate batch total
        BigDecimal batchTotal = BigDecimal.ZERO;
        if (batch.getPayments() != null) {
            for (var p : batch.getPayments()) {
                try {
                    batchTotal = batchTotal.add(new BigDecimal(String.valueOf(p.getAmount()).trim()));
                } catch (Exception e) {
                    // skip invalid amounts
                }
            }
        }

        // ✅ Step 2: check available balance
        String debitAcc = batch.getInstruction().getDebitAccount();
        BigDecimal availableBalance = accountBalanceService.getAvailableBalance(debitAcc);

        if (availableBalance.compareTo(batchTotal) < 0) {
            // not enough funds → reject
            normalized = "rejected";
            remarks = (remarks == null ? "" : remarks) + " [Auto-rejected: Insufficient balance]";
            isApprove = false;
        }
    }

    // ✅ Update batch
    batch.setStatus(normalized);
    batch.setUpdatedAt(LocalDateTime.now().toString());
    payrollRepo.save(batch);

    // ✅ Save approval log
    ApprovalLog logEntry = new ApprovalLog();
    logEntry.setBatchId(batchId);
    logEntry.setAction(normalized);
    logEntry.setRemarks(remarks);
    logEntry.setApprovedBy(approvedBy);
    logEntry.setApprovedAt(LocalDateTime.now());
    ApprovalLog savedlog = logRepo.save(logEntry);

    // ✅ If truly approved, process effects
    if (isApprove) {
        transactionService.generateFromBatch(batchId);
        accountBalanceService.applyBatchApprovalImpact(batchId);
    }

    return savedlog;
}






@Transactional(readOnly = true)
public BigDecimal getAvailableBalance(String accountNumber) {
    return accRepo.findByAccountNumber(accountNumber)
            .map(AccountBalanceEntity::getBalance)
            .orElse(BigDecimal.ZERO);
}
