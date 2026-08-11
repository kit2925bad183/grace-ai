/**
 * GRACE AI — Demo Database Seed Script
 *
 * WARNING: This script clears and recreates ALL application collections.
 * Intended ONLY for demo/development databases. Do NOT run against production.
 *
 * Usage: npm run seed
 */

import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { Types } from 'mongoose';
import { connectDatabase, disconnectDatabase } from '../src/config/database';
import {
  User,
  CitizenProfile,
  Department,
  Ward,
  ComplaintCategory,
  Officer,
  Grievance,
  GrievanceStatusHistory,
  AIAnalysis,
  SLAPrediction,
  DuplicateMatch,
  Notification,
  AnalyticsSnapshot,
  PolicyImpact,
  AIRecommendation,
  GrievanceStatus,
  NotificationType,
  AnalysisMethod,
  DuplicateMatchStatus,
  Priority,
} from '../src/models';
import {
  DEMO_PASSWORD,
  BCRYPT_ROUNDS,
  DEPARTMENTS,
  CATEGORIES,
  WARDS,
  USERS,
  OFFICERS,
  GRIEVANCE_TEMPLATES,
  DUPLICATE_CLUSTERS,
  analyzeComplaint,
  computeSlaPrediction,
  buildStatusFlow,
  getSlaDeadline,
  addDays,
  addHours,
} from './helpers';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const SEED_MARKER = '[seed]';

async function clearCollections(): Promise<void> {
  console.log(`${SEED_MARKER} Clearing demo application collections...`);

  const collections = [
    AIRecommendation,
    PolicyImpact,
    AnalyticsSnapshot,
    Notification,
    DuplicateMatch,
    SLAPrediction,
    AIAnalysis,
    GrievanceStatusHistory,
    Grievance,
    Officer,
    CitizenProfile,
    ComplaintCategory,
    Ward,
    Department,
    User,
  ];

  for (const model of collections) {
    await model.deleteMany({});
    console.log(`${SEED_MARKER}   Cleared ${model.collection.name}`);
  }
}

