import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const roadmapContent = data.choices[0].message.content;

    console.log('Roadmap generated successfully');

    return new Response(JSON.stringify({ roadmap: roadmapContent }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-career-roadmap function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate roadmap', 
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});