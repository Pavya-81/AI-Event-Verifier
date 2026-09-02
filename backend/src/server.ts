import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { PrismaClient, Recommendation, EventStatus } from '@prisma/client';
import { runAIVerification } from './ai.js';
import { sendChangesRequestedEmail } from './email.js';

dotenv.config();
const app = express();
const prisma = new PrismaClient();
const PORT = Number(process.env.BACKEND_PORT || 3001);
const JWT_SECRET = process.env.JWT_SECRET || 'eventshield-development-secret';
const uploadDir = path.resolve('uploads');
fs.mkdirSync(uploadDir, { recursive: true });
const upload = multer({ dest: uploadDir, limits: { fileSize: 8 * 1024 * 1024 } });

app.use(helmet());
app.use(cors({ origin: (origin, callback) => {
  const allowed = [process.env.CORS_ORIGIN || 'http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
  if (!origin || allowed.includes(origin)) {
    callback(null, true);
  } else {
    callback(new Error('Not allowed by CORS'));
  }
}, credentials: true }));
app.use(express.json({ limit: '5mb' }));
app.use('/uploads', express.static(uploadDir));

function auth(req: any, res: any, next: any) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

function role(...roles: string[]) {
  return (req: any, res: any, next: any) =>
    roles.includes(req.user?.role) ? next() : res.status(403).json({ message: 'Forbidden' });
}

function tokenize(s: string) {
  return new Set((s || '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter((x) => x.length > 2));
}

function similarity(a: string, b: string) {
  const A = tokenize(a);
  const B = tokenize(b);
  if (!A.size || !B.size) return 0;
  let matches = 0;
  A.forEach((x) => {
    if (B.has(x)) matches += 1;
  });
  return matches / (A.size + B.size - matches);
}

function urlHost(u?: string | null) {
  try {
    return u ? new URL(u).hostname : '';
  } catch {
    return '';
  }
}

async function verifyEvent(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: { organizer: true },
  });

  if (!event) {
    throw new Error('Event not found');
  }

  const missing: string[] = [];
  for (const [key, value] of Object.entries({
    title: event.title,
    description: event.description,
    category: event.category,
    eventDate: event.eventDate,
    venue: event.venue,
    location: event.location,
    contactEmail: event.contactEmail,
  })) {
    if (!value) {
      missing.push(key);
    }
  }

  const spamTerms = ['click now', 'limited time', 'free money', 'winner', 'urgent!!!', 'guaranteed profit'];
  const lowerDescription = (event.description || '').toLowerCase();
  const spamHits = spamTerms.filter((term) => lowerDescription.includes(term));
  const descriptionQuality = Math.max(0, 100 - missing.length * 12 - spamHits.length * 12 - (event.description.length < 80 ? 12 : 0));
  const descriptionTrust = Math.max(20, 90 - spamHits.length * 20 - missing.length * 5);

  let imageResult: any = {
    qualityScore: event.posterUrl ? 90 : 45,
    trustScore: event.posterUrl ? 88 : 60,
    extractedInformation: null,
    mismatches: [],
    issues: event.posterUrl ? [] : ['No event poster uploaded'],
  };

  const imagePath = event.posterUrl?.startsWith('/uploads/') ? path.resolve(process.cwd(), event.posterUrl.replace(/^\//, '')) : null;
  if (imagePath && fs.existsSync(imagePath)) {
    imageResult.extractedInformation = {
      status: 'poster received',
      note: 'Poster preserved for multimodal analysis',
    };
  }

  let urlScore = event.registrationUrl ? 85 : 55;
  const urlIssues: string[] = [];
  if (event.registrationUrl) {
    try {
      const registrationUrl = new URL(event.registrationUrl);
      if (registrationUrl.protocol !== 'https:') {
        urlScore -= 12;
        urlIssues.push('Registration URL is not HTTPS');
      }
      if (['bit.ly', 'tinyurl.com'].includes(registrationUrl.hostname)) {
        urlScore -= 8;
        urlIssues.push('Shortened URL detected');
      }
    } catch {
      urlScore = 35;
      urlIssues.push('Invalid registration URL');
    }
  } else {
    urlIssues.push('No registration URL provided');
  }

  let urlResult: any = {
    qualityScore: Math.max(0, urlScore),
    trustScore: Math.max(0, urlScore),
    urlHost: urlHost(event.registrationUrl),
    qrDetected: false,
    qrUrl: null,
    issues: urlIssues,
  };

  const others = await prisma.event.findMany({
    where: {
      id: { not: event.id },
      status: { in: [EventStatus.APPROVED, EventStatus.SUBMITTED] },
    },
    select: {
      id: true,
      title: true,
      description: true,
      eventDate: true,
      venue: true,
      location: true,
      organizerId: true,
    },
  });

  const candidates = others
    .map((other) => {
      const titleSimilarity = similarity(event.title, other.title);
      const descriptionSimilarity = similarity(event.description, other.description);
      const sameDay = Math.abs(new Date(event.eventDate).getTime() - new Date(other.eventDate).getTime()) < 86_400_000 ? 1 : 0;
      const sameVenue = event.venue.toLowerCase() === other.venue.toLowerCase() ? 1 : 0;
      const sameOrg = event.organizerId === other.organizerId ? 1 : 0;
      const score = Math.round((0.45 * titleSimilarity + 0.2 * descriptionSimilarity + 0.15 * sameDay + 0.1 * sameVenue + 0.1 * sameOrg) * 100);
      return { ...other, score };
    })
    .filter((candidate) => candidate.score >= 65)
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);

  let duplicateResult = {
    duplicateProbability: candidates[0]?.score || 0,
    candidates: candidates.map((candidate) => ({ eventId: candidate.id, title: candidate.title, similarity: candidate.score })),
  };

  let findings: any[] = [];
  missing.forEach((field) => findings.push({ severity: 'medium', source: 'description', message: `Missing or incomplete field: ${field}` }));
  spamHits.forEach((term) => findings.push({ severity: 'high', source: 'description', message: `Spam-like phrase detected: "${term}"` }));
  imageResult.issues.forEach((issue: string) => findings.push({ severity: 'medium', source: 'poster', message: issue }));
  urlIssues.forEach((issue) => findings.push({ severity: 'medium', source: 'url', message: issue }));
  if (candidates[0]) {
    findings.push({ severity: candidates[0].score >= 85 ? 'high' : 'medium', source: 'duplicate', message: `Potential duplicate: ${candidates[0].title} (${candidates[0].score}% similarity)` });
  }

  let quality = Math.round(Math.max(0, Math.min(100, descriptionQuality * 0.5 + imageResult.qualityScore * 0.25 + urlResult.qualityScore * 0.25)));
  let trust = Math.round(Math.max(0, Math.min(100, descriptionTrust * 0.4 + imageResult.trustScore * 0.3 + urlResult.trustScore * 0.3 - (candidates[0]?.score >= 85 ? 18 : candidates[0]?.score >= 75 ? 10 : 0))));
  let risk: 'LOW' | 'MEDIUM' | 'HIGH' = trust < 50 || findings.some((finding) => finding.severity === 'high') ? 'HIGH' : trust < 75 || findings.length >= 2 ? 'MEDIUM' : 'LOW';
  let recommendation: Recommendation = risk === 'HIGH' ? Recommendation.MANUAL_REVIEW : quality < 60 || trust < 60 ? Recommendation.REQUEST_CHANGES : risk === 'MEDIUM' ? Recommendation.MANUAL_REVIEW : Recommendation.APPROVE;
  let summary = risk === 'LOW' ? 'Event appears complete and reasonably trustworthy.' : risk === 'MEDIUM' ? 'Event has issues that should be reviewed before publication.' : 'High-risk signals were detected; administrator review is required.';
  let descriptionResult = {
    qualityScore: descriptionQuality,
    trustScore: descriptionTrust,
    missingInformation: missing,
    spamProbability: Math.min(1, spamHits.length * 0.25),
    issues: spamHits,
  };

  let explanation = summary;
  let suggestedActions: string[] = [];

  try {
    const aiRes = await runAIVerification(event, imagePath, candidates);
    if (aiRes) {
      quality = aiRes.qualityScore;
      trust = aiRes.trustScore;
      risk = aiRes.riskLevel;
      recommendation = aiRes.recommendation === 'APPROVE' ? Recommendation.APPROVE : aiRes.recommendation === 'REQUEST_CHANGES' ? Recommendation.REQUEST_CHANGES : aiRes.recommendation === 'REJECT' ? Recommendation.REJECT : Recommendation.MANUAL_REVIEW;
      summary = aiRes.summary;
      explanation = aiRes.explanation || aiRes.summary || summary;
      suggestedActions = Array.isArray(aiRes.suggestedActions) ? aiRes.suggestedActions.map(String) : [];
      descriptionResult = aiRes.descriptionResult;
      imageResult = aiRes.imageResult;
      urlResult = aiRes.urlResult;
      findings = aiRes.findings;
      duplicateResult = {
        ...duplicateResult,
        ...(typeof aiRes === 'object' && aiRes && 'duplicateResult' in aiRes ? (aiRes as any).duplicateResult || {} : {}),
      };
    }
  } catch (error) {
    console.error('AI verification fallback engaged:', error);
  }

  const confidence = Math.max(55, Math.min(96, 100 - Math.min(35, findings.length * 7)));
  const verification = await prisma.verificationResult.upsert({
    where: { eventId: event.id },
    update: {
      qualityScore: quality,
      trustScore: trust,
      riskLevel: risk,
      confidence,
      recommendation,
      summary,
      explanation,
      suggestedActions,
      descriptionResult,
      imageResult,
      urlResult,
      duplicateResult,
      findings: {
        deleteMany: {},
        create: findings.map((finding) => ({
          severity: finding.severity,
          source: finding.source,
          message: finding.message,
        })),
      },
    },
    create: {
      eventId: event.id,
      qualityScore: quality,
      trustScore: trust,
      riskLevel: risk,
      confidence,
      recommendation,
      summary,
      explanation,
      suggestedActions,
      descriptionResult,
      imageResult,
      urlResult,
      duplicateResult,
      findings: {
        create: findings.map((finding) => ({
          severity: finding.severity,
          source: finding.source,
          message: finding.message,
        })),
      },
    },
  });

  return prisma.verificationResult.findUnique({
    where: { id: verification.id },
    include: { findings: true },
  });
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'eventshield-api' }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role = 'STUDENT', organizationName } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'name, email and password are required' });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hash,
        role,
        organizer: role === 'ORGANIZER' ? { create: { organizationName: organizationName || name } } : undefined,
      },
    });

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: error.message || 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ message: error.message || 'Login failed' });
  }
});

