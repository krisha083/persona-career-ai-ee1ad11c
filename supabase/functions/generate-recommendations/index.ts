import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CareerRecommendation {
  career_title: string;
  description: string;
  salary_range: string;
  required_skills: string[];
  growth_prospects: string;
  match_score: number;
}

const CAREER_DATABASE = {
  'R': [
    {
      career_title: "Software Engineer",
      description: "Design, develop, and maintain software applications and systems using various programming languages and frameworks.",
      salary_range: "$70,000 - $150,000",
      required_skills: ["Programming", "Problem Solving", "Software Architecture", "Testing", "Version Control"],
      growth_prospects: "Excellent growth prospects with high demand in tech industry",
      match_score: 85
    },
    {
      career_title: "Mechanical Engineer",
      description: "Design, develop, and test mechanical systems and devices across various industries.",
      salary_range: "$65,000 - $120,000",
      required_skills: ["CAD Software", "Mathematics", "Physics", "Project Management", "Problem Solving"],
      growth_prospects: "Stable growth with opportunities in automation and renewable energy",
      match_score: 90
    }
  ],
  'I': [
    {
      career_title: "Data Scientist",
      description: "Analyze complex data sets to extract insights and build predictive models for business decisions.",
      salary_range: "$80,000 - $160,000",
      required_skills: ["Python/R", "Statistics", "Machine Learning", "SQL", "Data Visualization"],
      growth_prospects: "Very high growth potential with increasing data-driven business needs",
      match_score: 88
    },
    {
      career_title: "Research Scientist",
      description: "Conduct scientific research to advance knowledge in specific fields and develop new technologies.",
      salary_range: "$60,000 - $130,000",
      required_skills: ["Research Methods", "Statistical Analysis", "Scientific Writing", "Laboratory Skills", "Critical Thinking"],
      growth_prospects: "Good growth in biotechnology, pharmaceuticals, and emerging technologies",
      match_score: 92
    }
  ],
  'A': [
    {
      career_title: "UX/UI Designer",
      description: "Create user-friendly interfaces and experiences for digital products and applications.",
      salary_range: "$60,000 - $120,000",
      required_skills: ["Design Software", "User Research", "Prototyping", "Typography", "Color Theory"],
      growth_prospects: "Strong growth with increasing focus on user experience",
      match_score: 85
    },
    {
      career_title: "Content Creator",
      description: "Develop engaging content across various media platforms to build audiences and drive engagement.",
      salary_range: "$40,000 - $100,000",
      required_skills: ["Writing", "Video Editing", "Social Media", "SEO", "Analytics"],
      growth_prospects: "Rapidly growing field with diverse opportunities",
      match_score: 80
    }
  ],
  'S': [
    {
      career_title: "HR Manager",
      description: "Oversee human resources functions including recruitment, employee relations, and organizational development.",
      salary_range: "$55,000 - $120,000",
      required_skills: ["Communication", "Leadership", "Conflict Resolution", "HR Software", "Employment Law"],
      growth_prospects: "Steady growth with increasing focus on employee wellness",
      match_score: 87
    },
    {
      career_title: "Social Worker",
      description: "Help individuals, families, and communities overcome challenges and improve their well-being.",
      salary_range: "$45,000 - $80,000",
      required_skills: ["Counseling", "Case Management", "Crisis Intervention", "Documentation", "Empathy"],
      growth_prospects: "Good growth driven by aging population and mental health awareness",
      match_score: 90
    }
  ],
  'E': [
    {
      career_title: "Business Analyst",
      description: "Analyze business processes and systems to identify improvements and drive organizational efficiency.",
      salary_range: "$60,000 - $110,000",
      required_skills: ["Data Analysis", "Process Mapping", "Communication", "Project Management", "SQL"],
      growth_prospects: "Strong growth with digital transformation initiatives",
      match_score: 83
    },
    {
      career_title: "Sales Manager",
      description: "Lead sales teams to achieve revenue targets and develop strategies for business growth.",
      salary_range: "$50,000 - $130,000",
      required_skills: ["Sales Strategy", "Team Leadership", "CRM Software", "Negotiation", "Market Analysis"],
      growth_prospects: "Good opportunities across all industries",
      match_score: 88
    }
  ],
  'C': [
    {
      career_title: "Financial Analyst",
      description: "Analyze financial data and market trends to provide investment recommendations and financial planning.",
      salary_range: "$55,000 - $100,000",
      required_skills: ["Financial Modeling", "Excel", "Accounting", "Statistics", "Financial Software"],
      growth_prospects: "Steady growth with increasing complexity of financial markets",
      match_score: 85
    },
    {
      career_title: "Project Coordinator",
      description: "Coordinate project activities, timelines, and resources to ensure successful project completion.",
      salary_range: "$45,000 - $85,000",
      required_skills: ["Project Management", "Organization", "Communication", "Time Management", "MS Office"],
      growth_prospects: "Good growth across various industries",
      match_score: 82
    }
  ]
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { user_id } = await req.json()

    if (!user_id) {
      throw new Error('User ID is required')
    }

    console.log('Generating recommendations for user:', user_id)

    // Fetch user's quiz results
    const { data: quizResult, error: quizError } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (quizError) {
      throw new Error(`Failed to fetch quiz results: ${quizError.message}`)
    }

    // Fetch user's profile and skills
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user_id)
      .single()

    const { data: skills } = await supabase
      .from('user_skills')
      .select('skill')
      .eq('user_id', user_id)

    const { data: interests } = await supabase
      .from('user_interests')
      .select('interest')
      .eq('user_id', user_id)

    console.log('User data fetched:', { profile, skills, interests })

    // Get personality type and RIASEC scores
    const personalityType = quizResult.personality_type
    const riasecScores = quizResult.riasec_scores

    // Generate recommendations based on top RIASEC categories
    const sortedRiasec = Object.entries(riasecScores)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 3)

    const recommendations: CareerRecommendation[] = []

    // Get careers from top RIASEC categories
    sortedRiasec.forEach(([category, score], index) => {
      const categoryRecommendations = CAREER_DATABASE[category as keyof typeof CAREER_DATABASE] || []
      
      categoryRecommendations.forEach(career => {
        const adjustedScore = career.match_score - (index * 5) // Slightly lower score for secondary matches
        
        // Boost score if user has relevant skills
        const userSkills = skills?.map(s => s.skill.toLowerCase()) || []
        const relevantSkills = career.required_skills.filter(skill => 
          userSkills.some(userSkill => 
            userSkill.includes(skill.toLowerCase()) || skill.toLowerCase().includes(userSkill)
          )
        )
        
        const skillBoost = Math.min(relevantSkills.length * 3, 15)
        
        recommendations.push({
          ...career,
          match_score: Math.min(adjustedScore + skillBoost, 100)
        })
      })
    })

    // Remove duplicates and sort by match score
    const uniqueRecommendations = recommendations
      .filter((rec, index, self) => 
        self.findIndex(r => r.career_title === rec.career_title) === index
      )
      .sort((a, b) => b.match_score - a.match_score)
      .slice(0, 5) // Top 5 recommendations

    console.log('Generated recommendations:', uniqueRecommendations)

    // Clear existing recommendations
    await supabase
      .from('career_recommendations')
      .delete()
      .eq('user_id', user_id)

    // Insert new recommendations
    const { error: insertError } = await supabase
      .from('career_recommendations')
      .insert(
        uniqueRecommendations.map(rec => ({
          user_id,
          ...rec
        }))
      )

    if (insertError) {
      throw new Error(`Failed to save recommendations: ${insertError.message}`)
    }

    console.log('Recommendations saved successfully')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Recommendations generated successfully',
        count: uniqueRecommendations.length
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error generating recommendations:', error)
    
    return new Response(
      JSON.stringify({ 
        error: (error as Error).message || 'Internal server error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})