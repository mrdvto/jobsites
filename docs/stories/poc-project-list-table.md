### **User Story: Project List Table POC**

**Description:**

As a Developer,
I want to build a Proof of Concept (POC) for the Project List table,
So that we can validate the underlying data structure and basic rendering of the application's main list view.

**Data Definitions:**
*   **List View Columns:**
    *   **Project Name:** The official or working name of the construction project.
    *   **Address:** The geographical location (City, State) of the jobsite.
    *   **Assignee:** The internal sales representatives responsible for this project.
    *   **Owner:** The primary corporate entity or developer funding the project.
    *   **Status:** The CRM-specific status of our engagement with the project (Active, Planning, On Hold, Completed).
    *   **Won Revenue:** Our total finalized deal size (closed/won opportunities) for this specific project.
    *   **Pipeline Revenue:** Our total potential deal size (open opportunities) for this specific project.
    *   **Valuation:** The total overall dollar value of the construction project itself (not just our piece).
    *   **Primary Stage:** The current physical or planning phase of the construction (e.g., Bidding, Construction).
    *   **Project Type:** The category of construction (e.g., Commercial, Medical, Infrastructure).
    *   **Ownership Type:** The funding source type (e.g., Private, Public Sector).
    *   **Bid Date:** The deadline for subcontractors to submit pricing.
    *   **Target Start/Completion:** Working timeline for when dirt moves to when the project wraps up.
    *   **External Reference:** IDs mapping back to external lead providers like Dodge Construction Network.

**Acceptance Criteria:**

Feature: 1. Project List Table POC

  Background:
    Given I am logged into the application
    And I navigate to the "Projects List" page

  Scenario: 1.1. Default Data Load
    Then I should see the "Projects List" header
    And I should see a table of projects with the following columns:
      | Project Name       |
      | Address            |
      | Assignee           |
      | Owner              |
      | Status             |
      | Won Revenue        |
      | Pipeline Revenue   |
      | Valuation          |
      | Primary Stage      |
      | Project Type       |
      | Ownership Type     |
      | Bid Date           |
      | Target Start       |
      | Target Completion  |
      | External Reference |
    And the table should display project data correctly in each column
