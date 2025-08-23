// ABT Framework Prompts and JSON Schemas
// Accomplishment-Because-Therefore storytelling framework for interview preparation

// JSON Schema for ABT Story Structure
export const ABT_STORY_SCHEMA = {
  type: 'object',
  properties: {
    accomplishment: {
      type: 'string',
      description: 'The specific achievement or result (WHAT you accomplished)',
      minLength: 20,
      maxLength: 300
    },
    because: {
      type: 'string',
      description: 'The context, challenge, or reason (WHY it was important/difficult)',
      minLength: 20,
      maxLength: 300
    },
    therefore: {
      type: 'string',
      description: 'The impact, outcome, or learning (THEREFORE what resulted)',
      minLength: 20,
      maxLength: 300
    },
    fullStory: {
      type: 'string',
      description: 'Complete narrative for interview delivery',
      minLength: 100,
      maxLength: 1000
    }
  },
  required: ['accomplishment', 'because', 'therefore', 'fullStory']
};

// JSON Schema for Scoring Rubric
export const ABT_SCORING_SCHEMA = {
  type: 'object',
  properties: {
    overallScore: {
      type: 'number',
      minimum: 1,
      maximum: 100,
      description: 'Overall story effectiveness score'
    },
    accomplishmentScore: {
      type: 'number',
      minimum: 1,
      maximum: 100,
      description: 'Quality of accomplishment section'
    },
    becauseScore: {
      type: 'number',
      minimum: 1,
      maximum: 100,
      description: 'Quality of because/context section'
    },
    thereforeScore: {
      type: 'number',
      minimum: 1,
      maximum: 100,
      description: 'Quality of therefore/outcome section'
    },
    feedback: {
      type: 'object',
      properties: {
        strengths: {
          type: 'array',
          items: { type: 'string' },
          minItems: 2,
          maxItems: 5,
          description: 'Specific strengths identified'
        },
        improvements: {
          type: 'array',
          items: { type: 'string' },
          minItems: 2,
          maxItems: 5,
          description: 'Areas for improvement'
        },
        suggestions: {
          type: 'array',
          items: { type: 'string' },
          minItems: 2,
          maxItems: 5,
          description: 'Actionable improvement suggestions'
        }
      },
      required: ['strengths', 'improvements', 'suggestions']
    },
    rubric: {
      type: 'object',
      properties: {
        clarity: {
          type: 'number',
          minimum: 1,
          maximum: 100,
          description: 'How clear and well-structured is the story'
        },
        impact: {
          type: 'number',
          minimum: 1,
          maximum: 100,
          description: 'Significance and impressiveness of the achievement'
        },
        specificity: {
          type: 'number',
          minimum: 1,
          maximum: 100,
          description: 'Concrete details, metrics, and tangible examples'
        },
        relevance: {
          type: 'number',
          minimum: 1,
          maximum: 100,
          description: 'Alignment with interview goals and role requirements'
        }
      },
      required: ['clarity', 'impact', 'specificity', 'relevance']
    }
  },
  required: ['overallScore', 'accomplishmentScore', 'becauseScore', 'thereforeScore', 'feedback', 'rubric']
};

