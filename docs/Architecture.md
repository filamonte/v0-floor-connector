FloorConnector Architecture
Platform Overview

FloorConnector is a multi-tenant SaaS platform for contractor operations, growth, and ecosystem expansion.

It consists of:

Marketing Site
Contractor App
Customer Portal
Platform Admin

All systems share a canonical data model.

Core Principles
1. Canonical Data Model

All data exists once and is reused across the entire system.

2. Project-Centered Operations

Projects are the operational root of all workflows.

3. Cross-Module Data Flow

All modules share and reuse the same data.

4. No Data Silos

No module owns its own version of data.

Canonical Entities
Organization
Membership
User/Profile

Customer
Project

Estimate
Estimate Line Item

Job

Invoice
Payment

Employee
Subcontractor/Vendor

Time Card

Document
Activity/Event
Message/Conversation

Contract
Template

Compliance Record
System Layers
Platform
billing
subscriptions
admin tools
Organization
users
roles
modules
settings
Operations
customers
projects
estimates
jobs
invoices
time
field execution
Growth
websites
SEO
lead capture
Ecosystem
marketplace
materials
vendors
Operational Flow
Customer
  → Project
      → Estimate
      → Contract
      → Job
      → Invoice
      → Payment
Financial System

Supports:

standard invoicing
AIA billing:
schedule of values
progress billing
retainage
People System

Includes:

employees
subcontractors/vendors
certifications
insurance
compliance
Time System

Includes:

punch in/out
time cards
job attribution
GPS tracking
future geofencing
Communication System

Supports:

internal communication
contractor ↔ customer
platform ↔ contractor
Customer Portal

Supports:

estimate requests
proposal review
contract signing
invoice review
payments
messaging
Template System

Shared across:

estimates
invoices
contracts

No duplication of template logic.