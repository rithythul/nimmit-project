/**
 * Structured logger for Nimmit platform
 * Replaces scattered console.log statements with consistent, tagged logging
 */

type LogMeta = Record<string, unknown>;

const formatMeta = (meta?: LogMeta): string => {
    if (!meta || Object.keys(meta).length === 0) return '';
    return ' ' + JSON.stringify(meta);
};

const timestamp = (): string => new Date().toISOString();

/**
 * Logger utility with consistent formatting and test-environment awareness
 */
export const logger = {
    /**
     * Info level - general operational messages
     */
    info: (tag: string, message: string, meta?: LogMeta): void => {
        if (process.env.NODE_ENV === 'test') return;
        console.log(`[${timestamp()}] [${tag}] ${message}${formatMeta(meta)}`);
    },

    /**
     * Debug level - detailed operational messages (disabled in production)
     */
    debug: (tag: string, message: string, meta?: LogMeta): void => {
        if (process.env.NODE_ENV !== 'development') return;
        console.log(`[${timestamp()}] [${tag}] DEBUG: ${message}${formatMeta(meta)}`);
    },

    /**
     * Warn level - warning messages
     */
    warn: (tag: string, message: string, meta?: LogMeta): void => {
        console.warn(`[${timestamp()}] [${tag}] WARN: ${message}${formatMeta(meta)}`);
    },

    /**
     * Error level - error messages (always logs)
     */
    error: (tag: string, message: string, meta?: LogMeta): void => {
        console.error(`[${timestamp()}] [${tag}] ERROR: ${message}${formatMeta(meta)}`);
    },
};

export default logger;