async function seed(): Promise<void> {
  console.log(`${SEED_MARKER} ========================================`);
  console.log(`${SEED_MARKER} GRACE AI Demo Database Seed`);
  console.log(`${SEED_MARKER} WARNING: Clears all app collections`);
  console.log(`${SEED_MARKER} ========================================\n`);

  if (process.env.NODE_ENV === 'production') {
    console.error(`${SEED_MARKER} ABORT: Cannot seed in production environment.`);
    process.exit(1);
  }

  await connectDatabase();
  await clearCollections();

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, BCRYPT_ROUNDS);
  console.log(`${SEED_MARKER} Passwords hashed with bcrypt (${BCRYPT_ROUNDS} rounds)\n`);

  // --- Departments ---
  const departmentDocs = await Department.insertMany(DEPARTMENTS);
  const deptByCode = new Map(departmentDocs.map((d) => [d.code, d]));
  console.log(`${SEED_MARKER} Created ${departmentDocs.length} departments`);

  // --- Wards ---
  const wardDocs = await Ward.insertMany(WARDS);
  const wardByCode = new Map(wardDocs.map((w) => [w.code, w]));
  console.log(`${SEED_MARKER} Created ${wardDocs.length} wards`);

  // --- Categories ---
  const categoryDocs = await ComplaintCategory.insertMany(
    CATEGORIES.map((c) => ({
      name: c.name,
      description: c.description,
      defaultDepartmentId: deptByCode.get(c.departmentCode)!._id,
    }))
  );
  const categoryByName = new Map(categoryDocs.map((c) => [c.name, c]));
  console.log(`${SEED_MARKER} Created ${categoryDocs.length} categories`);

  // --- Users ---
  const userDocs = await User.insertMany(
    USERS.map((u) => ({
      name: u.name,
      email: u.email,
      passwordHash,
      role: u.role,
      phone: u.phone,
    }))
  );
  const userByEmail = new Map(userDocs.map((u) => [u.email, u]));
  console.log(`${SEED_MARKER} Created ${userDocs.length} users`);

  // --- Citizen Profiles ---
  const citizenEmails = USERS.filter((u) => u.role === 'CITIZEN').map((u) => u.email);
  const citizenProfiles = await CitizenProfile.insertMany(
    citizenEmails.map((email, i) => ({
      userId: userByEmail.get(email)!._id,
      address: `${100 + i * 10} Demo Street, Grace City`,
      wardId: wardDocs[i % wardDocs.length]._id,
      pincode: `56000${i + 1}`,
      preferredLanguage: 'en',
    }))
  );
  console.log(`${SEED_MARKER} Created ${citizenProfiles.length} citizen profiles`);

  // --- Officers ---
  const officerDocs = await Officer.insertMany(
    OFFICERS.map((o) => ({
      userId: userByEmail.get(o.email)!._id,
      departmentId: deptByCode.get(o.departmentCode)!._id,
      employeeCode: o.employeeCode,
      designation: o.designation,
      wardIds: o.wardCodes.map((wc) => wardByCode.get(wc)!._id),
      active: true,
    }))
  );
  const officerByDeptCode = new Map(
    OFFICERS.map((o, i) => [o.departmentCode, officerDocs[i]])
  );
  console.log(`${SEED_MARKER} Created ${officerDocs.length} officers`);

  const authorityUser = userByEmail.get('authority@grace.demo')!;
  const citizenUsers = userDocs.filter((u) => u.role === 'CITIZEN');

  // --- Grievances ---
  const now = new Date();
  const grievanceDocs = await Grievance.insertMany(
    GRIEVANCE_TEMPLATES.map((g, index) => {
      const createdAt = addDays(now, -g.daysAgo);
      const category = categoryByName.get(g.categoryName)!;
      const dept = deptByCode.get(
        CATEGORIES.find((c) => c.name === g.categoryName)!.departmentCode
      )!;
      const ward = wardByCode.get(g.wardCode)!;
      const citizen = g.citizenEmail
        ? userByEmail.get(g.citizenEmail)!
        : citizenUsers[index % citizenUsers.length];

      const slaDeadline = getSlaDeadline(g.priority, createdAt);
      const isResolved = g.status === GrievanceStatus.RESOLVED || g.status === GrievanceStatus.CLOSED;

      let assignedOfficerId: Types.ObjectId | undefined;
      if (
        [GrievanceStatus.ASSIGNED, GrievanceStatus.UNDER_REVIEW, GrievanceStatus.IN_PROGRESS,
         GrievanceStatus.ESCALATED, GrievanceStatus.RESOLVED, GrievanceStatus.CLOSED].includes(g.status)
      ) {
        const deptCode = CATEGORIES.find((c) => c.name === g.categoryName)!.departmentCode;
        assignedOfficerId = officerByDeptCode.get(deptCode)?._id;
      }

      return {
        grievanceId: g.grievanceId,
        citizenId: citizen._id,
        title: g.title,
        description: g.description,
        categoryId: category._id,
        departmentId: dept._id,
        wardId: ward._id,
        location: g.location,
        priority: g.priority,
        status: g.status,
        assignedOfficerId,
        slaDeadline,
        resolvedAt: isResolved ? addDays(createdAt, Math.min(g.daysAgo - 1, 3)) : undefined,
        createdAt,
        updatedAt: createdAt,
      };
    })
  );
  const grievanceByPublicId = new Map(grievanceDocs.map((g) => [g.grievanceId, g]));
  console.log(`${SEED_MARKER} Created ${grievanceDocs.length} grievances`);

  // --- Status Histories ---
  const statusHistoryRecords: Array<{
    grievanceId: Types.ObjectId;
    oldStatus?: GrievanceStatus;
    newStatus: GrievanceStatus;
    changedBy: Types.ObjectId;
    comment?: string;
    createdAt: Date;
  }> = [];

  for (const g of grievanceDocs) {
    const template = GRIEVANCE_TEMPLATES.find((t) => t.grievanceId === g.grievanceId)!;
    const flow = buildStatusFlow(template.status);
    const baseDate = g.createdAt as Date;

    for (let i = 0; i < flow.length; i++) {
      statusHistoryRecords.push({
        grievanceId: g._id,
        oldStatus: i > 0 ? flow[i - 1] : undefined,
        newStatus: flow[i],
        changedBy: i === 0 ? g.citizenId as Types.ObjectId : authorityUser._id,
        comment:
          i === 0
            ? 'Grievance submitted by citizen'
            : i === 1
              ? 'AI Demo Analysis completed (Rule-Based AI)'
              : `Status updated to ${flow[i]}`,
        createdAt: addHours(baseDate, i * 4),
      });
    }
  }

  const statusHistoryDocs = await GrievanceStatusHistory.insertMany(statusHistoryRecords);
  console.log(`${SEED_MARKER} Created ${statusHistoryDocs.length} status history records`);

  // --- AI Analyses ---
  const aiAnalysisDocs = await AIAnalysis.insertMany(
    grievanceDocs.map((g) => {
      const analysis = analyzeComplaint(g.description, g.title);
      return {
        grievanceId: g._id,
        category: analysis.category,
        department: analysis.department,
        priority: analysis.priority,
        duplicateProbability: analysis.duplicateProbability,
        slaRisk: analysis.slaRisk,
        estimatedResolutionDays: analysis.estimatedResolutionDays,
        confidence: analysis.confidence,
        detectedKeywords: analysis.detectedKeywords,
        recommendation: analysis.recommendation,
        analysisMethod: AnalysisMethod.RULE_BASED_DEMO,
      };
    })
  );
  console.log(`${SEED_MARKER} Created ${aiAnalysisDocs.length} AI analyses`);

  // --- SLA Predictions ---
  const slaPredictionDocs = await SLAPrediction.insertMany(
    grievanceDocs.map((g) => {
      const template = GRIEVANCE_TEMPLATES.find((t) => t.grievanceId === g.grievanceId)!;
      const sla = computeSlaPrediction(
        template.priority,
        g.createdAt as Date,
        g.slaDeadline,
        template.status
      );
      return {
        grievanceId: g._id,
        slaDeadline: g.slaDeadline,
        predictedResolutionDate: sla.predictedResolutionDate,
        riskLevel: sla.riskLevel,
        riskPercentage: sla.riskPercentage,
        remainingHours: sla.remainingHours,
        recommendation: sla.recommendation,
      };
    })
  );
  console.log(`${SEED_MARKER} Created ${slaPredictionDocs.length} SLA predictions`);

  // --- Duplicate Matches ---
  const duplicateRecords: Array<{
    grievanceId: Types.ObjectId;
    matchedGrievanceId: Types.ObjectId;
    similarityScore: number;
    reason: string;
    status: DuplicateMatchStatus;
  }> = [];

  for (const cluster of DUPLICATE_CLUSTERS) {
    const primary = grievanceByPublicId.get(cluster.primaryId)!;
    for (const match of cluster.matches) {
      const matched = grievanceByPublicId.get(match.id)!;
      duplicateRecords.push({
        grievanceId: primary._id,
        matchedGrievanceId: matched._id,
        similarityScore: match.score,
        reason: match.reason,
        status: DuplicateMatchStatus.POTENTIAL,
      });
    }
  }

  const duplicateDocs = await DuplicateMatch.insertMany(duplicateRecords);
  console.log(`${SEED_MARKER} Created ${duplicateDocs.length} duplicate matches`);

  // --- Notifications ---
  const notificationRecords: Array<{
    userId: Types.ObjectId;
    title: string;
    message: string;
    type: NotificationType;
    isRead: boolean;
    createdAt: Date;
  }> = [];

  for (const g of grievanceDocs.slice(0, 20)) {
    notificationRecords.push({
      userId: g.citizenId as Types.ObjectId,
      title: 'Grievance Status Update',
      message: `Your grievance ${g.grievanceId} status is now ${g.status}.`,
      type: NotificationType.STATUS_UPDATE,
      isRead: Math.random() > 0.5,
      createdAt: addHours(g.createdAt as Date, 8),
    });
  }

  for (const g of grievanceDocs.filter((g) => g.assignedOfficerId).slice(0, 10)) {
    notificationRecords.push({
      userId: g.citizenId as Types.ObjectId,
      title: 'Officer Assigned',
      message: `Your grievance ${g.grievanceId} has been assigned to a field officer.`,
      type: NotificationType.ASSIGNMENT,
      isRead: false,
      createdAt: addHours(g.createdAt as Date, 12),
    });
  }

  notificationRecords.push({
    userId: authorityUser._id,
    title: 'SLA Alert',
    message: `${slaPredictionDocs.filter((s) => s.riskPercentage >= 60).length} grievances are approaching their SLA deadline.`,
    type: NotificationType.SLA_ALERT,
    isRead: false,
    createdAt: now,
  });

  for (const g of grievanceDocs.filter((g) => g.status === GrievanceStatus.RESOLVED).slice(0, 5)) {
    notificationRecords.push({
      userId: g.citizenId as Types.ObjectId,
      title: 'Grievance Resolved',
      message: `Your complaint ${g.grievanceId} has been resolved.`,
      type: NotificationType.RESOLUTION,
      isRead: false,
      createdAt: g.resolvedAt ?? now,
    });
  }

  const notificationDocs = await Notification.insertMany(notificationRecords);
  console.log(`${SEED_MARKER} Created ${notificationDocs.length} notifications`);

  // --- Policy Impact ---
  const policyImpactDocs = await PolicyImpact.insertMany([
    {
      policyName: 'Increased sanitation collection frequency',
      description: 'Doubled garbage collection frequency in high-density wards',
      departmentId: deptByCode.get('SANITATION')!._id,
      categoryId: categoryByName.get('Sanitation')!._id,
      beforeComplaintsPerMonth: 1240,
      afterComplaintsPerMonth: 824,
      impactPercentage: -33.5,
      slaBefore: 76,
      slaAfter: 89,
      effectiveDate: addDays(now, -90),
      isDemoSeed: true,
    },
    {
      policyName: 'Road preventive maintenance program',
      description: 'Quarterly road inspection and preventive repairs in Ward 14',
      departmentId: deptByCode.get('ROADS')!._id,
      categoryId: categoryByName.get('Road Infrastructure')!._id,
      beforeComplaintsPerMonth: 890,
      afterComplaintsPerMonth: 620,
      impactPercentage: -30.3,
      slaBefore: 68,
      slaAfter: 82,
      effectiveDate: addDays(now, -120),
      isDemoSeed: true,
    },
    {
      policyName: 'Water pipeline modernization Phase 1',
      description: 'Replaced aging distribution pipelines in Ward 7',
      departmentId: deptByCode.get('WATER')!._id,
      categoryId: categoryByName.get('Water Supply')!._id,
      beforeComplaintsPerMonth: 560,
      afterComplaintsPerMonth: 410,
      impactPercentage: -26.8,
      slaBefore: 71,
      slaAfter: 85,
      effectiveDate: addDays(now, -60),
      isDemoSeed: true,
    },
  ]);
  console.log(`${SEED_MARKER} Created ${policyImpactDocs.length} policy impact records`);

  // --- AI Recommendations ---
  const aiRecommendationDocs = await AIRecommendation.insertMany([
    {
      title: 'Water Supply — Ward 7 Pipeline Inspection',
      categoryId: categoryByName.get('Water Supply')!._id,
      wardId: wardByCode.get('W07')!._id,
      departmentId: deptByCode.get('WATER')!._id,
      recommendation: 'Increasing complaints in Ward 7. Prioritize pipeline inspection and preventive maintenance.',
      priority: Priority.HIGH,
      source: AnalysisMethod.RULE_BASED_DEMO,
      insightLabel: 'AI-Generated Demo Insight',
      isActive: true,
      generatedAt: now,
    },
    {
      title: 'Road Infrastructure — Ward 14 Preventive Inspection',
      categoryId: categoryByName.get('Road Infrastructure')!._id,
      wardId: wardByCode.get('W14')!._id,
      departmentId: deptByCode.get('ROADS')!._id,
      recommendation: 'High concentration of road complaints in Ward 14. Schedule preventive road inspection.',
      priority: Priority.HIGH,
      source: AnalysisMethod.RULE_BASED_DEMO,
      insightLabel: 'AI-Generated Demo Insight',
      isActive: true,
      generatedAt: now,
    },
    {
      title: 'Sanitation — Maintain Current Allocation',
      categoryId: categoryByName.get('Sanitation')!._id,
      departmentId: deptByCode.get('SANITATION')!._id,
      recommendation: 'SLA compliance improving after collection frequency increase. Maintain current allocation.',
      priority: Priority.MEDIUM,
      source: AnalysisMethod.RULE_BASED_DEMO,
      insightLabel: 'Simulated Recommendation',
      isActive: true,
      generatedAt: now,
    },
    {
      title: 'Public Safety — Traffic Signal Maintenance',
      categoryId: categoryByName.get('Public Safety')!._id,
      wardId: wardByCode.get('W14')!._id,
      departmentId: deptByCode.get('SAFETY')!._id,
      recommendation: 'Multiple traffic signal complaints detected. Deploy preventive maintenance schedule.',
      priority: Priority.CRITICAL,
      source: AnalysisMethod.RULE_BASED_DEMO,
      insightLabel: 'AI-Generated Demo Insight',
      isActive: true,
      generatedAt: now,
    },
  ]);
  console.log(`${SEED_MARKER} Created ${aiRecommendationDocs.length} AI recommendations`);

  // --- Analytics Snapshot ---
  const statusCounts: Record<string, number> = {};
  const priorityCounts: Record<string, number> = {};
  const deptCounts: Record<string, number> = {};
  const catCounts: Record<string, number> = {};

  for (const g of grievanceDocs) {
    statusCounts[g.status] = (statusCounts[g.status] ?? 0) + 1;
    priorityCounts[g.priority] = (priorityCounts[g.priority] ?? 0) + 1;

    const dept = departmentDocs.find((d) => d._id.equals(g.departmentId));
    const cat = categoryDocs.find((c) => c._id.equals(g.categoryId));
    if (dept) deptCounts[dept.name] = (deptCounts[dept.name] ?? 0) + 1;
    if (cat) catCounts[cat.name] = (catCounts[cat.name] ?? 0) + 1;
  }

  const resolvedCount = grievanceDocs.filter(
    (g) => g.status === GrievanceStatus.RESOLVED || g.status === GrievanceStatus.CLOSED
  ).length;
  const inProgressCount = grievanceDocs.filter(
    (g) =>
      g.status === GrievanceStatus.IN_PROGRESS ||
      g.status === GrievanceStatus.UNDER_REVIEW ||
      g.status === GrievanceStatus.ASSIGNED
  ).length;
  const slaAtRisk = slaPredictionDocs.filter((s) => s.riskPercentage >= 60).length;

  const analyticsDoc = await AnalyticsSnapshot.create({
    snapshotDate: now,
    totalGrievances: grievanceDocs.length,
    resolvedGrievances: resolvedCount,
    inProgressGrievances: inProgressCount,
    slaComplianceRate: Math.round((resolvedCount / grievanceDocs.length) * 100),
    avgResolutionDays: 5.2,
    slaAtRiskCount: slaAtRisk,
    duplicateCount: duplicateDocs.length,
    grievancesByStatus: statusCounts,
    grievancesByPriority: priorityCounts,
    grievancesByDepartment: deptCounts,
    grievancesByCategory: catCounts,
  });
  console.log(`${SEED_MARKER} Created analytics snapshot (${analyticsDoc.totalGrievances} total grievances)`);

  // --- Summary ---
  console.log(`\n${SEED_MARKER} ========================================`);
  console.log(`${SEED_MARKER} Seed completed successfully!`);
  console.log(`${SEED_MARKER} ========================================`);
  console.log(`${SEED_MARKER} Demo Accounts (password: ${DEMO_PASSWORD}):`);
  console.log(`${SEED_MARKER}   Citizen:   citizen@grace.demo`);
  console.log(`${SEED_MARKER}   Authority: authority@grace.demo`);
  console.log(`${SEED_MARKER}   Admin:     admin@grace.demo`);
  console.log(`${SEED_MARKER}   Officers:  roads.officer@grace.demo`);
  console.log(`${SEED_MARKER}              water.officer@grace.demo`);
  console.log(`${SEED_MARKER}              sanitation.officer@grace.demo`);
  console.log(`${SEED_MARKER} ----------------------------------------`);
  console.log(`${SEED_MARKER} Collections seeded:`);
  console.log(`${SEED_MARKER}   Departments:      ${departmentDocs.length}`);
  console.log(`${SEED_MARKER}   Categories:       ${categoryDocs.length}`);
  console.log(`${SEED_MARKER}   Wards:            ${wardDocs.length}`);
  console.log(`${SEED_MARKER}   Users:            ${userDocs.length}`);
  console.log(`${SEED_MARKER}   Officers:         ${officerDocs.length}`);
  console.log(`${SEED_MARKER}   Grievances:       ${grievanceDocs.length}`);
  console.log(`${SEED_MARKER}   Status Histories: ${statusHistoryDocs.length}`);
  console.log(`${SEED_MARKER}   AI Analyses:      ${aiAnalysisDocs.length}`);
  console.log(`${SEED_MARKER}   SLA Predictions:  ${slaPredictionDocs.length}`);
  console.log(`${SEED_MARKER}   Duplicate Matches:${duplicateDocs.length}`);
  console.log(`${SEED_MARKER}   Notifications:    ${notificationDocs.length}`);
  console.log(`${SEED_MARKER}   Policy Impacts:   ${policyImpactDocs.length}`);
  console.log(`${SEED_MARKER}   AI Recommendations:${aiRecommendationDocs.length}`);
  console.log(`${SEED_MARKER}   Analytics Snapshots: 1`);
  console.log(`${SEED_MARKER} ========================================\n`);

  await disconnectDatabase();
}

seed().catch(async (error) => {
  console.error(`${SEED_MARKER} Seed failed:`, error instanceof Error ? error.message : error);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