// Detailed Generation Prompts
export const ABT_GENERATION_PROMPTS = {
  basic: `Create a compelling interview story using the ABT (Accomplishment-Because-Therefore) framework.

Structure your response as a JSON object with these exact fields:
{
  "accomplishment": "[Specific, measurable achievement with concrete results]",
  "because": "[Context, challenges, obstacles, or importance that made this significant]",
  "therefore": "[Measurable impact, business value, learning, or growth that resulted]",
  "fullStory": "[Cohesive narrative combining all elements for interview delivery]"
}

Ensure each section:
- Uses specific details and metrics where possible
- Demonstrates competence and problem-solving
- Shows personal contribution and ownership
- Includes measurable outcomes or impact
- Is appropriate for professional interview context`,

  leadership: `Create a leadership-focused ABT interview story that demonstrates your ability to lead, influence, and drive results.

Key elements to include:
- Team dynamics and size
- Leadership challenges faced
- Decision-making process
- Influence without authority
- Results achieved through others
- Personal growth as a leader

Structure as JSON with accomplishment, because, therefore, and fullStory fields.
Focus on leadership competencies: vision, communication, delegation, conflict resolution, team building.`,

  technical: `Create a technical achievement story using the ABT framework that showcases your technical expertise and problem-solving skills.

Key elements to include:
- Technical complexity and challenges
- Problem-solving methodology
- Technologies and tools used
- Innovation or creative solutions
- Performance improvements or metrics
- Learning and adaptation

Structure as JSON with accomplishment, because, therefore, and fullStory fields.
Emphasize technical depth while remaining accessible to non-technical interviewers.`,

  collaboration: `Create a collaboration-focused ABT story that demonstrates your ability to work effectively with others and drive cross-functional success.

Key elements to include:
- Stakeholder diversity and challenges
- Communication and alignment strategies
- Conflict resolution or consensus building
- Shared goals and outcomes
- Your specific role in the collaboration
- Relationship building and maintenance

Structure as JSON with accomplishment, because, therefore, and fullStory fields.
Highlight interpersonal skills, emotional intelligence, and teamwork.`,

  innovation: `Create an innovation-focused ABT story that demonstrates your ability to think creatively, drive change, and implement new solutions.

Key elements to include:
- Problem identification and analysis
- Creative or unconventional approach
- Risk assessment and management
- Implementation challenges
- Adoption and change management
- Innovation impact and scalability

Structure as JSON with accomplishment, because, therefore, and fullStory fields.
Showcase creativity, strategic thinking, and change leadership.`
};

// Detailed Scoring Prompts
export const ABT_SCORING_PROMPTS = {
  comprehensive: `Evaluate this ABT interview story using professional scoring criteria and provide detailed feedback.

Scoring Guidelines (1-100 scale):

ACCOMPLISHMENT SECTION (25% weight):
- Specificity: Are there concrete details, metrics, and measurable outcomes?
- Significance: Is the achievement impressive and substantial?
- Clarity: Is what was accomplished clearly stated?
- Ownership: Is personal contribution and responsibility evident?

BECAUSE SECTION (25% weight):
- Context: Is sufficient background provided?
- Challenge: Are obstacles and difficulties clearly articulated?
- Complexity: Is the difficulty level appropriate and believable?
- Relevance: Does the context enhance understanding of the achievement?

THEREFORE SECTION (25% weight):
- Impact: Are outcomes measurable and significant?
- Business Value: Is value to organization/team/customers clear?
- Learning: Is personal/professional growth demonstrated?
- Follow-through: Are long-term effects or applications mentioned?

OVERALL RUBRIC (25% weight):
- Clarity: Story structure, flow, and comprehensibility
- Impact: Impressiveness and significance of overall story
- Specificity: Concrete details throughout
- Relevance: Alignment with interview goals and professional context

Provide scores, detailed feedback, and actionable improvement suggestions.
Return as JSON matching the scoring schema exactly.`,

  behavioral: `Evaluate this ABT story specifically for behavioral interview effectiveness.

Focus on:
- STAR/ABT structure completeness
- Behavioral competency demonstration
- Specific vs. general examples
- Personal accountability and ownership
- Results orientation
- Professional maturity
- Storytelling effectiveness

Provide targeted feedback for behavioral interview success.
Return as JSON with scores and behavioral-focused feedback.`,

  technical_assessment: `Evaluate this ABT story for technical interview effectiveness.

Focus on:
- Technical complexity demonstration
- Problem-solving methodology
- Innovation and creativity
- Technical communication clarity
- Learning and adaptation
- Impact on technical systems/processes
- Scalability and best practices

Provide feedback specifically for technical roles and audiences.
Return as JSON with scores and technical-focused feedback.`,

  leadership_assessment: `Evaluate this ABT story for leadership interview effectiveness.

Focus on:
- Leadership competencies displayed
- Team and stakeholder management
- Decision-making under pressure
- Vision and strategic thinking
- Influence and persuasion
- Change management
- Results through others

Provide feedback specifically for leadership roles and competencies.
Return as JSON with scores and leadership-focused feedback.`
};

