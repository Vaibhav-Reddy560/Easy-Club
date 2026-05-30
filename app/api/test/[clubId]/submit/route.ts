import { NextResponse } from 'next/server';
import { db } from '@/lib/services/firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { Club, Question, TestAttempt, ClubMember } from '@/lib/types';

export async function POST(request: Request, { params }: { params: Promise<{ clubId: string }> }) {
  try {
    const { clubId } = await params;
    
    if (!clubId) {
      return NextResponse.json({ error: 'Club ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, answers } = body;

    if (!name || !email || !answers) {
      return NextResponse.json({ error: 'Name, email, and answers are required' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Firebase database not initialized' }, { status: 500 });
    }

    const clubRef = doc(db, 'clubs', clubId);
    let clubSnap;
    try {
      clubSnap = await getDoc(clubRef);
    } catch (e: any) {
      if (e.code === 'permission-denied') {
         return NextResponse.json({ 
          error: 'Firebase Security Rules are blocking access. Please update your firestore.rules to allow read/write for test submissions.' 
        }, { status: 403 });
      }
      throw e;
    }

    if (!clubSnap.exists()) {
      return NextResponse.json({ error: 'Club not found' }, { status: 404 });
    }

    const club = clubSnap.data() as Club;

    if (club.membershipConfig?.mode !== 'test-based' || !club.membershipConfig.testDetails) {
      return NextResponse.json({ error: 'This club does not have an active online test' }, { status: 404 });
    }

    // Check if member already exists
    const existingMember = (club.members || []).find(m => m.email.toLowerCase() === email.toLowerCase());
    if (existingMember) {
      return NextResponse.json({ error: 'You are already a member of this club' }, { status: 400 });
    }

    // Evaluate answers
    const testDetails = club.membershipConfig.testDetails;
    const questions = testDetails.questions || [];
    const passPercentage = testDetails.passPercentage || 60;
    
    let totalScore = 0;
    let maxScore = 0;

    questions.forEach((q: Question) => {
      maxScore += q.marks;
      const submittedAnswer = answers[q.id];

      if (q.type === 'mcq' || q.type === 'short') {
        if (typeof submittedAnswer === 'string' && typeof q.correctAnswer === 'string' && submittedAnswer.trim().toLowerCase() === (q.correctAnswer).trim().toLowerCase()) {
          totalScore += q.marks;
        }
      } else if (q.type === 'multi') {
        const correctAnswers = q.correctAnswer as string[];
        if (Array.isArray(submittedAnswer)) {
          const isCorrect = correctAnswers.length === submittedAnswer.length && 
                            correctAnswers.every(a => submittedAnswer.includes(a));
          if (isCorrect) {
            totalScore += q.marks;
          }
        }
      }
    });

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const passed = percentage >= passPercentage;

    const attempt: TestAttempt = {
      id: Math.random().toString(36).substring(2, 15),
      userId: email,
      name,
      answers,
      score: totalScore,
      total: maxScore,
      percentage,
      passed,
      timestamp: new Date().toISOString()
    };

    // Construct updates
    const updates: Record<string, any> = {};

    if (passed) {
      const newMember: ClubMember = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        role: 'General Member',
        joinDate: new Date().toISOString().split('T')[0],
        basis: 'Test Passed',
        testDetails: `Online Test: Scored ${totalScore}/${maxScore} (${Math.round(percentage)}%)`
      };
      updates['members'] = arrayUnion(newMember);
      updates['memberEmails'] = arrayUnion(email);
    }

    if (Object.keys(updates).length > 0) {
      try {
        await updateDoc(clubRef, updates);
      } catch(e: any) {
        if (e.code === 'permission-denied') {
          return NextResponse.json({ 
            error: 'You passed the test, but Firebase Rules blocked saving your membership. Update firestore.rules to allow write access.' 
          }, { status: 403 });
        }
        throw e;
      }
    }

    return NextResponse.json({
      score: totalScore,
      total: maxScore,
      percentage: Math.round(percentage),
      passed
    });

  } catch (error) {
    console.error('Error submitting test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
