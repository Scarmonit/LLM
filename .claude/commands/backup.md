# Backup Management

Manage database backups and check backup status.

## Backup Configuration

According to SYSTEM-CONTEXT.md:
- **Automated**: Daily at 1:00 AM via Task Scheduler
- **Location**: `C:\Users\scarm\Backups\databases\`
- **Retention**: 7 days
- **Script**: `C:\Users\scarm\.claude\automation\database-backup.sh`

## User Intent Detection

Parse what the user wants:
- "status" / "list" / "show backups" → List recent backups
- "run" / "backup now" / "manual" → Trigger manual backup
- "restore" → Guide to restore process
- "check" → Verify backup task is scheduled

## Actions

### List Recent Backups
```bash
ls -lh C:/Users/scarm/Backups/databases/*/* | tail -20
```

### Show Backup Size Summary
```bash
du -sh C:/Users/scarm/Backups/databases/*/
```

### Check Scheduled Task
```powershell
Get-ScheduledTask -TaskName "Database-Daily-Backup" | Select-Object TaskName,State,LastRunTime,NextRunTime
```

### Run Manual Backup
```bash
wsl -d Ubuntu -e bash /mnt/c/Users/scarm/.claude/automation/database-backup.sh
```

### Show Backup Age
```bash
find C:/Users/scarm/Backups/databases/ -type f -name "*.sql" -o -name "*.dump" | head -10 | xargs ls -lh
```

## Response Format

```
💾 BACKUP STATUS

Last Backup: [timestamp]
Backup Location: C:\Users\scarm\Backups\databases\
Total Size: XXX MB

Recent Backups:
  - PostgreSQL: [date] (XXX MB)
  - MongoDB: [date] (XXX MB)
  - MySQL: [date] (XXX MB)

Scheduled Task: ✅ Enabled | Next run: [time]

Available actions:
  - /backup run → Trigger manual backup now
  - /backup restore → Show restore instructions
```

Be informative but concise.