// Industry-Specific Prompt Templates
export const INDUSTRY_PROMPTS = {
  technology: `Create an ABT story relevant to the technology industry, focusing on:
- Innovation and technical solutions
- Agile/lean methodologies
- User experience and customer impact
- Scale and performance optimization
- Data-driven decision making
- Cross-functional collaboration`,

  finance: `Create an ABT story relevant to the finance industry, focusing on:
- Risk management and mitigation
- Process improvement and efficiency
- Regulatory compliance
- Financial analysis and insights
- Stakeholder communication
- Cost reduction or revenue generation`,

  healthcare: `Create an ABT story relevant to the healthcare industry, focusing on:
- Patient outcomes and safety
- Regulatory compliance
- Process improvement
- Quality metrics and standards
- Interdisciplinary collaboration
- Cost efficiency and resource optimization`,

  consulting: `Create an ABT story relevant to the consulting industry, focusing on:
- Client relationship management
- Problem diagnosis and solution design
- Stakeholder alignment
- Change management
- Analytical frameworks
- Value delivery and impact measurement`,

  startup: `Create an ABT story relevant to startup environments, focusing on:
- Resource constraints and creativity
- Rapid iteration and learning
- Customer discovery and validation
- Growth and scaling challenges
- Cross-functional ownership
- Uncertainty and adaptability`
};

// Role Level Adjustments
export const ROLE_LEVEL_PROMPTS = {
  junior: `Tailor the story for a junior-level position, emphasizing:
- Learning and growth mindset
- Initiative and proactivity
- Collaboration and mentorship received
- Foundation building and skill development
- Contribution within scope
- Eagerness and potential`,

  mid: `Tailor the story for a mid-level position, emphasizing:
- Independent execution and ownership
- Cross-functional collaboration
- Process improvement and optimization
- Mentoring others
- Strategic contribution
- Subject matter expertise`,

  senior: `Tailor the story for a senior-level position, emphasizing:
- Strategic thinking and planning
- Leadership and influence
- System-level impact
- Organizational change
- Technical/domain expertise
- Stakeholder management`,

  executive: `Tailor the story for an executive-level position, emphasizing:
- Organizational vision and strategy
- Enterprise-wide impact
- Board and investor relations
- Cultural transformation
- P&L responsibility
- Market and competitive positioning`
};

// Improvement Suggestions Templates
export const IMPROVEMENT_TEMPLATES = {
  specificity: [
    "Add specific metrics or numbers to quantify your achievement",
    "Include concrete details about tools, methods, or processes used",
    "Specify timeframes, team sizes, or budget constraints",
    "Mention specific stakeholders, departments, or systems involved",
    "Add measurable outcomes or KPIs that improved"
  ],
  
  impact: [
    "Explain the business value or organizational benefit",
    "Connect your work to broader company goals or strategy",
    "Describe long-term effects or ongoing benefits",
    "Mention how others benefited from your work",
    "Quantify cost savings, revenue generation, or efficiency gains"
  ],
  
  clarity: [
    "Simplify technical jargon for broader audience understanding",
    "Improve the logical flow between accomplishment, because, and therefore",
    "Add context to help the interviewer understand the situation",
    "Clarify your specific role versus team contributions",
    "Structure the story with clear beginning, middle, and end"
  ],
  
  ownership: [
    "Emphasize your personal contribution and decision-making",
    "Clarify what you specifically did versus what your team did",
    "Highlight your initiative and proactive approach",
    "Mention challenges you personally overcame",
    "Show accountability for both successes and difficulties"
  ]
};
