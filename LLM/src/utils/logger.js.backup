// src/utils/logger.js

/**
 * Simple console logger with Winston-compatible API
 * @module logger
 */

const level = process.env.LOG_LEVEL || 'info';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLevel = levels[level] || levels.info;

function shouldLog(msgLevel) {
  return levels[msgLevel] <= currentLevel;
}

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `${timestamp} [${level}]: ${message}${metaStr}`;
}

export const logger = {
  info(message, meta) {
    if (shouldLog('info')) {
      console.log(formatMessage('info', message, meta));
    }
  },

  error(message, meta) {
    if (shouldLog('error')) {
      console.error(formatMessage('error', message, meta));
    }
  },

  warn(message, meta) {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, meta));
    }
  },

  debug(message, meta) {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, meta));
    }
  },

  level
};

export default logger;
