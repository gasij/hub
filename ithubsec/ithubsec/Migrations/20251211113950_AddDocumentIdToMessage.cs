using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ithubsec.Migrations
{
    /// <inheritdoc />
    public partial class AddDocumentIdToMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "DocumentId",
                table: "Messages",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Messages_DocumentId",
                table: "Messages",
                column: "DocumentId");

            migrationBuilder.AddForeignKey(
                name: "FK_Messages_Documents_DocumentId",
                table: "Messages",
                column: "DocumentId",
                principalTable: "Documents",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Messages_Documents_DocumentId",
                table: "Messages");

            migrationBuilder.DropIndex(
                name: "IX_Messages_DocumentId",
                table: "Messages");

            migrationBuilder.DropColumn(
                name: "DocumentId",
                table: "Messages");
        }
    }
}
