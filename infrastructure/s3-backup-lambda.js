/**
 * AWS Lambda Function for Scheduled S3 Backups
 * Triggered by EventBridge on schedule: Daily at 2 AM UTC
 *
 * Features:
 * - Backs up scarmonit-docs bucket to scarmonit-docs-backup
 * - Maintains versioned backups with timestamps
 * - Sends SNS notification on completion/failure
 * - Automatically creates backup bucket if doesn't exist
 */

import { S3Client, ListObjectsV2Command, CopyObjectCommand, CreateBucketCommand, HeadBucketCommand, PutBucketVersioningCommand } from '@aws-sdk/client-s3';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';

const s3Client = new S3Client({ region: 'us-east-1' });
const snsClient = new SNSClient({ region: 'us-east-1' });

const SOURCE_BUCKET = 'scarmonit-docs';
const BACKUP_BUCKET = 'scarmonit-docs-backup';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN; // Set via environment variable

/**
 * Lambda handler
 */
export const handler = async (event) => {
  console.log('[S3 Backup] Starting scheduled backup job');
  console.log('[S3 Backup] Event:', JSON.stringify(event, null, 2));

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPrefix = `backups/${timestamp}/`;

  try {
    // Ensure backup bucket exists
    await ensureBackupBucket();

    // List all objects in source bucket
    const objects = await listAllObjects(SOURCE_BUCKET);
    console.log(`[S3 Backup] Found ${objects.length} objects to backup`);

    if (objects.length === 0) {
      const message = 'No objects found in source bucket - backup completed with 0 files';
      console.log(`[S3 Backup] ${message}`);
      await sendNotification('S3 Backup Completed', message, 'success');
      return { statusCode: 200, body: message };
    }

    // Copy all objects to backup bucket with timestamp prefix
    const copyResults = await Promise.allSettled(
      objects.map(obj => copyObject(SOURCE_BUCKET, obj.Key, BACKUP_BUCKET, `${backupPrefix}${obj.Key}`))
    );

    const successful = copyResults.filter(r => r.status === 'fulfilled').length;
    const failed = copyResults.filter(r => r.status === 'rejected').length;

    const message = `Backup completed: ${successful}/${objects.length} objects backed up successfully${failed > 0 ? `, ${failed} failed` : ''}`;
    console.log(`[S3 Backup] ${message}`);

    // Send notification
    await sendNotification(
      'S3 Backup Completed',
      `${message}\n\nBackup location: s3://${BACKUP_BUCKET}/${backupPrefix}\nTimestamp: ${timestamp}`,
      failed > 0 ? 'warning' : 'success'
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message,
        timestamp,
        backupLocation: `s3://${BACKUP_BUCKET}/${backupPrefix}`,
        stats: {
          total: objects.length,
          successful,
          failed
        }
      })
    };

  } catch (error) {
    console.error('[S3 Backup] Backup failed:', error);

    await sendNotification(
      'S3 Backup Failed',
      `Backup job failed with error: ${error.message}\n\nTimestamp: ${timestamp}\n\nStack: ${error.stack}`,
      'error'
    );

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: error.message,
        timestamp
      })
    };
  }
};

/**
 * Ensure backup bucket exists and has versioning enabled
 */
async function ensureBackupBucket() {
  try {
    // Check if bucket exists
    await s3Client.send(new HeadBucketCommand({ Bucket: BACKUP_BUCKET }));
    console.log(`[S3 Backup] Backup bucket ${BACKUP_BUCKET} exists`);
  } catch (error) {
    if (error.name === 'NotFound') {
      console.log(`[S3 Backup] Creating backup bucket ${BACKUP_BUCKET}`);

      // Create bucket
      await s3Client.send(new CreateBucketCommand({
        Bucket: BACKUP_BUCKET,
        ACL: 'private'
      }));

      // Enable versioning
      await s3Client.send(new PutBucketVersioningCommand({
        Bucket: BACKUP_BUCKET,
        VersioningConfiguration: {
          Status: 'Enabled'
        }
      }));

      console.log(`[S3 Backup] Backup bucket ${BACKUP_BUCKET} created with versioning enabled`);
    } else {
      throw error;
    }
  }
}

/**
 * List all objects in a bucket
 */
async function listAllObjects(bucket) {
  const objects = [];
  let continuationToken = null;

  do {
    const command = new ListObjectsV2Command({
      Bucket: bucket,
      ContinuationToken: continuationToken
    });

    const response = await s3Client.send(command);

    if (response.Contents) {
      objects.push(...response.Contents);
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return objects;
}

/**
 * Copy object from source to destination
 */
async function copyObject(sourceBucket, sourceKey, destBucket, destKey) {
  const command = new CopyObjectCommand({
    CopySource: `${sourceBucket}/${sourceKey}`,
    Bucket: destBucket,
    Key: destKey
  });

  await s3Client.send(command);
  console.log(`[S3 Backup] Copied: ${sourceKey} -> ${destKey}`);
}

/**
 * Send SNS notification
 */
async function sendNotification(subject, message, severity = 'info') {
  if (!SNS_TOPIC_ARN) {
    console.warn('[S3 Backup] SNS_TOPIC_ARN not configured - skipping notification');
    return;
  }

  const emoji = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    info: 'ℹ️'
  }[severity] || 'ℹ️';

  try {
    await snsClient.send(new PublishCommand({
      TopicArn: SNS_TOPIC_ARN,
      Subject: `${emoji} ${subject}`,
      Message: message
    }));
    console.log('[S3 Backup] Notification sent successfully');
  } catch (error) {
    console.error('[S3 Backup] Failed to send notification:', error.message);
  }
}
