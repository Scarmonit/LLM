# Environment Restrictions - Official Documentation Resources

This document compiles official documented resources on environment restrictions, security isolation, and sandboxing across various platforms and technologies.

## Table of Contents
1. [Container Technologies](#container-technologies)
2. [Linux Kernel Security Features](#linux-kernel-security-features)
3. [Operating System Level Isolation](#operating-system-level-isolation)
4. [Virtualization and MicroVMs](#virtualization-and-microvms)
5. [Application Sandboxing](#application-sandboxing)
6. [Browser Security](#browser-security)
7. [Runtime Environments](#runtime-environments)
8. [Security Standards and Compliance](#security-standards-and-compliance)

---

## Container Technologies

### Docker

**Official Documentation:**
- Docker Security: https://docs.docker.com/engine/security/
- Docker Seccomp Profiles: https://docs.docker.com/engine/security/seccomp/
- Docker AppArmor Profiles: https://docs.docker.com/engine/security/apparmor/
- Docker User Namespaces: https://docs.docker.com/engine/security/userns-remap/

**Key Resources:**
- OWASP Docker Security Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Docker_Security_Cheat_Sheet.html

**Security Best Practices:**
- Run containers as non-root users
- Drop unnecessary Linux capabilities
- Avoid privileged mode unless required
- Use rootless mode when possible
- Implement resource restrictions (CPU, memory)
- Use network segmentation
- Enable SELinux, Seccomp, and AppArmor policies

### Kubernetes

**Official Documentation:**
- Pod Security Standards: https://kubernetes.io/docs/concepts/security/pod-security-standards/
- Pod Security Policies (Deprecated): https://kubernetes.io/docs/concepts/security/pod-security-policy/

**Key Points:**
- PodSecurityPolicy was deprecated in v1.21 and removed in v1.25
- Use Pod Security Standards (PSS) or third-party admission plugins instead
- Three policy levels: Privileged, Baseline, Restricted

**Security Controls:**
- HostProcess, Host Namespaces, Privileged Containers
- Capabilities, HostPath Volumes, Host Ports
- AppArmor, SELinux, /proc Mount Type
- Seccomp, Sysctls, Volume Types
- Privilege Escalation restrictions
- Running as Non-root

### OCI Runtime Specification

**Official Documentation:**
- GitHub Repository: https://github.com/opencontainers/runtime-spec
- Linux-specific Configuration: https://github.com/opencontainers/runtime-spec/blob/main/config-linux.md

**Key Features:**
- Control groups (cgroups) for resource restrictions
- Namespaces for process isolation
- Capabilities for privilege management
- Linux Security Modules (LSM) integration
- Filesystem jails

### Kata Containers

**Official Documentation:**
- Website: https://katacontainers.io
- GitHub: https://github.com/kata-containers/kata-containers
- Virtualization Design: https://github.com/kata-containers/kata-containers/blob/main/docs/design/virtualization.md
- Limitations: https://github.com/kata-containers/kata-containers/blob/main/docs/Limitations.md

**Key Features:**
- Lightweight VMs that feel like containers
- Hardware virtualization for enhanced security
- Second layer of isolation on top of namespace-containers
- Uses guest Linux kernel for container workloads

---

## Linux Kernel Security Features

### Namespaces

**Official Documentation:**
- Linux Kernel Docs: https://docs.kernel.org/admin-guide/namespaces/index.html
- namespaces(7) manual: https://man7.org/linux/man-pages/man7/namespaces.7.html
- Network Namespaces: https://man7.org/linux/man-pages/man7/network_namespaces.7.html
- User Namespaces: https://man7.org/linux/man-pages/man7/user_namespaces.7.html

**Key Points:**
- Partition kernel resources for process isolation
- 8 types of namespaces (as of kernel 5.6)
- Network namespaces isolate routing tables and firewall rules
- User namespaces enable UID/GID mapping with restrictions

**UID/GID Mapping Restrictions:**
- Requires CAP_SETUID/CAP_SETGID for arbitrary mappings
- Limited to maximum 340 lines in mapping files
- Allocations should be at least 65536 UIDs/GIDs
- Ranges must not overlap

### Control Groups (cgroups)

**Official Documentation:**
- Linux Kernel v2: https://docs.kernel.org/admin-guide/cgroup-v2.html
- v1 Documentation: https://www.kernel.org/doc/Documentation/cgroup-v1/cgroups.txt
- v2 Documentation: https://www.kernel.org/doc/Documentation/cgroup-v2.txt
- Red Hat Guide: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/8/html/managing_monitoring_and_updating_the_kernel/setting-limits-for-applications_managing-monitoring-and-updating-the-kernel

**Resource Types:**
- CPU time
- Memory
- Disk I/O
- Network bandwidth
- Process IDs (PIDs)
- RDMA resources

### Seccomp

**Official Documentation:**
- Linux Kernel Docs: https://docs.kernel.org/userspace-api/seccomp_filter.html
- Kernel Documentation: https://www.kernel.org/doc/Documentation/prctl/seccomp_filter.txt
- seccomp(2) Manual: https://man7.org/linux/man-pages/man2/seccomp.2.html

**Key Features:**
- Syscall filtering using Berkeley Packet Filter (BPF)
- One-way transition to secure state
- Return values with precedence (SECCOMP_RET_KILL_PROCESS takes precedence)
- Limits system calls to exit(), sigreturn(), read(), and write() in strict mode

### Linux Capabilities

**Official Documentation:**
- capabilities(7) Manual: https://man7.org/linux/man-pages/man7/capabilities.7.html
- capget(2) System Call: https://man7.org/linux/man-pages/man2/capget.2.html
- cap_get_proc(3) Library: https://www.man7.org/linux/man-pages/man3/cap_get_proc.3.html
- Red Hat Container Guide: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux_atomic_host/7/html/container_security_guide/linux_capabilities_and_seccomp

**Key Points:**
- Based on withdrawn POSIX.1e draft standard
- Per-thread capability bounding set (since Linux 2.6.25)
- Effective, permitted, and inheritable capability sets
- Remove all capabilities except those explicitly required

### SELinux

**Official Documentation:**
- RHEL 8 Using SELinux: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/8/html-single/using_selinux/index
- RHEL 9 Using SELinux: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html-single/using_selinux/index
- RHEL 7 Administrator's Guide: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/selinux_users_and_administrators_guide/chap-security-enhanced_linux-selinux_contexts

**SELinux Context:**
- Syntax: `user:role:type:level`
- Type information most important for policy rules
- Confined vs unconfined users
- MLS/MCS range support

### AppArmor

**Official Documentation:**
- Ubuntu Security: https://documentation.ubuntu.com/security/security-features/privilege-restriction/apparmor/
- Ubuntu Server: https://documentation.ubuntu.com/server/how-to/security/apparmor/
- SUSE Guide: https://documentation.suse.com/sles/15-SP7/html/SLES-all/cha-apparmor-profiles.html
- Kubernetes Integration: https://kubernetes.io/docs/tutorials/security/apparmor/

**Restrictions:**
- File and directory access limits
- Network access restrictions
- Linux capabilities constraints
- Profile-based access control

### Landlock

**Official Documentation:**
- Linux Kernel Docs: https://docs.kernel.org/security/landlock.html
- Userspace API: https://docs.kernel.org/userspace-api/landlock.html
- System Administration: https://docs.kernel.org/admin-guide/LSM/landlock.html
- landlock(7) Manual: https://man7.org/linux/man-pages/man7/landlock.7.html
- Official Website: https://landlock.io/

**Key Features:**
- Introduced in Linux 5.13
- Unprivileged sandboxing
- Stackable LSM
- Restricts ambient rights (filesystem, network access)
- No privileged daemon required

### Yama LSM (ptrace restrictions)

**Official Documentation:**
- Linux Kernel Docs: https://www.kernel.org/doc/html/latest/admin-guide/LSM/Yama.html
- Kernel Documentation: https://www.kernel.org/doc/Documentation/security/Yama.txt
- ptrace(2) Manual: https://man7.org/linux/man-pages/man2/ptrace.2.html
- Red Hat SELinux Guide: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/selinux_users_and_administrators_guide/sect-security-enhanced_linux-working_with_selinux-disable_ptrace

**ptrace_scope Values:**
- 0: Classic ptrace permissions
- 1: Restricted ptrace (default) - only descendants
- 2: Admin-only ptrace
- 3: No ptrace allowed (irreversible)

---

## Operating System Level Isolation

### chroot

**Official Documentation:**
- Oracle Linux 9: https://docs.oracle.com/en/operating-systems/oracle-linux/9/security/security-ProtectingtheRootDirectoryUsingchrootJails.html
- Oracle Linux 8: https://docs.oracle.com/html/E36387_02/ol_cj_sec.html
- Ubuntu Community Wiki: https://help.ubuntu.com/community/BasicChroot
- Red Hat Guides: https://www.redhat.com/en/blog/set-linux-chroot-jails

**Key Points:**
- Changes apparent root directory for process and children
- Creates artificial root directory (chroot jail)
- Limits directory access for security

### pivot_root

**Official Documentation:**
- pivot_root(2) Manual: https://www.man7.org/linux/man-pages/man2/pivot_root.2.html
- pivot_root(8) Manual: https://www.man7.org/linux/man-pages/man8/pivot_root.8.html

**Restrictions:**
- new_root must be a mount point
- new_root cannot be "/"
- Current root must be a mount point
- Parent mount of new_root must not be MS_SHARED
- Modern use: container root filesystem setup
- More secure than chroot

### Mount Restrictions

**Key Points:**
- Propagation types: MS_SHARED, MS_PRIVATE, MS_SLAVE
- pivot_root restrictions prevent namespace propagation
- Container isolation requires careful mount configuration

### POSIX Resource Limits

**Official Documentation:**
- POSIX ulimit: https://pubs.opengroup.org/onlinepubs/9799919799.2024edition/utilities/ulimit.html
- getrlimit(2) Manual: https://man7.org/linux/man-pages/man2/getrlimit.2.html
- GNU C Library: https://www.gnu.org/software/libc/manual/html_node/Limits-on-Resources.html

**Key Features:**
- Soft and hard limits
- Conforms to POSIX.1-2001, SVr4, 4.3BSD
- Shell: ulimit command
- System calls: getrlimit() and setrlimit()

### Access Control Lists (ACLs)

**Official Documentation:**
- Oracle Solaris: https://docs.oracle.com/cd/E19683-01/817-0365/secfile-37/index.html
- Red Hat RHEL 7: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/7/html/system_administrators_guide/ch-access_control_lists
- SUSE SLES: https://documentation.suse.com/sles/15-SP7/html/SLES-all/cha-security-acls.html

**ACL Types:**
- Access ACLs: for specific files/directories
- Default ACLs: for directories only
- Tools: setfacl and getfacl
- Supported filesystems: ReiserFS, Ext2, Ext3, Ext4, JFS, XFS

### Environment Variables Security

**Official Documentation:**
- Secure Programs HOWTO: https://tldp.org/HOWTO/Secure-Programs-HOWTO/environment-variables.html

**Security Concerns:**
- Accessible via /proc/$PID/environ (permissions: 400)
- Only owner and root can access process environment
- May appear in shell history (~/.bash_history)
- May be logged by audit mechanisms during execve
- Best practice: read and immediately delete from environment

### systemd Service Isolation

**Official Documentation:**
- freedesktop.org systemd: https://www.freedesktop.org/software/systemd/man/latest/
- systemd.exec: https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html
- systemd.unit: https://www.freedesktop.org/software/systemd/man/latest/systemd.unit.html
- SUSE Guide: https://documentation.suse.com/smart/security/html/systemd-securing/index.html

**Key Isolation Directives:**
- PrivateTmp: Private /tmp directory
- PrivateNetwork: Network isolation
- CapabilityBoundingSet: Capability restrictions
- Uses same kernel mechanisms as containers

---

## Virtualization and MicroVMs

### QEMU/KVM

**Official Documentation:**
- QEMU Security: https://qemu-project.gitlab.io/qemu/system/security.html
- Red Hat RHEL 9: https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/html/configuring_and_managing_virtualization/securing-virtual-machines-in-rhel_configuring-and-managing-virtualization
- libvirt QEMU Driver: https://libvirt.org/drvqemu.html

**Security Principles:**
- QEMU processes run as unprivileged users
- Guest isolation via VM confinement
- SELinux and AppArmor confinement
- Resource controls via cgroups
- Principle of least privilege
- VMs run as isolated processes

### Firecracker

**Official Documentation:**
- Official Website: https://firecracker-microvm.github.io/
- GitHub: https://github.com/firecracker-microvm/firecracker
- AWS Blog: https://aws.amazon.com/blogs/aws/firecracker-lightweight-virtualization-for-serverless-computing/

**Security Features:**
- KVM-based virtualization
- Minimal device model (50,000 LOC vs QEMU's 1.4M)
- Written in Rust for security
- Jailer process for additional isolation
- cgroup/namespace isolation
- Seccomp BPF filters
- Limited syscall list

### gVisor

**Official Documentation:**
- Official Docs: https://gvisor.dev/docs/
- GitHub: https://github.com/google/gvisor
- GKE Sandbox: https://cloud.google.com/kubernetes-engine/docs/concepts/sandbox-pods

**Key Features:**
- Application Kernel for Containers
- runsc OCI runtime
- Sentry does not pass syscalls to host kernel
- Implements ~200 syscalls
- User-space application providing kernel interface
- Some limitations on GPU and system features

---

## Application Sandboxing

### Windows Sandbox

**Official Documentation:**
- Microsoft Learn: https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/
- Configuration Guide: https://learn.microsoft.com/en-us/windows/security/application-security/application-isolation/windows-sandbox/windows-sandbox-configure-using-wsb-file

**Key Features:**
- Lightweight isolated desktop environment
- Hypervisor-based virtualization
- Kernel isolation via Microsoft hypervisor
- Separate kernel for isolation

### Android Application Sandbox

**Official Documentation:**
- AOSP: https://source.android.com/docs/security/app-sandbox

**Key Features:**
- Unique UID per application
- Each app runs in own process
- Kernel-level Application Sandbox
- Limited inter-app communication
- Restricted OS access by default

### Flatpak

**Official Documentation:**
- Sandbox Permissions: https://docs.flatpak.org/en/latest/sandbox-permissions.html
- Permissions Reference: https://flatpak-docs.readthedocs.io/en/latest/sandbox-permissions-reference.html

**Default Restrictions:**
- No host file access (except runtime, app, ~/.var/app/$FLATPAK_ID)
- No network access
- No device node access (except /dev/null, etc)
- No access to processes outside sandbox
- Limited syscalls
- Limited D-Bus access
- No access to X11, system D-Bus, PulseAudio

**Best Practices:**
- Minimize filesystem access
- Use portals instead of blanket access
- Use read-only access (:ro) when possible

### Snap

**Official Documentation:**
- Snap Confinement: https://snapcraft.io/docs/snap-confinement
- Ubuntu Core Security: https://documentation.ubuntu.com/core/explanation/security-and-sandboxing/

**Security Mechanisms:**
- AppArmor profiles
- Seccomp filters
- Device cgroup rules
- Namespaces
- Strict confinement by default

**Strict Confinement:**
- Complete isolation
- Minimal safe access level
- No file, network, process, or system resource access without interfaces
- AppArmor mediates file access, execution, capabilities, mount, ptrace, IPC, signals

### Claude Code Sandboxing

**Official Documentation:**
- Claude Code Docs: https://docs.claude.com/en/docs/claude-code/sandboxing

**Key Features:**
- Native sandboxing for agent execution
- Filesystem isolation
- Network isolation
- OS-level primitives
- Defined boundaries for safer operation

---

## Browser Security

### Chromium/Chrome Sandbox

**Official Documentation:**
- Sandbox Design: https://chromium.googlesource.com/chromium/src/+/main/docs/design/sandbox.md
- Security Guts: https://www.chromium.org/Home/chromium-security/guts/
- Android Sandbox: https://chromium.googlesource.com/chromium/src/+/refs/tags/128.0.6613.5/docs/security/android-sandbox.md
- Windows Diagnostics: https://www.chromium.org/Home/chromium-security/articles/chrome-sandbox-diagnostics-for-windows/

**Architecture:**
- User-mode only (Windows)
- No kernel mode drivers required
- Broker (browser process) and Target (sandboxed processes)
- Works on Windows 10+ (32-bit and 64-bit)

### V8 Sandbox

**Official Documentation:**
- V8 Blog: https://v8.dev/blog/sandbox
- V8 Sandbox README: https://chromium.googlesource.com/v8/v8.git/+/refs/heads/main/src/sandbox/README.md

**Key Features:**
- Lightweight in-process sandbox
- Included in Chrome VRP
- Limits V8 to subset of process virtual address space
- Converts raw pointers to offsets or table indices
- Assumes arbitrary memory modification within sandbox
- Enabled by default on 64-bit configurations

---

## Runtime Environments

### WebAssembly (WASM)

**Official Documentation:**
- WebAssembly Security: https://webassembly.org/docs/security/
- Wasmtime Security: https://docs.wasmtime.dev/security.html

**Security Features:**
- Inherently sandboxed by design
- Fault isolation techniques
- Linear memory with fixed maximum size
- Zero-initialized memory by default
- Bounds checking on memory access
- Capability-based security (WASI)
- Applications execute independently

### Java Security Manager

**Official Documentation:**
- SecurityManager Java SE 8: https://docs.oracle.com/javase/8/docs/api/java/lang/SecurityManager.html
- SecurityManager Java SE 17: https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/lang/SecurityManager.html (deprecated for removal)
- Permissions Guide: https://docs.oracle.com/javase/8/docs/technotes/guides/security/permissions.html
- Permissions JDK 11: https://docs.oracle.com/en/java/javase/11/security/permissions-jdk1.html

**Key Features:**
- checkPermission() method for access control
- Throws SecurityException if denied
- Access ACLs and Default ACLs
- java.security.AllPermission implies all permissions
- Default policy grants access to safe properties only

### Python Restricted Execution

**Official Documentation:**
- Python Wiki: https://wiki.python.org/moin/SandboxedPython
- RestrictedPython Docs: https://restrictedpython.readthedocs.io/
- RestrictedPython GitHub: https://github.com/zopefoundation/RestrictedPython

**Key Points:**
- RestrictedPython: subset of Python for trusted environments
- Not a complete sandbox system
- Helps define trusted environment for untrusted code
- No Zope dependencies (standalone)
- Python 3 docs removed restricted execution documentation

### Node.js VM Module

**Official Documentation:**
- Node.js VM API: https://nodejs.org/api/vm.html

**Critical Warning:**
- **NOT a security mechanism**
- **Do not use for untrusted code**

**Features:**
- Compile and run code in V8 contexts
- Isolated global environment
- Context isolation only
- Can be escaped - not secure

### Temporal Python SDK Sandbox

**Official Documentation:**
- Temporal Docs: https://docs.temporal.io/develop/python/python-sdk-sandbox

**Key Features:**
- Runs Workflow code in sandbox
- Prevents non-determinism errors
- Safer Workflow development

---

## Security Standards and Compliance

### NIST SP 800-190

**Official Documentation:**
- NIST Publication: https://csrc.nist.gov/pubs/sp/800/190/final
- PDF: https://nvlpubs.nist.gov/nistpubs/specialpublications/nist.sp.800-190.pdf

**Title:** Application Container Security Guide

**Authors:**
- Murugiah Souppaya (NIST)
- John Morello (Twistlock)
- Karen Scarfone (Scarfone Cybersecurity)

**Key Recommendations:**
- Limit access to host OS
- Monitor for unauthorized attempts
- Ensure containers have minimal file system access
- Use least privilege model
- Restrict orchestrator access to specific actions
- Maps to NIST Cybersecurity Framework

### CIS Benchmarks

**Official Documentation:**
- CIS Website: https://www.cisecurity.org/cis-benchmarks

**Key Points:**
- 100+ benchmarks across 25+ vendor families
- Free PDF download for non-commercial use
- Prescriptive configuration recommendations
- Level 1: Basic, easy to implement
- Level 2: In-depth defense, high-security environments
- Coverage: Cloud, containers, databases, OS, network devices

**Platform-Specific Implementations:**
- Microsoft: https://learn.microsoft.com/en-us/compliance/regulatory/offering-cis-benchmark
- AWS: https://aws.amazon.com/what-is/cis-benchmarks/
- Red Hat: https://access.redhat.com/compliance/cis-benchmarks
- RKE2: https://docs.rke2.io/security/hardening_guide

---

## Summary

This compilation covers official documentation for environment restrictions across:

1. **Container Technologies**: Docker, Kubernetes, OCI, Kata Containers
2. **Linux Kernel Features**: Namespaces, cgroups, seccomp, capabilities, SELinux, AppArmor, Landlock, Yama
3. **OS-Level Isolation**: chroot, pivot_root, resource limits, ACLs, environment variables, systemd
4. **Virtualization**: QEMU/KVM, Firecracker, gVisor
5. **Application Sandboxing**: Windows Sandbox, Android, Flatpak, Snap, Claude Code
6. **Browser Security**: Chromium sandbox, V8 sandbox
7. **Runtime Environments**: WebAssembly, Java, Python, Node.js
8. **Standards**: NIST SP 800-190, CIS Benchmarks

All resources listed are from official documentation sources including:
- Linux kernel documentation (kernel.org)
- Official project websites and repositories
- Vendor documentation (Red Hat, Oracle, Microsoft, Google, AWS)
- Standards bodies (NIST, CIS, OWASP, OCI)
- Manual pages (man7.org)

---

**Last Updated:** 2025-11-15

**Research Context:** Comprehensive web search for official documented resources on environment restrictions, security isolation, and sandboxing technologies.
