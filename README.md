# Handl - Dynamic Form Handler API

## Project Name: `handl`

## Core Purpose

Handl is a NestJS API service designed to provide a flexible and dynamic solution for handling various form submissions. It allows you to define different form structures (schemas) without needing code changes for each new form type. Once a form schema is defined, Handl can store the submitted data in a database and send email notifications, making it ideal for contact forms, job applications, feedback forms, and more.

## Features

*   **Dynamic Form Definitions:** Define and manage form schemas using JSON Schema, eliminating the need for code changes when new forms are introduced.
*   **Secure Form Submissions:** Validate and sanitize incoming form data to prevent common web vulnerabilities like XSS.
*   **Email Notifications:** Automatically send email notifications upon successful form submissions.
*   **API Key Authentication:** Secure all API endpoints with robust API key-based authentication.
*   **Rate Limiting:** Protect against abuse and denial-of-service attacks with built-in rate limiting.
*   **Database Storage:** Persist submitted form data and definitions in a PostgreSQL database (TypeORM support).
*   **Comprehensive API:** RESTful endpoints for managing form definitions (create, read, update, delete) and form submissions (submit, retrieve, delete).
*   **Easy Testing:** Includes Insomnia and cURL examples for quick API testing.

## Key Technologies

*   **Framework:** NestJS (with TypeScript)
*   **Package Manager:** PNPM
*   **Configuration:** `@nestjs/config`
*   **Input Validation:** `class-validator`, `class-transformer`
*   **JSON Schema Validation:** `ajv`, `ajv-formats`
*   **Email Sending:** `nodemailer`
*   **Database ORM:** TypeORM (example with PostgreSQL `pg`)
*   **API Key Authentication:** `@nestjs/passport`, `passport-headerapikey`
*   **Input Sanitization:** `dompurify`, `jsdom`
*   **Rate Limiting:** `@nestjs/throttler`
*   **Security Headers:** `helmet`
*   **Session Management:** `express-session`, `connect-typeorm`
*   **Authentication Strategies:** `passport`, `passport-google-oauth20`
*   **Utilities:** `reflect-metadata`, `rxjs`, `uuid`

## Security Enhancements

The Handl API incorporates several security enhancements to protect against common web vulnerabilities:

*   **API Key Authentication:** All API endpoints are protected by an API key. Clients must provide a valid `X-API-KEY` header for authentication.
*   **Input Sanitization:** Incoming form data is sanitized using `isomorphic-dompurify` to prevent Cross-Site Scripting (XSS) attacks, especially in email content.
*   **Rate Limiting:** Global rate limiting is applied to prevent abuse and denial-of-service attacks, limiting requests to 10 per minute.
*   **Security Headers:** The `helmet` middleware is integrated to set various HTTP headers that enhance the application's security posture, such as `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`, and more.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

*   Node.js (LTS recommended)
*   PNPM: If not installed, run `npm install -g pnpm`
*   NestJS CLI: If not installed, run `pnpm add -g @nestjs/cli`
*   A running PostgreSQL database instance (or your preferred database). Ensure it's accessible from your application.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [your-repository-url]
    cd handl
    ```
    *(Note: If you're continuing from a fresh `nest new` project, you can skip the clone step.)*

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

### Environment Variables Configuration

Create a `.env` file in the project root by copying and renaming `.env.example`. Populate it with your specific configuration.

**Important:** Refer to `.env.example` for all available environment variables and their descriptions. Replace placeholder values with your actual credentials and database settings.

### Database Setup

This application uses TypeORM. In development, `synchronize: true` is enabled in `src/app.module.ts` to automatically create tables based on your entities (`FormEntry` and `FormDefinition`). For production environments, it is highly recommended to disable `synchronize` and use database migrations for schema management.

**Note on Migrations:** For production deployments, you should generate and run TypeORM migrations to manage your database schema. This ensures controlled schema evolution and prevents data loss. Refer to the TypeORM documentation for detailed migration instructions.

## Running the Application

```bash
# development mode (with watch)
pnpm run start:dev

# production mode
pnpm run start:prod
```
The application will typically run on `http://localhost:3000` (or the `PORT` specified in your `.env` file).

## API Endpoints

Handl provides two main sets of API endpoints: one for managing form definitions and another for managing form submissions.

### 1. Form Definition Management (`/form-definitions`)

This API allows you to define, retrieve, update, and delete JSON schemas for your dynamic forms.

