import { Injectable, LoggerService } from '@nestjs/common';

@Injectable()
export class CustomLogger implements LoggerService {

    /**
     * Logs a message. The message will be written to the console
     * prefixed with `[LOG]`.
     * @param message The message to log.
     */
    log(message: string) {
        console.log(`[LOG] ${message}`);
    }

    /**
     * Logs an error message. The message will be written to the console
     * prefixed with `[ERROR]` and will include the stack trace.
     * @param message The message to log.
     * @param trace The stack trace.
     */
    error(message: string, trace: string) {
        console.error(`[ERROR] ${message}`, trace);
    }

    /**
     * Logs a warning message. The message will be written to the console
     * prefixed with `[WARN]`.
     * @param message The message to log.
     */
    warn(message: string) {
        console.warn(`[WARN] ${message}`);
    }

    /**
     * Logs a debug message. The message will only be written to the console
     * if the `debug` log level is enabled.
     * @param message The message to log.
     */
    debug(message: string) {
        console.debug(`[DEBUG] ${message}`);
    }

    /**
     * Logs a verbose message. The message will only be written to the console
     * if the `verbose` log level is enabled.
     * @param message The message to log.
     */
    verbose(message: string) {
        console.log(`[VERBOSE] ${message}`);
    }
}
