# Conversation Context: ROPS Innovation Tracking System

## Source Material
* **Reference File:** `user-roles.md`[cite: 1]

## System Overview
The system is an AI-assisted platform for tracking, evaluating, and testing healthcare and organizational innovations, integrated with a ROPS CMS and Biblioteka dataset[cite: 1].

## Defined User Roles
* **Regular User:** Searches for existing solutions by providing symptoms or issues[cite: 1]. An AI worker parses this into bullet points, checks for existing solutions, and provides personalized advice or notifies the user if no innovation exists[cite: 1].
* **Organization (e.g., Hospital Staff):** Submits patient symptom reports[cite: 1]. The AI worker processes these inputs into a formatted report matching the Biblioteka dataset structure, which is then routed to the ROPS CMS for review[cite: 1].
* **Admin (ROPS):** Reviews submitted requests on the CMS to determine financial and technical feasibility[cite: 1]. Feasible innovations are posted to a listing page[cite: 1]. Admins select the most appropriate researcher from applicants and manage ongoing collaboration and reports via the CMS[cite: 1].
* **Researcher (Tester):** Applies to test listed innovations by submitting their name, email, CV, and a testing plan[cite: 1]. Selected researchers run controlled, small-scale tests and simulations[cite: 1]. They conclude by submitting an After Action Report to the CMS detailing whether it works and suggesting optional improvements[cite: 1].

## Conversation State & Generated Assets
* **Task:** Converting the `user-roles.md` specifications into visual flow diagrams.
* **Outputs Generated:** 
  1. A unified system Mermaid diagram.
  2. A native draw.io XML file containing the unified architecture.
  3. Four isolated Mermaid flowcharts breaking down the exact step-by-step processes for each individual role.