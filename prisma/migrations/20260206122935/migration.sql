-- CreateIndex
CREATE INDEX "Assessment_clientId_createdAt_idx" ON "Assessment"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "WorkspaceMember_userId_idx" ON "WorkspaceMember"("userId");
