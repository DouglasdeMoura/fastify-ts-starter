import { z } from 'zod'

/**
 * Standard error response schema for OpenAPI documentation.
 * All error responses follow this structure for consistency.
 */
export const ErrorResponseSchema = z.object({
  error: z.object({
    message: z.string().describe('Human-readable error message'),
    code: z
      .string()
      .describe('Machine-readable error code for programmatic handling'),
    statusCode: z.number().describe('HTTP status code'),
    details: z
      .record(z.string(), z.unknown())
      .optional()
      .describe('Additional error context'),
  }),
})

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
