'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft, User, Briefcase, GraduationCap, Code, Printer, Plus, Trash2, LayoutTemplate } from 'lucide-react';
import Link from 'next/link';

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Education {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
}

export default function ResumeBuilder() {
  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'skills-projects'>('personal');
  const [template, setTemplate] = useState<'modern' | 'classic' | 'minimal'>('modern');

  // Resume Data State
  const [personalInfo, setPersonalInfo] = useState({
    fullName: 'Jane Doe',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 019-2834',
    location: 'San Francisco, CA',
    website: 'https://janedoe.dev',
    summary: 'Detail-oriented and passionate software engineer with 4+ years of experience designing and implementing scalable web applications. Strong expert in TypeScript, React, and server architectures.'
  });

  const [experience, setExperience] = useState<Experience[]>([
    {
      id: 'exp-1',
      company: 'Tech Solutions Inc.',
      position: 'Senior Frontend Developer',
      startDate: '2022-06',
      endDate: '',
      current: true,
      description: 'Lead a team of 4 engineers to build next-generation SaaS dashboards. Redesigned internal charting tools, resulting in a 40% performance gain.'
    },
    {
      id: 'exp-2',
      company: 'AppForge Studio',
      position: 'Web Developer',
      startDate: '2020-03',
      endDate: '2022-05',
      current: false,
      description: 'Maintained and deployed 15+ client web applications. Integrated payment APIs and optimized CSS layout modules for responsive viewing.'
    }
  ]);

  const [education, setEducation] = useState<Education[]>([
    {
      id: 'edu-1',
      school: 'State Tech University',
      degree: 'Bachelor of Science',
      fieldOfStudy: 'Computer Science',
      startDate: '2016-09',
      endDate: '2020-05',
      current: false,
      description: 'Graduated with honors. Teaching assistant for Data Structures.'
    }
  ]);

  const [skills, setSkills] = useState<string>('TypeScript, React, Next.js, Node.js, Express, PostgreSQL, Tailwind CSS, Git, Docker');

  const [projects, setProjects] = useState<Project[]>([
    {
      id: 'proj-1',
      name: 'TaskDeck Platform',
      description: 'A visual task collaboration dashboard supporting offline editing and web socket syncing.',
      url: 'https://github.com/example/taskdeck'
    }
  ]);

  // Actions for lists
  const addExperience = () => {
    setExperience([
      ...experience,
      {
        id: `exp-${Date.now()}`,
        company: '',
        position: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }
    ]);
  };

  const removeExperience = (id: string) => {
    setExperience(experience.filter((x) => x.id !== id));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setExperience(experience.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        id: `edu-${Date.now()}`,
        school: '',
        degree: '',
        fieldOfStudy: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }
    ]);
  };

  const removeEducation = (id: string) => {
    setEducation(education.filter((x) => x.id !== id));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setEducation(education.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  };

  const addProject = () => {
    setProjects([
      ...projects,
      {
        id: `proj-${Date.now()}`,
        name: '',
        description: '',
        url: ''
      }
    ]);
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter((x) => x.id !== id));
  };

  const updateProject = (id: string, field: keyof Project, value: any) => {
    setProjects(projects.map((x) => (x.id === id ? { ...x, [field]: value } : x)));
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full flex-grow flex flex-col print:p-0">
      {/* Hide header in print */}
      <div className="print:hidden flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-900 mb-8">
        <div>
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-2">
            <ArrowLeft className="h-4 w-4" /> Back to dashboard
          </Link>
          <h1 className="text-3xl font-extrabold text-white">Interactive Resume Builder</h1>
          <p className="text-slate-400 text-sm mt-1">
            Build your resume, choose a template, and export to PDF.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800">
            <button
              onClick={() => setTemplate('modern')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                template === 'modern' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Modern
            </button>
            <button
              onClick={() => setTemplate('classic')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                template === 'classic' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Classic
            </button>
            <button
              onClick={() => setTemplate('minimal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                template === 'minimal' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Minimal
            </button>
          </div>

          <button
            onClick={triggerPrint}
            className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-500 shadow shadow-violet-600/30 transition-all"
          >
            <Printer className="h-4 w-4" /> Export PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full flex-grow print:grid-cols-1 print:gap-0">
        {/* Left Form Panel: Hidden during print */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          {/* Form Tabs */}
          <div className="flex border-b border-slate-900 pb-2 overflow-x-auto gap-2">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'personal'
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-slate-500 hover:text-slate-350'
              }`}
            >
              <User className="h-4 w-4" /> Personal
            </button>
            <button
              onClick={() => setActiveTab('experience')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'experience'
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-slate-500 hover:text-slate-350'
              }`}
            >
              <Briefcase className="h-4 w-4" /> Experience
            </button>
            <button
              onClick={() => setActiveTab('education')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'education'
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-slate-500 hover:text-slate-350'
              }`}
            >
              <GraduationCap className="h-4 w-4" /> Education
            </button>
            <button
              onClick={() => setActiveTab('skills-projects')}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                activeTab === 'skills-projects'
                  ? 'border-violet-500 text-violet-400'
                  : 'border-transparent text-slate-500 hover:text-slate-350'
              }`}
            >
              <Code className="h-4 w-4" /> Skills & Projects
            </button>
          </div>

          {/* Form Content */}
          <div className="rounded-2xl border border-slate-900 bg-slate-900/30 p-6 space-y-4 max-h-[600px] overflow-y-auto">
            {activeTab === 'personal' && (
              <div className="space-y-4 animate-in fade-in duration-150">
                <h3 className="text-base font-bold text-white mb-2">Personal Details</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Full Name</label>
                  <input
                    type="text"
                    value={personalInfo.fullName}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</label>
                    <input
                      type="email"
                      value={personalInfo.email}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
                    <input
                      type="text"
                      value={personalInfo.phone}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Location</label>
                    <input
                      type="text"
                      value={personalInfo.location}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Website</label>
                    <input
                      type="text"
                      value={personalInfo.website}
                      onChange={(e) => setPersonalInfo({ ...personalInfo, website: e.target.value })}
                      className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Professional Summary</label>
                  <textarea
                    value={personalInfo.summary}
                    rows={4}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, summary: e.target.value })}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'experience' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Work Experience</h3>
                  <button
                    onClick={addExperience}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    <Plus className="h-4 w-4" /> Add Experience
                  </button>
                </div>

                {experience.map((exp, idx) => (
                  <div key={exp.id} className="border-t border-slate-900 pt-4 first:border-0 first:pt-0 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-semibold">Position #{idx + 1}</span>
                      <button
                        onClick={() => removeExperience(exp.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</label>
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Position</label>
                        <input
                          type="text"
                          value={exp.position}
                          onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start Date</label>
                        <input
                          type="month"
                          value={exp.startDate}
                          onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">End Date</label>
                        <input
                          type="month"
                          disabled={exp.current}
                          value={exp.endDate}
                          onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none disabled:opacity-50"
                        />
                      </div>
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={exp.current}
                        onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-slate-800 bg-slate-950 text-violet-600 accent-violet-500"
                      />
                      <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">I currently work here</span>
                    </label>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Responsibilities</label>
                      <textarea
                        value={exp.description}
                        rows={3}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'education' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white">Academic History</h3>
                  <button
                    onClick={addEducation}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    <Plus className="h-4 w-4" /> Add Education
                  </button>
                </div>

                {education.map((edu, idx) => (
                  <div key={edu.id} className="border-t border-slate-900 pt-4 first:border-0 first:pt-0 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-semibold">Degree #{idx + 1}</span>
                      <button
                        onClick={() => removeEducation(edu.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">School / University</label>
                        <input
                          type="text"
                          value={edu.school}
                          onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Degree</label>
                        <input
                          type="text"
                          value={edu.degree}
                          onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Field of Study</label>
                        <input
                          type="text"
                          value={edu.fieldOfStudy}
                          onChange={(e) => updateEducation(edu.id, 'fieldOfStudy', e.target.value)}
                          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Start</label>
                          <input
                            type="month"
                            value={edu.startDate}
                            onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                          />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">End</label>
                          <input
                            type="month"
                            value={edu.endDate}
                            onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white focus:border-violet-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'skills-projects' && (
              <div className="space-y-6 animate-in fade-in duration-150">
                <h3 className="text-base font-bold text-white">Skills & Side Projects</h3>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Skills (Comma Separated)</label>
                  <textarea
                    value={skills}
                    rows={3}
                    onChange={(e) => setSkills(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-between border-t border-slate-900 pt-4">
                  <h4 className="text-sm font-bold text-white">Projects</h4>
                  <button
                    onClick={addProject}
                    className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 font-semibold"
                  >
                    <Plus className="h-4 w-4" /> Add Project
                  </button>
                </div>

                {projects.map((proj, idx) => (
                  <div key={proj.id} className="border-t border-slate-900 pt-4 first:border-0 first:pt-0 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-slate-500 font-semibold">Project #{idx + 1}</span>
                      <button
                        onClick={() => removeProject(proj.id)}
                        className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</label>
                        <input
                          type="text"
                          value={proj.name}
                          onChange={(e) => updateProject(proj.id, 'name', e.target.value)}
                          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">URL Link</label>
                        <input
                          type="text"
                          value={proj.url}
                          onChange={(e) => updateProject(proj.id, 'url', e.target.value)}
                          className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Description</label>
                      <textarea
                        value={proj.description}
                        rows={2}
                        onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                        className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none resize-none"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Preview Sheet Panel */}
        <div className="lg:col-span-7 flex justify-center sticky top-24 print:static print:col-span-1 print:block">
          <div
            id="resume-sheet"
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-950 p-12 shadow-2xl rounded-2xl print:shadow-none print:rounded-none print:p-0 print:m-0 border border-slate-200 print:border-0 ${
              template === 'classic' ? 'font-serif' : 'font-sans'
            }`}
          >
            {/* Header Area */}
            <div className="text-center border-b-2 border-slate-950 pb-6 mb-6">
              <h2 className="text-3xl font-extrabold tracking-tight uppercase">{personalInfo.fullName}</h2>
              <div className="mt-2.5 flex flex-wrap justify-center gap-4 text-xs font-semibold text-slate-650">
                {personalInfo.email && <span>{personalInfo.email}</span>}
                {personalInfo.phone && <span>• {personalInfo.phone}</span>}
                {personalInfo.location && <span>• {personalInfo.location}</span>}
                {personalInfo.website && <span>• {personalInfo.website}</span>}
              </div>
            </div>

            {/* Summary */}
            {personalInfo.summary && (
              <div className="mb-6">
                <h3 className={`text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 ${
                  template === 'modern' ? 'text-violet-900 border-violet-100' : 'text-slate-950'
                }`}>
                  Professional Profile
                </h3>
                <p className="text-xs leading-relaxed text-slate-800 text-justify">{personalInfo.summary}</p>
              </div>
            )}

            {/* Experience */}
            {experience.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3.5 ${
                  template === 'modern' ? 'text-violet-900 border-violet-100' : 'text-slate-950'
                }`}>
                  Professional Experience
                </h3>
                <div className="space-y-4">
                  {experience.map((exp) => (
                    <div key={exp.id} className="text-xs">
                      <div className="flex justify-between font-bold">
                        <span>{exp.position} — <span className="font-semibold text-slate-700">{exp.company}</span></span>
                        <span className="text-slate-600">
                          {exp.startDate} to {exp.current ? 'Present' : exp.endDate}
                        </span>
                      </div>
                      {exp.description && (
                        <p className="mt-1.5 leading-relaxed text-slate-800 whitespace-pre-wrap">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {education.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3.5 ${
                  template === 'modern' ? 'text-violet-900 border-violet-100' : 'text-slate-950'
                }`}>
                  Education History
                </h3>
                <div className="space-y-3">
                  {education.map((edu) => (
                    <div key={edu.id} className="text-xs">
                      <div className="flex justify-between font-bold">
                        <span>{edu.degree} in {edu.fieldOfStudy}</span>
                        <span className="text-slate-600">{edu.school}</span>
                      </div>
                      <div className="text-slate-500 font-semibold mt-0.5">
                        Graduation: {edu.endDate || 'N/A'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills && (
              <div className="mb-6">
                <h3 className={`text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-2 ${
                  template === 'modern' ? 'text-violet-900 border-violet-100' : 'text-slate-950'
                }`}>
                  Skills Summary
                </h3>
                <div className="flex flex-wrap gap-2 pt-1">
                  {skills.split(',').map((skill, i) => (
                    <span
                      key={i}
                      className={`text-xs px-2.5 py-1 font-semibold rounded border ${
                        template === 'modern'
                          ? 'bg-violet-50 text-violet-900 border-violet-100'
                          : 'bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Projects */}
            {projects.length > 0 && (
              <div className="mb-6">
                <h3 className={`text-sm font-bold uppercase tracking-wider border-b border-slate-300 pb-1 mb-3.5 ${
                  template === 'modern' ? 'text-violet-900 border-violet-100' : 'text-slate-950'
                }`}>
                  Featured Projects
                </h3>
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div key={proj.id} className="text-xs">
                      <div className="flex justify-between font-bold">
                        <span>{proj.name}</span>
                        {proj.url && <span className="text-violet-750 hover:underline">{proj.url}</span>}
                      </div>
                      {proj.description && <p className="mt-1 text-slate-800 leading-relaxed">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