*   **`POST /form-definitions`**
    *   **Purpose:** Create a new form definition.
    *   **Body (JSON Example - Contact Us):**
        ```json
        {
          "id": "contact-us",
          "description": "General contact form for inquiries.",
          "schema": {
            "type": "object",
            "properties": {
              "fullName": { "type": "string", "minLength": 2 },
              "emailAddress": { "type": "string", "format": "email" },
              "subject": { "type": "string", "enum": ["Inquiry", "Support", "Feedback"] },
              "messageContent": { "type": "string", "minLength": 10 },
              "marketingOptIn": { "type": "boolean" }
            },
            "required": ["fullName", "emailAddress", "subject", "messageContent"],
            "additionalProperties": false
          }
        }
        ```
    *   **Body (JSON Example - Job Application):**
        ```json
        {
          "id": "job-application",
          "description": "Application form for open positions.",
          "schema": {
            "type": "object",
            "properties": {
              "applicantName": { "type": "string", "minLength": 3 },
              "applicantEmail": { "type": "string", "format": "email" },
              "resumeUrl": { "type": "string", "format": "uri" },
              "coverLetter": { "type": "string" },
              "yearsExperience": { "type": "number", "minimum": 0 }
            },
            "required": ["applicantName", "applicantEmail", "resumeUrl"],
            "additionalProperties": false
          }
        }
        ```
    *   **Response:** `HTTP 201 Created` with the saved `FormDefinition` object.

*   **`GET /form-definitions`**
    *   **Purpose:** Retrieve all defined form schemas.
    *   **Response:** `HTTP 200 OK` with an array of `FormDefinition` objects.

*   **`GET /form-definitions/:name`**
    *   **Purpose:** Retrieve a single form definition by its unique name (ID).
    *   **Response:** `HTTP 200 OK` with the `FormDefinition` object, or `HTTP 404 Not Found` if the name does not exist.

*   **`PUT /form-definitions/:name`**
    *   **Purpose:** Update an existing form definition by its unique name (ID).
    *   **Body (JSON Example):** `Partial<CreateFormDefinitionDto>` (e.g., just update the `description` or `schema`).
    *   **Response:** `HTTP 200 OK` with the updated `FormDefinition` object, or `HTTP 404 Not Found`.

*   **`DELETE /form-definitions/:name`**
    *   **Purpose:** Delete a form definition by its unique name (ID).
    *   **Response:** `HTTP 204 No Content` on success, or `HTTP 404 Not Found`.

### 2. Form Submission Management (`/form-submissions`)

This API is used by your frontend applications to submit data for a defined form, and to manage submitted entries.

*   **`POST /form-submissions`**
    *   **Purpose:** Submit data for a specific form ID. The data will be validated against the schema defined for that `formId`.
    *   **Body (JSON Example - Contact Us):**
        ```json
        {
          "formId": "contact-us",
          "formData": {
            "fullName": "Alice Wonderland",
            "emailAddress": "alice@example.com",
            "subject": "Inquiry",
            "messageContent": "I have an important question about your services.",
            "marketingOptIn": true
          }
        }
        ```
    *   **Body (JSON Example - Job Application):**
        ```json
        {
          "formId": "job-application",
          "formData": {
            "applicantName": "Bob The Builder",
            "applicantEmail": "bob@example.com",
            "resumeUrl": "https://example.com/bob-resume.pdf",
            "coverLetter": "Please consider me for the position.",
            "yearsExperience": 5
          }
        }
        ```
    *   **Response:**
        *   `HTTP 200 OK` on successful submission (data saved, email sent).
        *   `HTTP 400 Bad Request` if `formId` is not found or `formData` does not conform to the schema, with detailed validation errors.
        *   `HTTP 500 Internal Server Error` if there's an issue saving to the database or sending email.

*   **`GET /form-submissions`**
    *   **Purpose:** Retrieve all submitted form entries.
    *   **Response:** `HTTP 200 OK` with an array of `FormEntry` objects.

*   **`GET /form-submissions/:id`**
    *   **Purpose:** Retrieve a single form entry by its numeric ID.
    *   **Response:** `HTTP 200 OK` with the `FormEntry` object, or `HTTP 404 Not Found` if the ID does not exist.

*   **`DELETE /form-submissions/:id`**
    *   **Purpose:** Delete a form entry by its numeric ID.
    *   **Response:** `HTTP 204 No Content` on success, or `HTTP 404 Not Found`.

## Testing with cURL

After starting the application (`pnpm run start:dev`), you can use the following cURL commands to test the API.

### 1. Form Definition Endpoints

