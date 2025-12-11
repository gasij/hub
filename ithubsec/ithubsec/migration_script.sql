START TRANSACTION;

ALTER TABLE "Messages" ADD "DocumentId" uuid;

CREATE INDEX "IX_Messages_DocumentId" ON "Messages" ("DocumentId");

ALTER TABLE "Messages" ADD CONSTRAINT "FK_Messages_Documents_DocumentId" FOREIGN KEY ("DocumentId") REFERENCES "Documents" ("Id") ON DELETE SET NULL;

INSERT INTO "__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20251211113950_AddDocumentIdToMessage', '8.0.0');

COMMIT;