app.get('/api/events', async (req, res) => {
  const q = String(req.query.q || '');
  const category = String(req.query.category || '');
  const events = await prisma.event.findMany({
    where: {
      published: true,
      status: EventStatus.APPROVED,
      ...(category ? { category } : {}),
    },
    include: { organizer: true, verification: { include: { findings: true } } },
    orderBy: { eventDate: 'asc' },
  });

  const filtered = q ? events.filter((event) => `${event.title} ${event.description} ${event.venue}`.toLowerCase().includes(q.toLowerCase())) : events;
  return res.json(filtered);
});

app.get('/api/events/:id', async (req, res) => {
  const event = await prisma.event.findUnique({
    where: { id: req.params.id },
    include: { organizer: true, verification: { include: { findings: true } } },
  });

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  return res.json(event);
});

app.post('/api/events', auth, role('ORGANIZER', 'ADMIN'), upload.single('poster'), async (req: any, res) => {
  try {
    const body = req.body || {};

    if (!body.title || !body.description || !body.category || !body.eventDate || !body.venue || !body.location || !body.contactEmail) {
      return res.status(400).json({ message: 'Please complete all required event details before submitting.' });
    }

    const eventDate = new Date(body.eventDate);
    if (Number.isNaN(eventDate.getTime())) {
      return res.status(400).json({ message: 'The event date is invalid. Please choose a valid date.' });
    }

    if (body.registrationUrl && !/^https?:\/\//i.test(body.registrationUrl)) {
      return res.status(400).json({ message: 'Registration URL must start with http:// or https://.' });
    }

    const organizer = req.user.role === 'ADMIN'
      ? await prisma.organizer.findFirst()
      : await prisma.organizer.findUnique({ where: { userId: req.user.id } });

    if (!organizer) {
      return res.status(400).json({ message: 'Organizer profile not found' });
    }

    const event = await prisma.event.create({
      data: {
        organizerId: organizer.id,
        createdById: req.user.id,
        title: String(body.title),
        description: String(body.description),
        category: String(body.category),
        eventDate,
        startTime: String(body.startTime || '10:00'),
        endTime: String(body.endTime || '12:00'),
        venue: String(body.venue),
        location: String(body.location),
        registrationUrl: body.registrationUrl ? String(body.registrationUrl) : null,
        contactEmail: String(body.contactEmail),
        contactPhone: body.contactPhone ? String(body.contactPhone) : null,
        posterUrl: req.file ? `/uploads/${path.basename(req.file.path)}` : null,
        status: EventStatus.SUBMITTED,
        submissions: {
          create: { status: EventStatus.SUBMITTED },
        },
      },
    });

    return res.status(201).json({ event });
  } catch (error: any) {
    console.error('Event creation error:', error);
    return res.status(500).json({ message: error.message || 'Event creation failed' });
  }
});

