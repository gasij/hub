using DocumentFormat.OpenXml;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using ithubsec.Models;
using System.Text;
using Microsoft.AspNetCore.Hosting;

namespace ithubsec.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly string _documentsPath;
        private readonly IWebHostEnvironment _environment;

        public DocumentService(IWebHostEnvironment environment)
        {
            _environment = environment;
            _documentsPath = Path.Combine(_environment.ContentRootPath, "wwwroot", "documents");
            
            // Создаем директорию для документов, если её нет
            if (!Directory.Exists(_documentsPath))
            {
                Directory.CreateDirectory(_documentsPath);
            }
        }

        private string GetDocumentTemplate(string documentType, User? user)
        {
            // Базовый шаблон заявления
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

            // Специализированные шаблоны для разных типов документов
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
            // Генерируем имя файла
            var fileName = $"{documentType}_{user.LastName}_{user.FirstName}_{ticket.Id}_{DateTime.UtcNow:yyyyMMddHHmmss}.docx";
            var filePath = Path.Combine(_documentsPath, fileName);

            // Создаем документ Word
            using (WordprocessingDocument wordDocument = WordprocessingDocument.Create(filePath, WordprocessingDocumentType.Document))
            {
                // Добавляем главную часть документа
                MainDocumentPart mainPart = wordDocument.AddMainDocumentPart();
                mainPart.Document = new DocumentFormat.OpenXml.Wordprocessing.Document();
                Body body = mainPart.Document.AppendChild(new Body());

                // Получаем шаблон для типа документа
                var template = GetDocumentTemplate(documentType, user);
                
                Console.WriteLine($"Шаблон до замены (первые 200 символов): {template.Substring(0, Math.Min(200, template.Length))}...");

                // Заполняем шаблон данными
                var fullName = GetFullName(user);
                Console.WriteLine($"Заменяем плейсхолдеры. FULL_NAME = {fullName}, TICKET_TITLE = {ticket.Title}");
                
                var content = template;
                
                // Выполняем замены последовательно
                content = content.Replace("{{FULL_NAME}}", fullName);
                content = content.Replace("{{FIRST_NAME}}", user.FirstName ?? "");
                content = content.Replace("{{LAST_NAME}}", user.LastName ?? "");
                content = content.Replace("{{PATRONYMIC}}", user.Patronymic ?? "");
                content = content.Replace("{{GROUP_NAME}}", user.GroupName ?? "");
                content = content.Replace("{{EMAIL}}", user.Email ?? "");
                content = content.Replace("{{TICKET_TITLE}}", ticket.Title ?? "");
                content = content.Replace("{{TICKET_DESCRIPTION}}", ticket.Description ?? "");
                content = content.Replace("{{TICKET_ID}}", ticket.Id.ToString());
                content = content.Replace("{{CREATED_DATE}}", ticket.CreatedAt.ToString("dd.MM.yyyy"));
                content = content.Replace("{{CREATED_TIME}}", ticket.CreatedAt.ToString("HH:mm"));
                content = content.Replace("{{CURRENT_DATE}}", DateTime.UtcNow.ToString("dd.MM.yyyy"));
                content = content.Replace("{{CURRENT_YEAR}}", DateTime.UtcNow.Year.ToString());
                
                // Проверяем, остались ли незамененные плейсхолдеры
                if (content.Contains("{{") || content.Contains("{FULL_NAME}") || content.Contains("{TICKET_TITLE}"))
                {
                    Console.WriteLine($"⚠️ ВНИМАНИЕ: В контенте остались незамененные плейсхолдеры!");
                    Console.WriteLine($"Контент (первые 500 символов): {content.Substring(0, Math.Min(500, content.Length))}");
                }
                else
                {
                    Console.WriteLine($"✅ Все плейсхолдеры успешно заменены");
                    Console.WriteLine($"Контент после замены (первые 200 символов): {content.Substring(0, Math.Min(200, content.Length))}...");
                }

                // Разбиваем контент на параграфы
                var paragraphs = content.Split(new[] { "\n", "\r\n" }, StringSplitOptions.RemoveEmptyEntries);
                
                foreach (var paragraphText in paragraphs)
                {
                    if (string.IsNullOrWhiteSpace(paragraphText))
                        continue;

                    var paragraph = new Paragraph();
                    var run = new Run();
                    var text = new Text(paragraphText);
                    run.Append(text);
                    paragraph.Append(run);
                    body.Append(paragraph);
                }
            }

            // Получаем размер файла
            var fileInfo = new FileInfo(filePath);
            var fileSize = fileInfo.Length;

            // Создаем запись в базе данных
            var document = new ithubsec.Models.Document
            {
                TicketId = ticket.Id,
                UserId = user.Id,
                DocumentType = documentType,
                FileName = fileName,
                FilePath = filePath,
                ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                FileSize = fileSize,
                CreatedAt = DateTime.UtcNow
            };

            return document;
        }

        private string GetFullName(User user)
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

