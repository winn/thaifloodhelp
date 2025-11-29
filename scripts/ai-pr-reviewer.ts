import { GoogleGenerativeAI } from "@google/generative-ai";
import * as core from "@actions/core";
import * as github from "@actions/github";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function run() {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not set");
    }
    if (!GITHUB_TOKEN) {
      throw new Error("GITHUB_TOKEN is not set");
    }

    const context = github.context;
    const pr = context.payload.pull_request;

    if (!pr) {
      core.setFailed("No pull request found in context");
      return;
    }

    const octokit = github.getOctokit(GITHUB_TOKEN);

    // Fetch PR diff
    const { data: diff } = await octokit.rest.pulls.get({
      owner: context.repo.owner,
      repo: context.repo.repo,
      pull_number: pr.number,
      mediaType: {
        format: "diff",
      },
    });

    // Construct Prompt
    const prompt = `
Please process the following Pull Request (PR) details. Your task is to act as an AI Code Review Assistant and generate a comprehensive review summary strictly in Thai. The review must be structured and follow all the requested sections to facilitate quick and clear understanding for contributors and reviewers.

Input PR Details:
PR Title: ${pr.title}

Target Repository/Feature: ${context.repo.owner}/${context.repo.repo}

Associated Issue(s): ${pr.body || "No description provided"}

Diff/Code Changes:
\`\`\`diff
${String(diff).substring(0, 20000)} 
\`\`\`
(Note: Diff truncated to 20000 chars if too long)

🤖 Code Review Output Structure (Must be in Thai):
You must generate the response by filling out the following sections in the specified structure:

📋 สรุป (Summary):
Provide a brief, high-level summary of the purpose and main outcomes of the PR. What does this PR accomplish? (e.g., "การเปลี่ยนแปลงนี้เป็นการปรับปรุงระบบการยืนยันตัวตนของผู้ใช้...")

⚙️ การเปลี่ยนแปลงหลัก (Changes):
Detail the key files and code sections that were modified. List the most significant modifications introduced.

🚨 ความเสี่ยงที่อาจเกิดขึ้น (Risks):
Identify potential bugs, regressions, performance bottlenecks, or security vulnerabilities introduced by these changes. If the risks are minimal, state that clearly.

⚖️ ระดับความสำคัญ (Level):
Rate the overall significance/impact of the PR (e.g., Critical, Major, Moderate, Minor). Justify the rating briefly.

📝 คำอธิบายโดยละเอียด (Description):
Provide a more in-depth explanation of why these changes were made and how they achieve the objective. Include any relevant architectural context.

💡 ข้อเสนอแนะ (Suggestions):
Offer constructive suggestions for improvement, such as better practices, cleanup, simplification, or potential future refactoring.

❓ ถาม-ตอบ (Human Ask/Bot Reply):
Crucially, add a final note that allows for follow-up. State clearly: "หากมีข้อสงสัยหรือต้องการรายละเอียดเชิงลึกในส่วนใดเพิ่มเติม สามารถถามคำถามเฉพาะเจาะจงได้เลย" (If you have questions or need deeper details on any specific section, feel free to ask a specific question.)

REMINDER: All generated content must be in Thai. Focus on clarity, accuracy, and ease of reading for technical contributors.
`;

    // Call Gemini API
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = result.response;
    const reviewComment = response.text();

    // Post Comment
    await octokit.rest.issues.createComment({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: pr.number,
      body: reviewComment,
    });

    console.log("Review posted successfully!");

  } catch (error: any) {
    core.setFailed(error.message);
  }
}

run();
