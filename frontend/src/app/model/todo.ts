/**
 * A task owned by the authenticated user.
 *
 * targetDate is a plain ISO date string (yyyy-MM-dd) so it maps directly onto
 * the <input type="date"> element and onto the LocalDate used by the backend.
 */
export interface Todo {
  id: number;
  description: string;
  done: boolean;
  targetDate: string;
}

/** Payload sent to the API when creating or updating a task. */
export interface TodoRequest {
  description: string;
  done: boolean;
  targetDate: string;
}
