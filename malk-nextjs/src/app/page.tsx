'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PostCard from '@/components/PostCard';
import { getAllPosts } from '@/lib/airtable';
import { LatestPost } from '@/components/LatestPost';

export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">Welcome to Malk</h1>
        <p className="text-xl text-center mb-12">Share and discover amazing videos with the Malk community.</p>
        <LatestPost />
      </div>
    </main>
  );
} 