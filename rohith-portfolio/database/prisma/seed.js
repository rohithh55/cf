// Loads Rohith's profile + resume PDF into the database.
// Safe to re-run: content tables are rewritten, the resume is only added if it changed.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // ── Profile ──
  await prisma.profile.deleteMany();
  await prisma.profile.create({
    data: {
      fullName: "Rohith Reddy",
      title: "DevOps · Cloud · SRE Engineer",
      headline: "I build cloud infrastructure that deploys itself, heals itself, and tells me when it can't.",
      summary:
        "DevOps, Cloud, and SRE-focused engineer with hands-on experience in AWS, Terraform, Kubernetes, Docker, CI/CD, Linux administration, and monitoring. Owner and operator of DevJops.com, a live production job portal on AWS EKS. Immediate joiner; open to relocation and remote work.",
      about: [
        "I'm a DevOps, Cloud & SRE engineer based in Bengaluru, focused on infrastructure that is automated, reliable, and observable. I provision AWS with Terraform, ship containers to Amazon EKS, and wire up CI/CD with GitHub Actions and Prometheus/Grafana monitoring.",
        "I don't just build in tutorials — I run DevJops.com, a live production job portal on AWS EKS, and own it end to end: infrastructure, deployments, scaling, DNS, load balancing, monitoring and reliability. Most recently I interned at LeMiCi IQ, automating IaC pipelines with drift detection, security scanning and approval gates.",
        "My philosophy: every deployment should be automated, every failure should be observable, and every incident should leave the system better than it was found."
      ],
      email: "rohiithh5@gmail.com",
      phone: "+91 93984 31327",
      location: "Bengaluru, India (open to relocation & remote)",
      linkedin: "https://www.linkedin.com/in/rohithreddyhh",
      github: "https://github.com/rohithh55",
      website: "https://rohithh75.netlify.app",
      liveProject: "https://devjops.com",
      availability: "Immediate joiner"
    }
  });

  // ── Experience ──
  await prisma.experience.deleteMany();
  await prisma.experience.createMany({
    data: [
      {
        company: "LeMiCi IQ Pvt. Ltd.",
        role: "DevOps Engineer Intern",
        location: "Bengaluru, India",
        startDate: new Date("2026-05-01"),
        endDate: new Date("2026-08-31"),
        isCurrent: false,
        sortOrder: 1,
        tags: ["Terraform", "IaC", "CI/CD", "Drift Detection", "Security Scanning"],
        bullets: [
          "Assisted in transitioning manual Infrastructure-as-Code (IaC) provisioning into automated deployment pipelines, reducing manual intervention and streamlining execution times.",
          "Configured automated drift detection to monitor deployed infrastructure, helping identify configuration divergences and flag unexpected cloud resources.",
          "Integrated automated security scanning and manual approval gates into the deployment pipeline to catch IaC misconfigurations and authorize production changes before release."
        ]
      },
      {
        company: "Accenar Technologies Pvt. Ltd.",
        role: "DevOps / Cloud Engineering Intern",
        location: "Hyderabad, India",
        startDate: new Date("2024-12-01"),
        endDate: new Date("2025-08-31"),
        isCurrent: false,
        sortOrder: 2,
        tags: ["AWS", "Terraform", "Docker", "ECR", "Linux", "Prometheus", "Grafana", "GitHub Actions"],
        bullets: [
          "Provisioned AWS infrastructure including EC2, S3, VPC, IAM, and ECR using Terraform Infrastructure as Code (IaC).",
          "Containerized applications using Docker; created Dockerfiles and managed image build and push workflows with Amazon ECR.",
          "Administered Linux servers running Ubuntu and CentOS, including user management, SSH key management, cron jobs, and log analysis.",
          "Supported Prometheus and Grafana monitoring for infrastructure visibility and assisted with CI/CD pipeline setup using GitHub Actions."
        ]
      }
    ]
  });

  // ── Projects ──
  await prisma.project.deleteMany();
  await prisma.project.createMany({
    data: [
      {
        title: "DevJops.com — Production Job Portal",
        description: "Full-stack React/Node.js job portal running live on Amazon EKS (ap-south-1). I own the whole stack, from Terraform to on-call.",
        status: "Live",
        liveUrl: "https://devjops.com",
        sortOrder: 1,
        tags: ["AWS EKS", "Terraform", "GitHub Actions", "Prometheus", "Grafana", "React", "Node.js"],
        bullets: [
          "Provisioned VPC, EKS cluster, node groups, S3, IAM and ECR using Terraform.",
          "CI/CD with GitHub Actions: Docker image build → Amazon ECR push → Kubernetes deployment.",
          "Prometheus and Grafana for cluster and application monitoring, alerting and observability.",
          "Managed DNS, load balancing and auto-scaling to keep the app available under real user traffic."
        ]
      },
      {
        title: "Self-Healing Kubernetes SRE Project",
        description: "Python and Bash automation that detects unhealthy Kubernetes pods and triggers remediation, cutting manual recovery effort.",
        status: "Completed",
        sortOrder: 2,
        tags: ["Kubernetes", "Python", "Bash", "Prometheus", "Grafana"],
        bullets: [
          "Detects unhealthy pods and triggers automated remediation.",
          "Prometheus and Grafana for monitoring, alert visibility and Kubernetes reliability tracking."
        ]
      },
      {
        title: "AWS Infrastructure as Code",
        description: "Reusable Terraform for AWS networking, compute, IAM and container registry — the foundation behind my EKS work.",
        status: "Completed",
        repoUrl: "https://github.com/rohithh55/aws-infrastructure",
        sortOrder: 3,
        tags: ["Terraform", "AWS", "VPC", "IAM", "ECR"],
        bullets: []
      }
    ]
  });

  // ── Skills ──
  await prisma.skillGroup.deleteMany();
  await prisma.skillGroup.createMany({
    data: [
      { category: "Cloud & Infrastructure", icon: "☁️", sortOrder: 1, items: ["AWS EC2", "EKS", "ECS", "S3", "ECR", "VPC", "IAM", "Security Groups", "Load Balancing", "Auto Scaling"] },
      { category: "Infrastructure as Code", icon: "🏗️", sortOrder: 2, items: ["Terraform", "Drift Detection", "IaC Security Scanning", "Approval Gates"] },
      { category: "Containers & Orchestration", icon: "🐳", sortOrder: 3, items: ["Docker", "Kubernetes", "Amazon EKS", "Helm"] },
      { category: "CI/CD & Automation", icon: "🔄", sortOrder: 4, items: ["GitHub Actions", "Jenkins (fundamentals)", "Deployment Automation"] },
      { category: "SRE & Observability", icon: "📊", sortOrder: 5, items: ["Prometheus", "Grafana", "Alerting", "Incident Troubleshooting", "Root Cause Analysis", "Self-Healing Automation"] },
      { category: "Systems & Scripting", icon: "⚙️", sortOrder: 6, items: ["Linux (Ubuntu, CentOS)", "Bash", "Python", "Git", "SSH", "Cron", "Log Analysis"] }
    ]
  });

  // ── Education (degree + graduation year only) ──
  await prisma.education.deleteMany();
  await prisma.education.create({ data: { degree: "Bachelor's in Computers", institution: null, graduationYear: 2025, sortOrder: 1 } });

  // ── Certifications ──
  await prisma.certification.deleteMany();
  await prisma.certification.createMany({
    data: [
      { name: "AWS Certified Solutions Architect – Associate", status: "In Progress", issuer: "Amazon Web Services", sortOrder: 1 },
      { name: "Certified Kubernetes Administrator (CKA)", status: "In Progress", issuer: "CNCF", sortOrder: 2 }
    ]
  });

  // ── Resume file → stored in the database ──
  const file = path.join(__dirname, "..", "assets", "Rohith_Reddy_Resume.pdf");
  if (fs.existsSync(file)) {
    const data = fs.readFileSync(file);
    const sha256 = crypto.createHash("sha256").update(data).digest("hex");
    const already = await prisma.storedFile.findFirst({ where: { kind: "RESUME", sha256 } });
    if (already) {
      console.log("✔ Resume already stored (v" + already.version + ")");
    } else {
      const last = await prisma.storedFile.findFirst({ where: { kind: "RESUME" }, orderBy: { version: "desc" } });
      await prisma.storedFile.updateMany({ where: { kind: "RESUME" }, data: { isActive: false } });
      const saved = await prisma.storedFile.create({
        data: { kind: "RESUME", filename: "Rohith_Reddy_Resume.pdf", mimeType: "application/pdf", sizeBytes: data.length, sha256, version: (last?.version || 0) + 1, isActive: true, data }
      });
      console.log(`✔ Resume stored in DB (v${saved.version}, ${data.length} bytes)`);
    }
  } else {
    console.warn("⚠ assets/Rohith_Reddy_Resume.pdf not found — upload one via POST /api/admin/files");
  }

  console.log("✔ Seed complete");
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
