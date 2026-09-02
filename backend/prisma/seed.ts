import { PrismaClient, Role, EventStatus, Recommendation } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  const passwordHash = await bcrypt.hash("Demo123!", 10);

  // -----------------------------
  // USERS
  // -----------------------------

  const admin = await prisma.user.upsert({
    where: {
      email: "admin@eventshield.ai",
    },
    update: {},
    create: {
      email: "admin@eventshield.ai",
      passwordHash,
      name: "EventShield Admin",
      role: Role.ADMIN,
    },
  });

  const organizerUser = await prisma.user.upsert({
    where: {
      email: "organizer@eventshield.ai",
    },
    update: {},
    create: {
      email: "organizer@eventshield.ai",
      passwordHash,
      name: "Demo Organizer",
      role: Role.ORGANIZER,
    },
  });

  const student = await prisma.user.upsert({
    where: {
      email: "student@eventshield.ai",
    },
    update: {},
    create: {
      email: "student@eventshield.ai",
      passwordHash,
      name: "Demo Student",
      role: Role.STUDENT,
    },
  });

  // -----------------------------
  // ORGANIZER
  // -----------------------------

  const organizer = await prisma.organizer.upsert({
    where: {
      userId: organizerUser.id,
    },
    update: {},
    create: {
      userId: organizerUser.id,
      organizationName: "EventShield Demo Club",
      description: "College technology and innovation club",
      websiteUrl: "https://example.com",
      verified: true,
    },
  });

  // -----------------------------
  // EVENTS
  // -----------------------------

  const event1 = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      createdById: organizerUser.id,
      title: "AI Innovation Summit 2026",
      description:
        "A college technology summit featuring talks and demonstrations on artificial intelligence, machine learning and emerging technologies.",
      category: "Technology",
      eventDate: new Date("2026-10-15T00:00:00.000Z"),
      startTime: "10:00",
      endTime: "16:00",
      venue: "Main Auditorium",
      location: "Chennai",
      registrationUrl: "https://example.com/ai-summit",
      contactEmail: "contact@example.com",
      contactPhone: "+91 9876543210",
      status: EventStatus.APPROVED,
      published: true,
    },
  });

  const event2 = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      createdById: organizerUser.id,
      title: "Web Development Workshop",
      description:
        "Hands-on workshop covering modern web development, frontend development and backend APIs.",
      category: "Workshop",
      eventDate: new Date("2026-10-20T00:00:00.000Z"),
      startTime: "09:30",
      endTime: "13:00",
      venue: "Computer Science Lab",
      location: "Chennai",
      registrationUrl: "https://example.com/web-workshop",
      contactEmail: "contact@example.com",
      contactPhone: "+91 9876543210",
      status: EventStatus.APPROVED,
      published: true,
    },
  });

  const event3 = await prisma.event.create({
    data: {
      organizerId: organizer.id,
      createdById: organizerUser.id,
      title: "College Cultural Fest 2026",
      description:
        "A student cultural celebration featuring music, dance, art and other performances.",
      category: "Cultural",
      eventDate: new Date("2026-11-05T00:00:00.000Z"),
      startTime: "10:00",
      endTime: "19:00",
      venue: "College Grounds",
      location: "Chennai",
      registrationUrl: "https://example.com/cultural-fest",
      contactEmail: "contact@example.com",
      contactPhone: "+91 9876543210",
      status: EventStatus.APPROVED,
      published: true,
    },
  });

  // -----------------------------
  // DEMO VERIFICATION RESULTS
  // -----------------------------

  await prisma.verificationResult.create({
    data: {
      eventId: event1.id,
      qualityScore: 94,
      trustScore: 91,
      riskLevel: "LOW",
      confidence: 93,
      recommendation: Recommendation.APPROVE,
      summary:
        "The event contains complete information and no significant verification issues were detected.",
      descriptionResult: {
        quality: 94,
        trust: 92,
        issues: [],
      },
      imageResult: {
        quality: 95,
        trust: 92,
        mismatches: [],
      },
      urlResult: {
        quality: 94,
        trust: 90,
        valid: true,
      },
      duplicateResult: {
        duplicateProbability: 0.04,
        matches: [],
      },
    },
  });

  await prisma.verificationResult.create({
    data: {
      eventId: event2.id,
      qualityScore: 82,
      trustScore: 76,
      riskLevel: "MEDIUM",
      confidence: 88,
      recommendation: Recommendation.REQUEST_CHANGES,
      summary:
        "The event is generally complete, but some information should be verified before publication.",
      descriptionResult: {
        quality: 86,
        trust: 79,
        issues: [
          "Organizer should provide additional workshop details.",
        ],
      },
      imageResult: {
        quality: 84,
        trust: 78,
        mismatches: [],
      },
      urlResult: {
        quality: 80,
        trust: 75,
        valid: true,
      },
      duplicateResult: {
        duplicateProbability: 0.18,
        matches: [],
      },
      findings: {
        create: [
          {
            severity: "MEDIUM",
            source: "DESCRIPTION",
            message:
              "Additional workshop details could improve event completeness.",
          },
        ],
      },
    },
  });

  await prisma.verificationResult.create({
    data: {
      eventId: event3.id,
      qualityScore: 89,
      trustScore: 87,
      riskLevel: "LOW",
      confidence: 91,
      recommendation: Recommendation.APPROVE,
      summary:
        "The event information appears complete and consistent.",
      descriptionResult: {
        quality: 90,
        trust: 88,
        issues: [],
      },
      imageResult: {
        quality: 89,
        trust: 87,
        mismatches: [],
      },
      urlResult: {
        quality: 88,
        trust: 86,
        valid: true,
      },
      duplicateResult: {
        duplicateProbability: 0.07,
        matches: [],
      },
    },
  });

  console.log("");
  console.log("====================================");
  console.log("✅ DATABASE SEED COMPLETED");
  console.log("====================================");
  console.log("");
  console.log("Demo accounts:");
  console.log("");
  console.log("ADMIN");
  console.log("admin@eventshield.ai");
  console.log("Demo123!");
  console.log("");
  console.log("ORGANIZER");
  console.log("organizer@eventshield.ai");
  console.log("Demo123!");
  console.log("");
  console.log("STUDENT");
  console.log("student@eventshield.ai");
  console.log("Demo123!");
  console.log("");
  console.log("Created 3 demo events.");
  console.log("Created verification results.");
  console.log("");
}

main()
  .catch((error) => {
    console.error("❌ Seed failed:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });