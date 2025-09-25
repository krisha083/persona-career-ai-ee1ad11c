import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateFallbackRoadmap(careerTitle: string, careerDescription: string, requiredSkills: string[], personalityType: string): string {
  const skillsList = requiredSkills.join(', ');
  
  return `# CAREER ROADMAP: ${careerTitle.toUpperCase()}
Generated using AI Fallback System | Personality Type: ${personalityType}

## CAREER OVERVIEW
${careerDescription}

Key Skills Required: ${skillsList}

## 1. IMMEDIATE ACTIONS (0-3 months)

### Getting Started
- Research the ${careerTitle} field thoroughly through industry websites and job postings
- Join professional communities and forums related to ${careerTitle}
- Start building foundational knowledge in: ${requiredSkills.slice(0, 2).join(' and ')}
- Set up professional profiles (LinkedIn, portfolio website)
- Begin networking with professionals in the field

### Skill Development Focus
- Enroll in online courses covering: ${requiredSkills[0]} and ${requiredSkills[1] || 'industry fundamentals'}
- Practice daily with hands-on projects
- Follow industry leaders and thought leaders on social media
- Subscribe to relevant newsletters and podcasts

## 2. SHORT-TERM GOALS (3-12 months)

### Skill Building
- Complete certification programs in core skills: ${skillsList}
- Build 2-3 portfolio projects demonstrating your capabilities
- Attend virtual conferences or workshops in your field
- Start contributing to open-source projects (if applicable)

### Experience & Networking
- Seek internships, volunteer work, or freelance opportunities
- Join professional associations related to ${careerTitle}
- Attend local meetups and industry events
- Find a mentor in the ${careerTitle} field
- Consider informational interviews with professionals

### Portfolio Development
- Create a professional website showcasing your work
- Document your learning journey through blog posts or case studies
- Build projects that demonstrate real-world problem-solving

## 3. MEDIUM-TERM OBJECTIVES (1-3 years)

### Advanced Skill Development
- Master advanced techniques in ${requiredSkills.join(', ')}
- Specialize in a particular niche within ${careerTitle}
- Pursue advanced certifications or consider formal education
- Lead small projects or initiatives

### Professional Growth
- Transition to entry-level positions in the field
- Build a professional network of 50+ contacts
- Start speaking at events or writing industry articles
- Develop leadership and project management skills

### Industry Recognition
- Contribute to industry discussions and forums
- Publish thought leadership content
- Participate in industry competitions or hackathons
- Mentor newcomers to the field

## 4. LONG-TERM CAREER PATH (3+ years)

### Career Advancement
- Progress to mid-level positions with increased responsibilities
- Consider specialization areas within ${careerTitle}
- Develop expertise in emerging technologies or methodologies
- Build and lead teams

### Leadership Development
- Take on management responsibilities
- Develop strategic thinking and business acumen
- Consider pursuing an MBA or advanced degree
- Become a subject matter expert in your specialization

### Industry Impact
- Speak at major industry conferences
- Publish research or thought leadership pieces
- Mentor and develop other professionals
- Consider starting your own company or consultancy

## 5. PERSONALIZED RECOMMENDATIONS FOR ${personalityType.toUpperCase()} PERSONALITY

### Learning Style Recommendations
${personalityType.includes('Introvert') ? 
  '- Focus on self-paced online learning and one-on-one mentoring\n- Leverage written communication and documentation skills\n- Build deep expertise in specialized areas' :
  '- Engage in group learning and collaborative projects\n- Network actively at conferences and events\n- Take on presentation and teaching opportunities'
}

### Career Path Alignment
${personalityType.includes('Thinking') ?
  '- Focus on data-driven decision making and analytical roles\n- Develop expertise in technical problem-solving\n- Consider roles with clear metrics and objectives' :
  '- Emphasize people-focused aspects of the role\n- Develop strong communication and collaboration skills\n- Consider roles involving team leadership or client interaction'
}

### Recommended Resources
- Coursera, Udemy, or Pluralsight for online courses
- LinkedIn Learning for professional development
- Industry-specific blogs and publications
- Professional associations and certification bodies
- Local meetups and networking groups

## 6. POTENTIAL CHALLENGES & SOLUTIONS

### Common Obstacles
- **Skill Gap**: Address through targeted learning and practice
- **Experience Requirements**: Gain through internships, volunteering, and personal projects
- **Network Building**: Overcome through consistent networking and community participation
- **Staying Current**: Maintain through continuous learning and industry engagement

### Success Strategies
- Set measurable, time-bound goals for each phase
- Track progress regularly and adjust plans as needed
- Seek feedback from mentors and peers
- Stay adaptable as the industry evolves
- Maintain work-life balance to prevent burnout

### Alternative Routes
- Consider adjacent roles that can lead to ${careerTitle}
- Explore different industries that need ${careerTitle} skills
- Look into consulting or freelancing opportunities
- Consider hybrid roles that combine ${careerTitle} with other skills

## ACTION PLAN SUMMARY

**Next 30 Days:**
1. Research and identify 3 online courses to start
2. Join 2 professional communities
3. Update your LinkedIn profile
4. Identify 5 professionals to connect with

**Next 90 Days:**
1. Complete first certification
2. Start your first portfolio project
3. Attend your first networking event
4. Connect with a potential mentor

**Next Year:**
1. Build 3 complete portfolio projects
2. Complete 2-3 relevant certifications
3. Attend at least 4 industry events
4. Secure your first role or internship in the field

Remember: This roadmap is a guide. Adapt it based on your specific circumstances, opportunities, and changing industry demands. Success in ${careerTitle} requires consistent effort, continuous learning, and adaptability.`;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { careerTitle, careerDescription, requiredSkills, userProfile, personalityType } = await req.json();

    console.log('Generating roadmap for:', careerTitle);

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Generate a comprehensive, personalized career roadmap for someone interested in becoming a ${careerTitle}.

User Profile:
- Personality Type: ${personalityType}
- User Details: ${userProfile ? JSON.stringify(userProfile) : 'Not provided'}

Career Details:
- Title: ${careerTitle}
- Description: ${careerDescription}
- Required Skills: ${requiredSkills.join(', ')}

Please create a detailed roadmap that includes:

1. IMMEDIATE ACTIONS (0-3 months)
   - Specific first steps to take
   - Skills to start developing
   - Resources to explore

2. SHORT-TERM GOALS (3-12 months)
   - Key milestones to achieve
   - Courses or certifications to pursue
   - Network building strategies

3. MEDIUM-TERM OBJECTIVES (1-3 years)
   - Advanced skill development
   - Experience requirements
   - Portfolio/project recommendations

4. LONG-TERM CAREER PATH (3+ years)
   - Career progression opportunities
   - Leadership development
   - Specialization options

5. PERSONALIZED RECOMMENDATIONS
   - Based on their ${personalityType} personality type
   - Specific resources, courses, or platforms
   - Industry connections and communities to join

6. POTENTIAL CHALLENGES & SOLUTIONS
   - Common obstacles in this career path
   - How to overcome them
   - Alternative routes if needed

Make the roadmap actionable, specific, and tailored to their personality type. Include specific websites, courses, certifications, and tools they should use.`;

    let roadmapContent;

    // Try OpenAI first, but fall back to template-based generation
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { 
              role: 'system', 
              content: 'You are a professional career counselor and expert in career development. Create detailed, actionable career roadmaps that are personalized and practical.' 
            },
            { role: 'user', content: prompt }
          ],
          max_tokens: 2000,
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      roadmapContent = data.choices[0].message.content;
      console.log('Generated roadmap with OpenAI');

    } catch (openAIError) {
      console.log('OpenAI failed, using fallback generator:', openAIError instanceof Error ? openAIError.message : 'Unknown error');
      
      // Fallback: Generate roadmap using template-based approach
      roadmapContent = generateFallbackRoadmap(careerTitle, careerDescription, requiredSkills, personalityType);
    }

    console.log('Roadmap generated successfully');

    return new Response(JSON.stringify({ roadmap: roadmapContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-career-roadmap function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate roadmap', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});