**Create Contact Us Form:**
```bash
curl -X POST \
  http://localhost:3000/form-definitions \
  -H 'Content-Type: application/json' \
  -H 'X-API-KEY: YOUR_API_KEY' \
  -d '{
    "id": "contact-us",
    "description": "General contact form for inquiries.",
    "schema": {
      "type": "object",
      "properties": {
        "fullName": { "type": "string", "minLength": 2 },
        "emailAddress": { "type": "string", "format": "email" },
        "subject": { "type": "string", "enum": ["Inquiry", "Support", "Feedback"] },
        "messageContent": { "type": "string", "minLength": 10 },
        "marketingOptIn": { "type": "boolean" }
      },
      "required": ["fullName", "emailAddress", "subject", "messageContent"],
      "additionalProperties": false
    }
  }'
```

**Get All Form Definitions:**
```bash
curl -X GET \
  http://localhost:3000/form-definitions \
  -H 'X-API-KEY: YOUR_API_KEY'
```

**Get Form Definition by Name (e.g., 'contact-us'):**
```bash
curl -X GET \
  http://localhost:3000/form-definitions/contact-us \
  -H 'X-API-KEY: YOUR_API_KEY'
```

**Update Form Definition by Name (e.g., 'contact-us'):**
```bash
curl -X PUT \
  http://localhost:3000/form-definitions/contact-us \
  -H 'Content-Type: application/json' \
  -H 'X-API-KEY: YOUR_API_KEY' \
  -d '{
    "description": "Updated description for the contact form."
  }'
```

**Delete Form Definition by Name (e.g., 'contact-us'):**
```bash
curl -X DELETE \
  http://localhost:3000/form-definitions/contact-us \
  -H 'X-API-KEY: YOUR_API_KEY'
```

### 2. Form Submission Endpoints

**Submit "contact-us" form (Valid):**
```bash
curl -X POST \
  http://localhost:3000/form-submissions \
  -H 'Content-Type: application/json' \
  -H 'X-API-KEY: YOUR_API_KEY' \
  -d '{
    "formId": "contact-us",
    "formData": {
      "fullName": "Alice Wonderland",
      "emailAddress": "alice@example.com",
      "subject": "Inquiry",
      "messageContent": "I have an important question about your services.",
      "marketingOptIn": true
    }
  }'
```

**Get All Form Submissions:**
```bash
curl -X GET \
  http://localhost:3000/form-submissions \
  -H 'X-API-KEY: YOUR_API_KEY'
```

**Get Form Submission by ID (e.g., '1'):**
```bash
curl -X GET \
  http://localhost:3000/form-submissions/1 \
  -H 'X-API-KEY: YOUR_API_KEY'
```

**Delete Form Submission by ID (e.g., '1'):**
```bash
curl -X DELETE \
  http://localhost:3000/form-submissions/1 \
  -H 'X-API-KEY: YOUR_API_KEY'
```

## Testing with Insomnia

An Insomnia requests file (`insomnia-requests.json`) is provided at the project root. You can import this file into Insomnia to quickly set up and test all API endpoints.

1.  **Import:** In Insomnia, go to `File` > `Import` > `From File` and select `insomnia-requests.json`.
2.  **Environment:** Select the "Base Environment" from the environment dropdown. Update the `apiKey` variable with your actual API key. You can also set `formDefinitionName` and `formEntryId` for convenience.
3.  **Send Requests:** Navigate through the "Form Definitions" and "Form Submissions" folders and send requests.

## Contributing

We welcome contributions to Handl! If you'd like to contribute, please follow these steps:

1.  **Fork the repository.**
2.  **Create a new branch** for your feature or bug fix: `git checkout -b feature/your-feature-name` or `bugfix/your-bug-fix`.
3.  **Make your changes** and ensure they adhere to the project's coding standards.
4.  **Write tests** for your changes, if applicable.
5.  **Run tests** to ensure everything is working as expected: `pnpm test`.
6.  **Commit your changes** with a clear and concise commit message.
7.  **Push your branch** to your forked repository.
8.  **Open a Pull Request** to the `main` branch of the original repository, describing your changes in detail.

## Support

If you have any questions, issues, or suggestions, please feel free to:

*   **Open an issue** on the GitHub repository.
*   **Contact the maintainer** at [alphadevking@gmail.com](mailto:alphadevking@gmail.com).

## License

This project is [MIT licensed](LICENSE).

Copyright (c) 2025 Favour Orukpe (alphadevking)
