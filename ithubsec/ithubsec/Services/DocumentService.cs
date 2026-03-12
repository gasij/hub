using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using ithubsec.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace ithubsec.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly string _documentsPath;
        private readonly string _templatePath;
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;

        /// <summary>Типы документов, для которых используется .docx-шаблон из папки template.</summary>
        private static readonly Dictionary<string, string> TemplateFileNames = new(StringComparer.OrdinalIgnoreCase)
        {
            { "study_certificate", "Шаблон_справка_об_обучении.docx" },
            { "military", "Шаблон_справка_военкомат.docx" },
            { "enrollment", "Шаблон_справка_рекомендован_к_зачислению_.docx" }
        };

        public DocumentService(IWebHostEnvironment environment, IConfiguration configuration)
        {
            _environment = environment;
            _configuration = configuration;
            _documentsPath = Path.Combine(_environment.ContentRootPath, "wwwroot", "documents");
            _templatePath = Path.Combine(_environment.ContentRootPath, "..", "template");

            if (!Directory.Exists(_documentsPath))
            {
                Directory.CreateDirectory(_documentsPath);
            }

            // Лицензия QuestPDF: Community — бесплатно для open source
            QuestPDF.Settings.License = LicenseType.Community;
        }

        private static bool IsTemplateBasedType(string documentType) =>
            TemplateFileNames.ContainsKey(documentType ?? "");

        private string GetDocumentTemplate(string documentType, User? user)
        {
            var groupInfo = user != null && !string.IsNullOrWhiteSpace(user.GroupName)
                ? $", студент группы {user.GroupName}"
                : "";
            var baseTemplate = $@"
ЗАЯВЛЕНИЕ

Я, {{FULL_NAME}}{groupInfo},
прошу рассмотреть мою заявку.

Тема заявки: {{TICKET_TITLE}}

Описание:
{{TICKET_DESCRIPTION}}

Дата создания заявки: {{CREATED_DATE}} в {{CREATED_TIME}}

С уважением,
{{FULL_NAME}}
{{EMAIL}}

Дата: {{CURRENT_DATE}}
";

            return documentType.ToLower() switch
            {
                "application" => baseTemplate,
                "request" => $@"
ЗАПРОС

Я, {{FULL_NAME}}{groupInfo},
обращаюсь с запросом:

{{TICKET_TITLE}}

{{TICKET_DESCRIPTION}}

Номер заявки: {{TICKET_ID}}
Дата создания: {{CREATED_DATE}}

{{FULL_NAME}}
{{EMAIL}}
{{CURRENT_DATE}}
",
                "complaint" => $@"
ЖАЛОБА

Я, {{FULL_NAME}}{groupInfo},
подаю жалобу по следующему вопросу:

{{TICKET_TITLE}}

{{TICKET_DESCRIPTION}}

Дата: {{CREATED_DATE}}
Номер заявки: {{TICKET_ID}}

{{FULL_NAME}}
{{EMAIL}}
",
                "petition" => $@"
ХОДАТАЙСТВО

Я, {{FULL_NAME}}{groupInfo},
ходатайствую:

{{TICKET_TITLE}}

{{TICKET_DESCRIPTION}}

Дата подачи: {{CREATED_DATE}}
{{CURRENT_DATE}}

{{FULL_NAME}}
{{EMAIL}}
",
                _ => baseTemplate
            };
        }

        public async Task<ithubsec.Models.Document> GenerateDocumentAsync(Ticket ticket, User user, string documentType)
        {
            var fullName = GetFullName(user);
            var docConfig = _configuration.GetSection("Document");
            var now = DateTime.UtcNow;
            var replacements = new Dictionary<string, string>(StringComparer.Ordinal)
            {
                ["{{FULL_NAME}}"] = fullName,
                ["{{FIRST_NAME}}"] = user.FirstName ?? "",
                ["{{LAST_NAME}}"] = user.LastName ?? "",
                ["{{PATRONYMIC}}"] = user.Patronymic ?? "",
                ["{{GROUP_NAME}}"] = user.GroupName ?? "",
                ["{{EMAIL}}"] = user.Email ?? "",
                ["{{TICKET_TITLE}}"] = ticket.Title ?? "",
                ["{{TICKET_DESCRIPTION}}"] = ticket.Description ?? "",
                ["{{TICKET_ID}}"] = ticket.Id.ToString(),
                ["{{CREATED_DATE}}"] = ticket.CreatedAt.ToString("dd.MM.yyyy"),
                ["{{CREATED_TIME}}"] = ticket.CreatedAt.ToString("HH:mm"),
                ["{{CURRENT_DATE}}"] = now.ToString("dd.MM.yyyy"),
                ["{{CURRENT_YEAR}}"] = now.Year.ToString(),
                ["{{BIRTH_DATE}}"] = user.BirthDate.HasValue ? user.BirthDate.Value.ToString("dd.MM.yyyy") : "__________",
                ["{{COURSE}}"] = user.Course ?? docConfig["DefaultCourse"] ?? "_",
                ["{{DIRECTION}}"] = user.Direction ?? docConfig["DefaultDirection"] ?? "_________________",
                ["{{ACADEMY_NAME}}"] = docConfig["AcademyName"] ?? "Автономной некоммерческой организации профессионального образования «Международная Академия Информационных Технологий «ИТ ХАБ Тула»",
                ["{{STUDY_DURATION}}"] = docConfig["DefaultStudyDuration"] ?? "_ года 10 месяцев",
                ["{{ENROLLMENT_ORDER}}"] = "_____",
                ["{{ENROLLMENT_ORDER_DATE}}"] = "00.00.0000",
                ["{{STUDY_START_DATE}}"] = "00.00.0000",
                ["{{STUDY_END_DATE}}"] = "00.00.0000"
            };

            if (IsTemplateBasedType(documentType))
            {
                return await GenerateFromDocxTemplateAsync(ticket, user, documentType, replacements).ConfigureAwait(false);
            }

            var fileName = $"{documentType}_{user.LastName}_{user.FirstName}_{ticket.Id}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
            var filePath = Path.Combine(_documentsPath, fileName);

            var template = GetDocumentTemplate(documentType, user);
            var content = template;
            foreach (var (key, value) in replacements)
            {
                content = content.Replace(key, value);
            }

            var paragraphs = content.Split(new[] { "\n", "\r\n" }, StringSplitOptions.None);

            QuestPDF.Fluent.Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(11).FontFamily("Arial"));

                    page.Content().Column(column =>
                    {
                        foreach (var line in paragraphs)
                        {
                            var text = line.Trim();
                            if (string.IsNullOrEmpty(text))
                            {
                                column.Item().Height(8);
                            }
                            else
                            {
                                column.Item().Text(text);
                            }
                        }
                    });
                });
            }).GeneratePdf(filePath);

            var fileInfo = new FileInfo(filePath);
            return new ithubsec.Models.Document
            {
                TicketId = ticket.Id,
                UserId = user.Id,
                DocumentType = documentType,
                FileName = fileName,
                FilePath = filePath,
                ContentType = "application/pdf",
                FileSize = fileInfo.Length,
                CreatedAt = DateTime.UtcNow
            };
        }

        /// <summary>Генерирует документ из .docx-шаблона в папке template (подстановка плейсхолдеров {{...}}).</summary>
        private async Task<ithubsec.Models.Document> GenerateFromDocxTemplateAsync(Ticket ticket, User user, string documentType, Dictionary<string, string> replacements)
        {
            if (!TemplateFileNames.TryGetValue(documentType, out var templateFileName))
            {
                throw new ArgumentException($"Неизвестный тип шаблона: {documentType}", nameof(documentType));
            }

            var templatePath = Path.Combine(_templatePath, templateFileName);
            if (!File.Exists(templatePath))
            {
                throw new FileNotFoundException($"Шаблон не найден: {templatePath}");
            }

            var extension = Path.GetExtension(templateFileName);
            var fileName = $"{documentType}_{user.LastName}_{user.FirstName}_{ticket.Id}_{DateTime.UtcNow:yyyyMMddHHmmss}{extension}";
            var filePath = Path.Combine(_documentsPath, fileName);

            await Task.Run(() =>
            {
                File.Copy(templatePath, filePath, overwrite: true);
                using (var doc = WordprocessingDocument.Open(filePath, true))
                {
                    var mainPart = doc.MainDocumentPart;
                    if (mainPart?.Document?.Body != null)
                    {
                        ReplacePlaceholdersInBody(mainPart.Document.Body, replacements);
                        mainPart.Document.Save();
                    }

                    foreach (var headerPart in mainPart?.HeaderParts ?? Enumerable.Empty<HeaderPart>())
                    {
                        if (headerPart.Header != null)
                        {
                            ReplacePlaceholdersInElement(headerPart.Header, replacements);
                            headerPart.Header.Save();
                        }
                    }
                    foreach (var footerPart in mainPart?.FooterParts ?? Enumerable.Empty<FooterPart>())
                    {
                        if (footerPart.Footer != null)
                        {
                            ReplacePlaceholdersInElement(footerPart.Footer, replacements);
                            footerPart.Footer.Save();
                        }
                    }

                    // Запасная замена по XML (может не сработать при открытом пакете — не ломаем генерацию)
                    try
                    {
                        ReplacePlaceholdersInPartXml(mainPart, replacements);
                    }
                    catch
                    {
                        // Игнорируем: замена по параграфам уже выполнена
                    }
                }
            }).ConfigureAwait(false);

            var fileInfo = new FileInfo(filePath);
            return new ithubsec.Models.Document
            {
                TicketId = ticket.Id,
                UserId = user.Id,
                DocumentType = documentType,
                FileName = fileName,
                FilePath = filePath,
                ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                FileSize = fileInfo.Length,
                CreatedAt = DateTime.UtcNow
            };
        }

        /// <summary>Заменяет плейсхолдеры {{...}} в теле документа. Работает даже если Word разбил плейсхолдер на несколько runs. Обрабатывает и параграфы внутри таблиц.</summary>
        private static void ReplacePlaceholdersInBody(Body body, Dictionary<string, string> replacements)
        {
            ReplacePlaceholdersInElement(body, replacements);
        }

        private static void ReplacePlaceholdersInElement(DocumentFormat.OpenXml.OpenXmlElement element, Dictionary<string, string> replacements)
        {
            foreach (var paragraph in element.Descendants<Paragraph>())
            {
                ReplacePlaceholdersInParagraph(paragraph, replacements);
            }
        }

        private static void ReplacePlaceholdersInParagraph(Paragraph paragraph, Dictionary<string, string> replacements)
        {
            var textElements = paragraph.Descendants<Text>().ToList();
            if (textElements.Count == 0) return;

            var fullText = string.Concat(textElements.Select(t => t.Text ?? ""));
            var replaced = fullText;
            foreach (var (placeholder, value) in replacements)
            {
                replaced = replaced.Replace(placeholder, value);
            }
            if (replaced == fullText) return;

            textElements[0].Text = replaced;
            textElements[0].Space = DocumentFormat.OpenXml.SpaceProcessingModeValues.Preserve;
            for (var i = 1; i < textElements.Count; i++)
            {
                textElements[i].Text = "";
            }
        }

        /// <summary>Запасная замена по всему XML части (на случай нестандартной структуры или разбиения плейсхолдера на несколько элементов).</summary>
        private static void ReplacePlaceholdersInPartXml(OpenXmlPart part, Dictionary<string, string> replacements)
        {
            string xml;
            using (var stream = part.GetStream(FileMode.Open, FileAccess.Read))
            using (var reader = new StreamReader(stream, System.Text.Encoding.UTF8))
            {
                xml = reader.ReadToEnd();
            }

            var changed = false;
            foreach (var (placeholder, value) in replacements)
            {
                if (!xml.Contains(placeholder, StringComparison.Ordinal)) continue;
                xml = xml.Replace(placeholder, EscapeForXml(value));
                changed = true;
            }

            if (!changed) return;

            using (var stream = part.GetStream(FileMode.Create, FileAccess.Write))
            using (var writer = new StreamWriter(stream, System.Text.Encoding.UTF8))
            {
                writer.Write(xml);
            }
        }

        private static string EscapeForXml(string value)
        {
            if (string.IsNullOrEmpty(value)) return value;
            return value
                .Replace("&", "&amp;")
                .Replace("<", "&lt;")
                .Replace(">", "&gt;")
                .Replace("\"", "&quot;")
                .Replace("'", "&apos;");
        }

        private static string GetFullName(User user)
        {
            var parts = new List<string> { user.LastName, user.FirstName };
            if (!string.IsNullOrWhiteSpace(user.Patronymic))
            {
                parts.Add(user.Patronymic);
            }
            return string.Join(" ", parts);
        }
    }
}
