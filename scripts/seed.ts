/**
 * Database Seed Script
 *
 * Run with: bun run scripts/seed.ts
 *
 * Creates demo data:
 * - 1 Admin account
 * - 2 Client accounts
 * - 3 Worker accounts
 * - Sample jobs in various states
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

// Load environment variables
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nimmit";

// Define schemas inline to avoid path issues
const WorkerStatsSchema = new mongoose.Schema(
  {
    completedJobs: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
  },
  { _id: false }
);

const WorkerProfileSchema = new mongoose.Schema(
  {
    skills: { type: [String], default: [] },
    availability: {
      type: String,
      enum: ["available", "busy", "offline"],
      default: "offline",
    },
    currentJobCount: { type: Number, default: 0 },
    maxConcurrentJobs: { type: Number, default: 3 },
    stats: { type: WorkerStatsSchema, default: () => ({}) },
    bio: { type: String },
  },
  { _id: false }
);

const ClientProfileSchema = new mongoose.Schema(
  {
    company: { type: String },
    preferredWorkerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    totalJobs: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
  },
  { _id: false }
);

const UserProfileSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    avatar: { type: String },
    timezone: { type: String, default: "America/Los_Angeles" },
    phone: { type: String },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["client", "worker", "admin"], required: true },
    profile: { type: UserProfileSchema, required: true },
    workerProfile: { type: WorkerProfileSchema },
    clientProfile: { type: ClientProfileSchema },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const JobMessageSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderRole: { type: String, enum: ["client", "worker", "admin"], required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const JobSchema = new mongoose.Schema(
  {
    clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    workerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ["video", "design", "web", "social", "admin", "other"],
      required: true,
    },
    priority: {
      type: String,
      enum: ["standard", "priority", "rush"],
      default: "standard",
    },
    status: {
      type: String,
      enum: ["pending", "assigned", "in_progress", "review", "revision", "completed", "cancelled"],
      default: "pending",
    },
    files: { type: Array, default: [] },
    deliverables: { type: Array, default: [] },
    messages: { type: [JobMessageSchema], default: [] },
    estimatedHours: { type: Number },
    actualHours: { type: Number },
    dueDate: { type: Date },
    rating: { type: Number, min: 1, max: 5 },
    feedback: { type: String },
    assignedAt: { type: Date },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);
const Job = mongoose.models.Job || mongoose.model("Job", JobSchema);

async function seed() {
  console.log("🌱 Starting database seed...\n");

  try {
    // Connect to MongoDB
    console.log("📦 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Job.deleteMany({});
    console.log("✅ Data cleared\n");

    // Hash password (same for all demo accounts)
    const passwordHash = await bcrypt.hash("password123", 12);

    // Create Admin
    console.log("👤 Creating admin account...");
    const admin = await User.create({
      email: "admin@nimmit.com",
      passwordHash,
      role: "admin",
      profile: {
        firstName: "Admin",
        lastName: "User",
        timezone: "Asia/Phnom_Penh",
      },
    });
    console.log(`   ✅ Admin: admin@nimmit.com\n`);

    // Create Clients
    console.log("👥 Creating client accounts...");
    const clients = await User.create([
      {
        email: "john@example.com",
        passwordHash,
        role: "client",
        profile: {
          firstName: "John",
          lastName: "Smith",
          timezone: "America/Los_Angeles",
        },
        clientProfile: {
          company: "Smith Digital",
          totalJobs: 0,
          totalSpent: 0,
        },
      },
      {
        email: "sarah@example.com",
        passwordHash,
        role: "client",
        profile: {
          firstName: "Sarah",
          lastName: "Johnson",
          timezone: "America/New_York",
        },
        clientProfile: {
          company: "SJ Creative Agency",
          totalJobs: 0,
          totalSpent: 0,
        },
      },
    ]);
    console.log("   ✅ john@example.com (Smith Digital)");
    console.log("   ✅ sarah@example.com (SJ Creative Agency)\n");

    // Create Workers
    console.log("👷 Creating worker accounts...");
    const workers = await User.create([
      {
        email: "dara@koompi.com",
        passwordHash,
        role: "worker",
        profile: {
          firstName: "Dara",
          lastName: "Sok",
          timezone: "Asia/Phnom_Penh",
        },
        workerProfile: {
          skills: ["video editing", "motion graphics", "after effects"],
          availability: "available",
          currentJobCount: 0,
          maxConcurrentJobs: 3,
          stats: { completedJobs: 12, avgRating: 4.8, totalEarnings: 2400 },
          bio: "Video editing specialist with 3+ years of experience",
        },
      },
      {
        email: "sreymom@koompi.com",
        passwordHash,
        role: "worker",
        profile: {
          firstName: "Sreymom",
          lastName: "Chan",
          timezone: "Asia/Phnom_Penh",
        },
        workerProfile: {
          skills: ["graphic design", "figma", "photoshop", "branding"],
          availability: "available",
          currentJobCount: 0,
          maxConcurrentJobs: 3,
          stats: { completedJobs: 18, avgRating: 4.9, totalEarnings: 3600 },
          bio: "Creative designer passionate about beautiful visuals",
        },
      },
      {
        email: "visal@koompi.com",
        passwordHash,
        role: "worker",
        profile: {
          firstName: "Visal",
          lastName: "Phan",
          timezone: "Asia/Phnom_Penh",
        },
        workerProfile: {
          skills: ["web development", "react", "nextjs", "typescript"],
          availability: "busy",
          currentJobCount: 2,
          maxConcurrentJobs: 3,
          stats: { completedJobs: 8, avgRating: 4.7, totalEarnings: 1800 },
          bio: "Full-stack developer specializing in React and Node.js",
        },
      },
    ]);
    console.log("   ✅ dara@koompi.com (Video Editor)");
    console.log("   ✅ sreymom@koompi.com (Graphic Designer)");
    console.log("   ✅ visal@koompi.com (Web Developer)\n");

    // Create Sample Jobs
    console.log("📋 Creating sample jobs...");

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const jobs = await Job.create([
      // Pending job (unassigned)
      {
        clientId: clients[0]._id,
        title: "Edit YouTube video - Product Review",
        description:
          "I need a 10-minute product review video edited. Raw footage is about 45 minutes. Need cuts, transitions, background music, and lower thirds. Style should be casual and engaging. Please add intro and outro using the templates I'll provide.",
        category: "video",
        priority: "standard",
        status: "pending",
        createdAt: dayAgo,
      },
      // Assigned job
      {
        clientId: clients[0]._id,
        workerId: workers[0]._id,
        assignedBy: admin._id,
        title: "Create social media promo video",
        description:
          "Need a 60-second promotional video for Instagram/TikTok. Should be vertical format, fast-paced with trendy transitions and music. Text overlays with key product features.",
        category: "video",
        priority: "priority",
        status: "assigned",
        estimatedHours: 4,
        assignedAt: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        createdAt: dayAgo,
      },
      // In Progress job
      {
        clientId: clients[1]._id,
        workerId: workers[1]._id,
        assignedBy: admin._id,
        title: "Design Instagram story templates",
        description:
          "Create a set of 10 Instagram story templates for our wellness brand. Color palette: sage green, cream, and gold. Should include templates for: announcements, quotes, product features, testimonials, and behind-the-scenes.",
        category: "design",
        priority: "standard",
        status: "in_progress",
        estimatedHours: 6,
        assignedAt: weekAgo,
        startedAt: new Date(weekAgo.getTime() + 2 * 60 * 60 * 1000),
        createdAt: weekAgo,
        messages: [
          {
            id: "msg-1",
            senderId: clients[1]._id,
            senderRole: "client",
            message: "Please make sure to use our brand font - Playfair Display for headings",
            timestamp: weekAgo,
          },
          {
            id: "msg-2",
            senderId: workers[1]._id,
            senderRole: "worker",
            message: "Got it! I'll make sure to use Playfair Display. Working on the first drafts now.",
            timestamp: new Date(weekAgo.getTime() + 4 * 60 * 60 * 1000),
          },
        ],
      },
      // Review job
      {
        clientId: clients[1]._id,
        workerId: workers[1]._id,
        assignedBy: admin._id,
        title: "Logo redesign for rebranding",
        description:
          "We're rebranding and need a fresh logo. Current logo feels dated. Want something modern, minimal, but still professional. We're a financial consulting firm.",
        category: "design",
        priority: "rush",
        status: "review",
        estimatedHours: 8,
        actualHours: 7,
        assignedAt: new Date(weekAgo.getTime() - 2 * 24 * 60 * 60 * 1000),
        startedAt: new Date(weekAgo.getTime() - 2 * 24 * 60 * 60 * 1000),
        createdAt: new Date(weekAgo.getTime() - 3 * 24 * 60 * 60 * 1000),
        messages: [
          {
            id: "msg-3",
            senderId: workers[1]._id,
            senderRole: "worker",
            message: "I've completed the logo designs. Submitting 3 concepts for your review. Let me know which direction you'd like to go!",
            timestamp: dayAgo,
          },
        ],
      },
      // Completed job
      {
        clientId: clients[0]._id,
        workerId: workers[2]._id,
        assignedBy: admin._id,
        title: "Build landing page for product launch",
        description:
          "Need a responsive landing page for our new SaaS product. Should include: hero section, features grid, pricing table, FAQ accordion, and contact form. Tech: Next.js preferred.",
        category: "web",
        priority: "priority",
        status: "completed",
        estimatedHours: 12,
        actualHours: 10,
        rating: 5,
        feedback:
          "Incredible work! The page looks amazing and was delivered ahead of schedule. Will definitely work with Visal again!",
        assignedAt: new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
        startedAt: new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
        completedAt: weekAgo,
        createdAt: new Date(weekAgo.getTime() - 8 * 24 * 60 * 60 * 1000),
      },
    ]);

    // Update worker job counts
    await User.findByIdAndUpdate(workers[0]._id, {
      "workerProfile.currentJobCount": 1,
    });
    await User.findByIdAndUpdate(workers[1]._id, {
      "workerProfile.currentJobCount": 2,
    });

    // Update client job counts
    await User.findByIdAndUpdate(clients[0]._id, {
      "clientProfile.totalJobs": 3,
    });
    await User.findByIdAndUpdate(clients[1]._id, {
      "clientProfile.totalJobs": 2,
    });

    console.log(`   ✅ Created ${jobs.length} sample jobs\n`);

    console.log("═".repeat(50));
    console.log("\n🎉 Database seeded successfully!\n");
    console.log("📧 Demo Accounts (password: password123):");
    console.log("─".repeat(50));
    console.log("   Admin:  admin@nimmit.com");
    console.log("   Client: john@example.com");
    console.log("   Client: sarah@example.com");
    console.log("   Worker: dara@koompi.com");
    console.log("   Worker: sreymom@koompi.com");
    console.log("   Worker: visal@koompi.com");
    console.log("─".repeat(50));
    console.log("\n🚀 Run 'bun run dev' to start the development server\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

seed();
