import { fetchAssignedGroup } from "./assignment.js";

/** Startuje fetch przydziału zanim załaduje się pełny graf `experiment.js`. */
if (typeof window !== "undefined") {
  window.__eksperymentAssignmentPromise = fetchAssignedGroup();
}
