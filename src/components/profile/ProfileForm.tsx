import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Profile {
  name: string;
  age: number;
  gender: string;
  education_level: string;
  cgpa: number;
}

export default function ProfileForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile>({
    name: "",
    age: 0,
    gender: "",
    education_level: "",
    cgpa: 0
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newInterest, setNewInterest] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchSkillsAndInterests();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user?.id)
      .maybeSingle();
    
    if (data) {
      setProfile({
        name: data.name || "",
        age: data.age || 0,
        gender: data.gender || "",
        education_level: data.education_level || "",
        cgpa: data.cgpa || 0
      });
    }
  };

  const fetchSkillsAndInterests = async () => {
    const [skillsRes, interestsRes] = await Promise.all([
      supabase.from('user_skills').select('skill').eq('user_id', user?.id),
      supabase.from('user_interests').select('interest').eq('user_id', user?.id)
    ]);

    if (skillsRes.data) setSkills(skillsRes.data.map(s => s.skill));
    if (interestsRes.data) setInterests(interestsRes.data.map(i => i.interest));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Update or insert profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profile)
        .eq('user_id', user.id);

      if (profileError) throw profileError;

      // Update skills
      await supabase.from('user_skills').delete().eq('user_id', user.id);
      if (skills.length > 0) {
        const { error: skillsError } = await supabase
          .from('user_skills')
          .insert(skills.map(skill => ({ user_id: user.id, skill })));
        if (skillsError) throw skillsError;
      }

      // Update interests
      await supabase.from('user_interests').delete().eq('user_id', user.id);
      if (interests.length > 0) {
        const { error: interestsError } = await supabase
          .from('user_interests')
          .insert(interests.map(interest => ({ user_id: user.id, interest })));
        if (interestsError) throw interestsError;
      }

      toast({
        title: "Profile Updated!",
        description: "Your profile has been saved successfully."
      });

      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    }
    
    setLoading(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center mb-6">
            <Button variant="ghost" onClick={() => navigate('/')} className="mr-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="h-5 w-5 mr-2 text-primary" />
                Complete Your Profile
              </CardTitle>
              <CardDescription>
                Tell us about yourself to get personalized career recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age">Age</Label>
                    <Input
                      id="age"
                      type="number"
                      min="16"
                      max="65"
                      value={profile.age || ""}
                      onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={profile.gender} onValueChange={(value) => setProfile({ ...profile, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="education">Education Level</Label>
                    <Select value={profile.education_level} onValueChange={(value) => setProfile({ ...profile, education_level: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select education level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high-school">High School</SelectItem>
                        <SelectItem value="diploma">Diploma</SelectItem>
                        <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                        <SelectItem value="masters">Master's Degree</SelectItem>
                        <SelectItem value="phd">PhD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cgpa">CGPA/GPA (out of 10 or 4)</Label>
                  <Input
                    id="cgpa"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={profile.cgpa || ""}
                    onChange={(e) => setProfile({ ...profile, cgpa: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                {/* Skills Section */}
                <div className="space-y-4">
                  <Label>Skills</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a skill (e.g., Python, Communication)"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    />
                    <Button type="button" onClick={addSkill} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {skill}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeSkill(skill)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Interests Section */}
                <div className="space-y-4">
                  <Label>Interests</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add an interest (e.g., Technology, Art)"
                      value={newInterest}
                      onChange={(e) => setNewInterest(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                    />
                    <Button type="button" onClick={addInterest} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {interests.map((interest, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {interest}
                        <X className="h-3 w-3 cursor-pointer" onClick={() => removeInterest(interest)} />
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}