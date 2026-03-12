using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ithubsec.Migrations
{
    /// <inheritdoc />
    public partial class AddUserSpravkaFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "BirthDate",
                table: "Users",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Course",
                table: "Users",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Direction",
                table: "Users",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "BirthDate", table: "Users");
            migrationBuilder.DropColumn(name: "Course", table: "Users");
            migrationBuilder.DropColumn(name: "Direction", table: "Users");
        }
    }
}