app.get('/api/my/events', auth, async (req: any, res) => {
  const events = await prisma.event.findMany({
    where: { createdById: req.user.id },
    include: { verification: { include: { findings: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(events);
});

app.post('/api/events/:id/verify', auth, role('ADMIN', 'ORGANIZER'), async (req, res) => {
  try {
    const verification = await verifyEvent(req.params.id);
    return res.json(verification);
  } catch (error: any) {
    console.error('Verify event error:', error);
    return res.status(500).json({ message: error.message || 'Verification failed' });
  }
});

app.post('/api/events/:id/action', auth, role('ADMIN'), async (req, res) => {
  try {
    const { action, note } = req.body;
    const normalizedAction = String(action || '').toLowerCase();
    const status = normalizedAction === 'approve'
      ? EventStatus.APPROVED
      : normalizedAction === 'reject'
        ? EventStatus.REJECTED
        : EventStatus.CHANGES_REQUESTED;

    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: { status, published: status === EventStatus.APPROVED },
      include: { createdBy: true, verification: { include: { findings: true } } }
    });

    const latestSubmission = await prisma.eventSubmission.findFirst({
      where: { eventId: event.id },
      orderBy: { submittedAt: 'desc' },
    });

    if (latestSubmission) {
      await prisma.eventSubmission.update({
        where: { id: latestSubmission.id },
        data: { status, reviewedAt: new Date(), adminNote: note || null },
      });
    }

    let emailSent = false;
    let emailError = null;

    if (status === EventStatus.CHANGES_REQUESTED && event.createdBy?.email) {
      try {
        await sendChangesRequestedEmail({
          to: event.createdBy.email,
          eventTitle: event.title,
          adminNote: note || '',
          findings: event.verification?.findings || []
        });
        emailSent = true;
      } catch (err: any) {
        console.error('Failed to send email:', err);
        emailError = err.message || 'Unknown email error';
      }
    }

    return res.json({ event, emailSent, emailError });
  } catch (error: any) {
    console.error('Admin event action error:', error);
    return res.status(500).json({ message: error.message || 'Unable to update event status' });
  }
});

app.get('/api/admin/queue', auth, role('ADMIN'), async (_req, res) => {
  const events = await prisma.event.findMany({
    where: { status: EventStatus.SUBMITTED },
    include: { organizer: true, verification: { include: { findings: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json(events);
});

app.post('/api/events/:id/bookmark', auth, async (req: any, res) => {
  await prisma.bookmark.upsert({
    where: { userId_eventId: { userId: req.user.id, eventId: req.params.id } },
    update: {},
    create: { userId: req.user.id, eventId: req.params.id },
  });
  return res.json({ ok: true });
});

app.use((error: any, _req: any, res: any, _next: any) => {
  console.error('Unhandled API error:', error);
  return res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => console.log(`EventShield API running at http://localhost:${PORT}`));
