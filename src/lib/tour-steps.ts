import { Step } from "react-joyride";

// Main application tour steps
export const mainTourSteps: Step[] = [
  {
    target: "header",
    content: "Welcome to Final Roofing CRM! This is the main navigation area where you can access all modules.",
    disableBeacon: true,
    placement: "bottom",
  },
  {
    target: 'a[href="/admin"]',
    content: "This is your Dashboard where you can see an overview of your business performance.",
    placement: "bottom",
  },
  {
    target: 'a[href="/admin/leads"]',
    content: "Manage your leads and track potential customers here.",
    placement: "bottom",
  },
  {
    target: 'a[href="/admin/customers"]',
    content: "View and manage your customer database in this section.",
    placement: "bottom",
  },
  {
    target: 'a[href="/admin/jobs"]',
    content: "Track all your jobs and projects in this module.",
    placement: "bottom",
  },
  {
    target: 'a[href="/admin/estimates"]',
    content: "Create and manage estimates for your customers and leads.",
    placement: "bottom",
  },
  {
    target: 'a[href="/admin/invoices"]',
    content: "Generate and track invoices for your completed jobs.",
    placement: "bottom",
  },
  {
    target: 'a[href="/admin/tasks"]',
    content: "Manage your team's tasks and track progress here.",
    placement: "bottom",
  },
];

// Leads page tour steps
export const leadsTourSteps: Step[] = [
  {
    target: ".leads-management-header",
    content: "This is the Leads Management area where you can track and convert potential customers.",
    disableBeacon: true,
  },
  {
    target: ".create-lead-button",
    content: "Click here to add a new lead to your system.",
  },
  {
    target: ".leads-stats-cards",
    content: "These cards show you key metrics about your leads pipeline.",
  },
  {
    target: ".leads-search-filter",
    content: "Use these filters to quickly find specific leads.",
  },
  {
    target: ".leads-grid",
    content: "All your leads are displayed here. Click on any lead card to see more options.",
  },
];

// Estimates page tour steps
export const estimatesTourSteps: Step[] = [
  {
    target: ".estimates-management-header",
    content: "Create and manage estimates for your customers here.",
    disableBeacon: true,
  },
  {
    target: ".create-estimate-button",
    content: "Click here to create a new estimate.",
  },
  {
    target: ".estimate-templates",
    content: "You can use templates to quickly create standardized estimates.",
  },
];

// Invoices page tour steps
export const invoicesTourSteps: Step[] = [
  {
    target: ".invoices-management-header",
    content: "Generate and track invoices for your completed jobs.",
    disableBeacon: true,
  },
  {
    target: ".create-invoice-button",
    content: "Click here to create a new invoice.",
  },
];

// Jobs page tour steps
export const jobsTourSteps: Step[] = [
  {
    target: ".jobs-management-header",
    content: "Manage all your projects and track their progress here.",
    disableBeacon: true,
  },
  {
    target: ".create-job-button",
    content: "Click here to create a new job.",
  },
  {
    target: ".job-kanban-board",
    content: "This board shows your jobs organized by their current status.",
  },
];

// Tasks page tour steps
export const tasksTourSteps: Step[] = [
  {
    target: ".tasks-management-header",
    content: "Assign and track tasks for your team members.",
    disableBeacon: true,
  },
  {
    target: ".create-task-button",
    content: "Click here to create a new task.",
  },
  {
    target: ".task-kanban-board",
    content: "This board shows tasks organized by their current status.",
  },
];
