import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Target, Users, CheckCircle, Code, Layers, Server, Activity, ArrowRight } from 'lucide-react';

export default function About() {
  const objectives = [
    'Empower citizens with direct, transparent reporting of public infrastructure failures.',
    'Eliminate municipal paper bottlenecks using real-time dispatch and automated routing.',
    'Enable ground-level accountability with mandatory before/after photograph proof.',
    'Provide data-driven civic intelligence to city planners for preventive maintenance.',
    'Implement a full DevOps CI/CD and Kubernetes pipeline as a production benchmark.'
  ];

  const stakeholders = [
    {
      role: 'Citizens',
      benefit: 'No more waiting at municipal offices or unanswered emails. Simply snap a photo, drop a pin, and watch progress updates on your phone in real time.',
      icon: Users,
      color: 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
    },
    {
      role: 'Municipal Administrators',
      benefit: 'A centralized operational cockpit to review grievances, weed out spam, allocate workloads evenly among field workers, and track ward-by-ward performance metrics.',
      icon: Shield,
      color: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
    },
    {
      role: 'Municipal Field Workers',
      benefit: 'Direct access to assigned task locations on interactive maps, clear instructions, and one-tap photo uploads to confirm work completion on-site.',
      icon: CheckCircle,
      color: 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
    }
  ];

  return (
    <div className="py-12 sm:py-16 space-y-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-widest bg-sky-50 dark:bg-sky-950/60 px-3 py-1 rounded-full border border-sky-100 dark:border-sky-800">
          About CivicConnect
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Transforming Municipal Grievance Redressal through Civic-Tech
        </h1>
        <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
          CivicConnect is an open civic-tech platform that pairs full-stack React and Node.js engineering with automated DevOps pipelines to solve public infrastructure challenges.
        </p>
      </div>

      {/* Problem Statement & Mission Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-xl space-y-4 border border-transparent dark:border-slate-800">
          <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">The Problem</span>
          <h2 className="text-2xl font-black">Broken Roads, Uncollected Waste & No Accountability</h2>
          <p className="text-slate-300 text-sm leading-relaxed">
            In most cities, reporting a pothole, a burst water pipe, or overflowing trash involves endless visits to municipal offices, unanswered paper petitions, or unmonitored social media complaints.
          </p>
          <p className="text-slate-300 text-sm leading-relaxed">
            Field workers rarely receive accurate coordinates, and citizens are left in the dark about when or if their problems will ever be fixed.
          </p>
        </div>

        <div className="bg-sky-50 dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-3xl p-8 sm:p-10 space-y-4">
          <span className="text-xs font-bold text-sky-700 dark:text-sky-400 uppercase tracking-wider">Our Solution</span>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Geotagged Evidence, Role-Based Redressal & Open Tracking</h2>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            CivicConnect provides a unified portal where every citizen report is pinned on OpenStreetMap with photo proof. Municipal administrators authenticate and dispatch work to field teams, and resolutions are validated before closing.
          </p>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
            Every step is recorded with transparent timestamps and visible audit logs, restoring trust between citizens and civic authorities.
          </p>
        </div>
      </div>

      {/* Objectives List */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-8 sm:p-10 shadow-xs">
        <div className="flex items-center space-x-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-900 dark:bg-slate-800 text-sky-400 border border-transparent dark:border-slate-700">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Key Project Objectives</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">What CivicConnect achieves in urban infrastructure management</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {objectives.map((obj, i) => (
            <div key={i} className="flex items-start space-x-3 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">{obj}</p>
            </div>
          ))}
        </div>
      </div>

      {/* How it Helps Stakeholders */}
      <div className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Who Benefits from CivicConnect?</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Empowering every stakeholder in the civic ecosystem</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stakeholders.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div key={idx} className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${s.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">{s.role}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.benefit}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Technology & DevOps Architecture Highlights */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-transparent dark:border-slate-800">
        <span className="text-xs font-bold text-sky-400 uppercase tracking-widest">DevOps & Full-Stack Rigor</span>
        <h2 className="text-3xl font-black tracking-tight max-w-2xl mx-auto">
          Built as an Enterprise-Grade Production System
        </h2>
        <p className="text-slate-300 text-sm max-w-2xl mx-auto leading-relaxed">
          From multi-stage Docker builds and Jenkins automated CI/CD pipelines to Kubernetes horizontal autoscaling and Prometheus observability, CivicConnect demonstrates modern software engineering at every layer.
        </p>

        <div className="pt-4 flex flex-wrap justify-center gap-3 text-xs font-medium">
          <span className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">React 18 + Vite</span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">Tailwind CSS</span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">Node.js Express</span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">MongoDB Atlas</span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">Docker & Compose</span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">Kubernetes (k8s)</span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">Jenkins CI/CD</span>
          <span className="px-3.5 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">Prometheus & Grafana</span>
        </div>
      </div>
    </div>
  );
}
